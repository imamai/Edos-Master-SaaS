import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartProduct {
  id: string
  sku: string
  name: string
  selling_price: number
  wholesale_price?: number | null
  vat_rate: number
  unit: string
  stock_quantity?: number
  barcode?: string
  image_url?: string
  /** True for a one-off item typed in at checkout that isn't in the product
   *  catalog — has no real product_id, stock, or catalog price to validate. */
  is_custom?: boolean
}

export type PriceMode = 'retail' | 'wholesale'

export function priceForMode(product: CartProduct, mode: PriceMode): number {
  if (mode === 'wholesale' && product.wholesale_price != null) return product.wholesale_price
  return product.selling_price
}

export interface CartItem {
  product: CartProduct
  quantity: number
  unit_price: number
  discount_amount: number
  tax_amount: number
  total_price: number
}

export interface CartCustomer {
  id: string
  name: string
  phone?: string
  email?: string
  credit_limit: number
  outstanding_balance: number
  loyalty_points: number
}

interface CartState {
  items: CartItem[]
  customer: CartCustomer | null
  discountType: 'percent' | 'fixed'
  discountValue: number
  notes: string
  priceMode: PriceMode

  addItem: (product: CartProduct, qty?: number) => void
  /** Adds a one-off, manually-priced line item not in the product catalog. */
  addCustomItem: (input: { name: string; unit_price: number; quantity: number; vat_rate?: number }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  updateItemDiscount: (productId: string, discount: number) => void
  setCustomer: (customer: CartCustomer | null) => void
  setDiscount: (type: 'percent' | 'fixed', value: number) => void
  setNotes: (notes: string) => void
  /** Switches retail/wholesale and re-prices every item already in the cart
   *  (any manual item discount is kept, so the customer isn't overcharged). */
  setPriceMode: (mode: PriceMode) => void
  clearCart: () => void

  subtotal: () => number
  totalDiscount: () => number
  totalTax: () => number
  totalAmount: () => number
  /** Items with the cart-wide discount prorated into each item's discount_amount/tax_amount/total_price,
   *  so that sum(total_price) === totalAmount() and tax is computed off the price actually paid. */
  reconciledItems: () => CartItem[]
}

function computeItemTotal(item: CartItem): CartItem {
  const base = item.unit_price * item.quantity
  const afterDiscount = base - item.discount_amount
  const tax = (afterDiscount * (item.product.vat_rate || 16)) / 116
  return { ...item, tax_amount: tax, total_price: afterDiscount }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      discountType: 'fixed',
      discountValue: 0,
      notes: '',
      priceMode: 'retail',

      addItem: (product, qty = 1) => {
        const existing = get().items.find((i) => i.product.id === product.id)
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product.id === product.id
                ? computeItemTotal({ ...i, quantity: i.quantity + qty })
                : i
            ),
          }))
        } else {
          const item: CartItem = computeItemTotal({
            product,
            quantity: qty,
            unit_price: priceForMode(product, get().priceMode),
            discount_amount: 0,
            tax_amount: 0,
            total_price: 0,
          })
          set((state) => ({ items: [...state.items, item] }))
        }
      },

      addCustomItem: ({ name, unit_price, quantity, vat_rate }) => {
        const product: CartProduct = {
          id: `custom-${crypto.randomUUID()}`,
          sku: 'CUSTOM',
          name,
          selling_price: unit_price,
          vat_rate: vat_rate ?? 16,
          unit: 'item',
          is_custom: true,
        }
        const item: CartItem = computeItemTotal({
          product,
          quantity,
          unit_price,
          discount_amount: 0,
          tax_amount: 0,
          total_price: 0,
        })
        set((state) => ({ items: [...state.items, item] }))
      },

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),

      updateQuantity: (productId, qty) => {
        if (qty <= 0) { get().removeItem(productId); return }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? computeItemTotal({ ...i, quantity: qty }) : i
          ),
        }))
      },

      updateItemDiscount: (productId, discount) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? computeItemTotal({ ...i, discount_amount: discount }) : i
          ),
        })),

      setCustomer: (customer) => set({ customer }),
      setDiscount: (type, value) => set({ discountType: type, discountValue: value }),
      setNotes: (notes) => set({ notes }),
      setPriceMode: (mode) => set((state) => ({
        priceMode: mode,
        items: state.items.map((i) =>
          computeItemTotal({ ...i, unit_price: priceForMode(i.product, mode) })
        ),
      })),
      clearCart: () => set({ items: [], customer: null, discountType: 'fixed', discountValue: 0, notes: '', priceMode: 'retail' }),

      subtotal: () => get().items.reduce((s, i) => s + i.unit_price * i.quantity, 0),
      totalDiscount: () => {
        const itemDiscounts = get().items.reduce((s, i) => s + i.discount_amount, 0)
        const { discountType, discountValue } = get()
        const cartDiscount = discountType === 'percent'
          ? (get().subtotal() * discountValue) / 100
          : discountValue
        return itemDiscounts + cartDiscount
      },
      totalTax: () => get().reconciledItems().reduce((s, i) => s + i.tax_amount, 0),
      totalAmount: () => get().subtotal() - get().totalDiscount(),

      reconciledItems: () => {
        const state = get()
        const items = state.items
        const netSubtotal = items.reduce((s, i) => s + i.total_price, 0)
        const cartDiscount = state.discountType === 'percent'
          ? (state.subtotal() * state.discountValue) / 100
          : state.discountValue
        if (cartDiscount <= 0 || netSubtotal <= 0) return items
        return items.map((i) => {
          const share = i.total_price / netSubtotal
          const itemCartDiscount = cartDiscount * share
          const newTotalPrice = i.total_price - itemCartDiscount
          const newTax = (newTotalPrice * (i.product.vat_rate || 16)) / 116
          return {
            ...i,
            discount_amount: i.discount_amount + itemCartDiscount,
            tax_amount: newTax,
            total_price: newTotalPrice,
          }
        })
      },
    }),
    { name: 'edos-pos-cart' }
  )
)
