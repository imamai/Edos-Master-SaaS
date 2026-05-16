// Safaricom Daraja M-Pesa API Integration

const MPESA_BASE_URL = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const response = await fetch(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error(`M-Pesa auth failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

function getTimestamp(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  )
}

function generatePassword(timestamp: string): string {
  const data = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  return Buffer.from(data).toString('base64')
}

export interface STKPushParams {
  phone: string
  amount: number
  accountReference: string
  transactionDesc: string
  callbackUrl?: string
}

export interface STKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export async function initiateSTKPush(params: STKPushParams): Promise<STKPushResponse> {
  const accessToken = await getAccessToken()
  const timestamp = getTimestamp()
  const password = generatePassword(timestamp)

  // Format phone: 254XXXXXXXXX
  const phone = params.phone.replace(/^0/, '254').replace(/^\+/, '')

  const body = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(params.amount),
    PartyA: phone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: params.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mpesa`,
    AccountReference: params.accountReference.substring(0, 12),
    TransactionDesc: params.transactionDesc.substring(0, 13),
  }

  const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.errorMessage || `STK Push failed: ${response.statusText}`)
  }

  return response.json()
}

export interface STKQueryResponse {
  ResponseCode: string
  ResponseDescription: string
  MerchantRequestID: string
  CheckoutRequestID: string
  ResultCode: string
  ResultDesc: string
}

export async function querySTKStatus(checkoutRequestId: string): Promise<STKQueryResponse> {
  const accessToken = await getAccessToken()
  const timestamp = getTimestamp()
  const password = generatePassword(timestamp)

  const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  })

  return response.json()
}

// B2C for refunds (optional)
export async function initiateB2C(phone: string, amount: number, remarks: string) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: 'BusinessPayment',
      Amount: Math.ceil(amount),
      PartyA: process.env.MPESA_SHORTCODE,
      PartyB: phone.replace(/^0/, '254').replace(/^\+/, ''),
      Remarks: remarks,
      QueueTimeOutURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mpesa/b2c/timeout`,
      ResultURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mpesa/b2c/result`,
      Occasion: remarks,
    }),
  })

  return response.json()
}
