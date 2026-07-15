// Safaricom Daraja M-Pesa API Integration

export interface MpesaCredentials {
  consumerKey: string
  consumerSecret: string
  shortcode: string
  passkey: string
  environment: 'sandbox' | 'production'
  initiatorName?: string
  securityCredential?: string
}

function getBaseUrl(environment: 'sandbox' | 'production'): string {
  return environment === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke'
}

async function getAccessToken(credentials: MpesaCredentials): Promise<string> {
  const encoded = Buffer.from(
    `${credentials.consumerKey}:${credentials.consumerSecret}`
  ).toString('base64')

  const response = await fetch(
    `${getBaseUrl(credentials.environment)}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${encoded}` },
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

function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
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

export async function initiateSTKPush(
  params: STKPushParams,
  credentials: MpesaCredentials
): Promise<STKPushResponse> {
  const accessToken = await getAccessToken(credentials)
  const timestamp = getTimestamp()
  const password = generatePassword(credentials.shortcode, credentials.passkey, timestamp)

  const phone = params.phone.replace(/^0/, '254').replace(/^\+/, '')

  const body = {
    BusinessShortCode: credentials.shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(params.amount),
    PartyA: phone,
    PartyB: credentials.shortcode,
    PhoneNumber: phone,
    CallBackURL: params.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mpesa`,
    AccountReference: params.accountReference.substring(0, 12),
    TransactionDesc: params.transactionDesc.substring(0, 13),
  }

  const response = await fetch(
    `${getBaseUrl(credentials.environment)}/mpesa/stkpush/v1/processrequest`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

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

export async function querySTKStatus(
  checkoutRequestId: string,
  credentials: MpesaCredentials
): Promise<STKQueryResponse> {
  const accessToken = await getAccessToken(credentials)
  const timestamp = getTimestamp()
  const password = generatePassword(credentials.shortcode, credentials.passkey, timestamp)

  const response = await fetch(
    `${getBaseUrl(credentials.environment)}/mpesa/stkpushquery/v1/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: credentials.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    }
  )

  return response.json()
}

// B2C for refunds
export async function initiateB2C(
  phone: string,
  amount: number,
  remarks: string,
  credentials: MpesaCredentials
) {
  const accessToken = await getAccessToken(credentials)

  const response = await fetch(
    `${getBaseUrl(credentials.environment)}/mpesa/b2c/v1/paymentrequest`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        InitiatorName: credentials.initiatorName,
        SecurityCredential: credentials.securityCredential,
        CommandID: 'BusinessPayment',
        Amount: Math.ceil(amount),
        PartyA: credentials.shortcode,
        PartyB: phone.replace(/^0/, '254').replace(/^\+/, ''),
        Remarks: remarks,
        QueueTimeOutURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mpesa/b2c/timeout`,
        ResultURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mpesa/b2c/result`,
        Occasion: remarks,
      }),
    }
  )

  return response.json()
}
