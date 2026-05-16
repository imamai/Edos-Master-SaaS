// eTIMS HTTP client – server-side only (never import from client components)

export const ETIMS_URLS = {
  sandbox:    'https://etims-sbx.kra.go.ke/etims-api',
  production: 'https://etims.kra.go.ke/etims-api',
} as const

export interface EtimsSettings {
  kra_pin:       string
  branch_id:     string   // bhfId e.g. "000"
  device_serial: string   // dvcSrlNo
  environment:   'sandbox' | 'production'
}

export interface EtimsApiResponse {
  resultCd:  string        // "000" = success
  resultMsg: string
  resultDt:  string
  data?:     Record<string, unknown>
}

async function call(
  settings: EtimsSettings,
  path: string,
  body: Record<string, unknown>
): Promise<EtimsApiResponse> {
  const base = ETIMS_URLS[settings.environment]
  const url  = `${base}${path}`

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`eTIMS HTTP ${res.status}: ${text}`)
  }

  return res.json() as Promise<EtimsApiResponse>
}

// One-time device initialisation – call this when tenant first enables eTIMS
export async function initDevice(settings: EtimsSettings): Promise<EtimsApiResponse> {
  return call(settings, '/selectInitOsdcInfo', {
    tin:      settings.kra_pin,
    bhfId:    settings.branch_id,
    dvcSrlNo: settings.device_serial,
  })
}

// Submit a sales invoice
export async function submitInvoice(
  settings:  EtimsSettings,
  payload:   Record<string, unknown>
): Promise<EtimsApiResponse> {
  return call(settings, '/saveTrnsSalesOsdc', payload)
}

export function isSuccess(response: EtimsApiResponse): boolean {
  return response.resultCd === '000'
}
