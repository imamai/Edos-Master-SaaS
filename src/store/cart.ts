import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartProduct {
  id: string
  sku: string
  name: string
  selling_price: number
  vat_rate: number
  unit: string
  stock_quantity?: number
  barcode?: string
  image_url?: string
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

  addItem: (product: CartProduct, qty?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  updateItemDiscount: (productId: string, discount: number) => void
  setCustomer: (customer: CartCustomer | null) => void
  setDiscount: (type: 'percent' | 'fixed', value: number) => void
  setNotes: (notes: string) => void
  clearCart: () => void

  subtotal: () => number
  totalDiscount: () => number
  totalTax: () => number
  totalAmount: () => number
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
            unit_price: product.selling_price,
            discount_amount: 0,
            tax_amount: 0,
            total_price: 0,
          })
          set((state) => ({ items: [...state.items, item] }))
        }
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
      clearCart: () => set({ items: [], customer: null, discountType: 'fixed', discountValue: 0, notes: '' }),

      subtotal: () => get().items.reduce((s, i) => s + i.unit_price * i.quantity, 0),
      totalDiscount: () => {
        const itemDiscounts = get().items.reduce((s, i) => s + i.discount_amount, 0)
        const { discountType, discountValue } = get()
        const cartDiscount = discountType === 'percent'
          ? (get().subtotal() * discountValue) / 100
          : discountValue
        return itemDiscounts + cartDiscount
      },
      totalTax: () => get().items.reduce((s, i) => s + i.tax_amount, 0),
      totalAmount: () => get().subtotal() - get().totalDiscount(),
    }),
    { name: 'edos-pos-cart' }
  )
)
