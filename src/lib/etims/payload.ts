// Maps a POS sale to the eTIMS saveTrnsSalesOsdc payload format.
// All monetary values are in KES (no decimal issues – eTIMS expects 2dp floats).

export type EtimsTaxCategory = 'A' | 'B' | 'C' | 'D' | 'E'
// A = Exempt (0%)  B = 16% VAT  C = Zero-rated  D = 8% Special  E = Excise

const TAX_RATES: Record<EtimsTaxCategory, number> = {
  A: 0, B: 0.16, C: 0, D: 0.08, E: 0,
}

// Payment method → eTIMS payment type code
const PAYMENT_CODES: Record<string, string> = {
  cash:   '01',
  credit: '02',
  card:   '03',
  mpesa:  '04',
  split:  '01',  // treat split as cash for eTIMS purposes
}

export interface SaleItem {
  product_name:      string
  product_sku?:      string | null
  quantity:          number
  unit_price:        number
  discount:          number
  total:             number
  etims_item_cls_cd?: string | null
  etims_tax_type_cd?: EtimsTaxCategory | null
}

export interface SaleData {
  id:             string
  receipt_number: string
  created_at:     string
  subtotal:       number
  discount_amount:number
  tax_amount:     number
  total:          number
  payment_method: string
  notes?:         string | null
}

export interface CustomerData {
  name:  string
  phone?: string | null
  kra_pin?: string | null
}

export interface TenantData {
  kra_pin:    string
  branch_id:  string
  device_serial: string
  name:       string
  address?:   string | null
  receipt_header?: string | null
  receipt_footer?: string | null
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Derive tax-exclusive base and VAT from a tax-inclusive item total.
function taxBreakdown(total: number, taxCat: EtimsTaxCategory) {
  const rate = TAX_RATES[taxCat]
  if (rate === 0) {
    return { taxblAmt: round2(total), taxAmt: 0 }
  }
  const taxblAmt = round2(total / (1 + rate))
  const taxAmt   = round2(total - taxblAmt)
  return { taxblAmt, taxAmt }
}

export function buildInvoicePayload(opts: {
  invoiceNo: number
  sale:      SaleData
  items:     SaleItem[]
  customer?: CustomerData | null
  tenant:    TenantData
  operatorId?: string
  operatorName?: string
}): Record<string, unknown> {
  const { invoiceNo, sale, items, customer, tenant, operatorId = 'cashier', operatorName = 'Cashier' } = opts

  // Aggregate tax buckets
  const buckets: Record<EtimsTaxCategory, { taxblAmt: number; taxAmt: number }> = {
    A: { taxblAmt: 0, taxAmt: 0 },
    B: { taxblAmt: 0, taxAmt: 0 },
    C: { taxblAmt: 0, taxAmt: 0 },
    D: { taxblAmt: 0, taxAmt: 0 },
    E: { taxblAmt: 0, taxAmt: 0 },
  }

  const itemList = items.map((item, idx) => {
    const taxCat = (item.etims_tax_type_cd || 'B') as EtimsTaxCategory
    const { taxblAmt, taxAmt } = taxBreakdown(item.total, taxCat)

    buckets[taxCat].taxblAmt = round2(buckets[taxCat].taxblAmt + taxblAmt)
    buckets[taxCat].taxAmt   = round2(buckets[taxCat].taxAmt   + taxAmt)

    return {
      itemSeq:       idx + 1,
      itemCd:        item.product_sku || `ITEM-${idx + 1}`,
      itemClsCd:     item.etims_item_cls_cd || '10101501',
      itemNm:        item.product_name,
      bcd:           item.product_sku || null,
      pkgUnitCd:     'U',
      pkg:           item.quantity,
      qtyUnitCd:     'U',
      qty:           item.quantity,
      prc:           round2(item.unit_price),
      splyAmt:       round2(item.unit_price * item.quantity),
      dcRt:          item.discount > 0 ? round2((item.discount / (item.unit_price * item.quantity)) * 100) : 0,
      dcAmt:         round2(item.discount),
      isrccCd:       null,
      isrccNm:       null,
      isrcRt:        null,
      isrcAmt:       null,
      vatCatCd:      taxCat,
      exciseTxCatCd: null,
      taxblAmt,
      taxAmt,
      totAmt:        round2(item.total),
    }
  })

  const salesDate = new Date(sale.created_at)
    .toISOString()
    .replace(/[-T:.Z]/g, '')
    .slice(0, 14)

  return {
    tin:         tenant.kra_pin,
    bhfId:       tenant.branch_id,
    invcNo:      invoiceNo,
    orgInvcNo:   0,
    cisInvcNo:   '',
    custTin:     customer?.kra_pin  || null,
    custNm:      customer?.name     || 'Walk-in Customer',
    salesSttsCd: '02',
    rcptTyCd:    'S',
    pmtTyCd:     PAYMENT_CODES[sale.payment_method] || '01',
    salesDt:     salesDate.slice(0, 8),
    stockRlsDt:  null,
    cnclReqDt:   null,
    cnclDt:      null,
    rfdDt:       null,
    rfdRsnCd:    null,
    totItemCnt:  items.length,
    taxblAmtA:   buckets.A.taxblAmt,
    taxblAmtB:   buckets.B.taxblAmt,
    taxblAmtC:   buckets.C.taxblAmt,
    taxblAmtD:   buckets.D.taxblAmt,
    taxblAmtE:   buckets.E.taxblAmt,
    taxAmtA:     buckets.A.taxAmt,
    taxAmtB:     buckets.B.taxAmt,
    taxAmtC:     buckets.C.taxAmt,
    taxAmtD:     buckets.D.taxAmt,
    taxAmtE:     buckets.E.taxAmt,
    totTaxblAmt: round2(Object.values(buckets).reduce((s, b) => s + b.taxblAmt, 0)),
    totTaxAmt:   round2(Object.values(buckets).reduce((s, b) => s + b.taxAmt,   0)),
    totAmt:      round2(sale.total),
    prchrAcptcYn:'N',
    remark:      sale.notes || null,
    regrId:      operatorId,
    regrNm:      operatorName,
    modrId:      operatorId,
    modrNm:      operatorName,
    receipt: {
      custTin:      customer?.kra_pin  || null,
      custMblNo:    customer?.phone    || null,
      rptNo:        invoiceNo,
      trdeNm:       tenant.name,
      adrs:         tenant.address    || '',
      topMsg:       tenant.receipt_header || 'Thank you for shopping with us',
      btmMsg:       tenant.receipt_footer || 'Please keep this receipt',
      prchrAcptcYn: 'N',
    },
    itemList,
  }
}
