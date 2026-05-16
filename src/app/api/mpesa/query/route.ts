import { NextRequest, NextResponse } from 'next/server'
import { querySTKStatus } from '@/lib/mpesa'

export async function POST(req: NextRequest) {
  const { checkoutRequestId } = await req.json()

  if (!checkoutRequestId) {
    return NextResponse.json({ message: 'Missing checkoutRequestId' }, { status: 400 })
  }

  try {
    const result = await querySTKStatus(checkoutRequestId)
    return NextResponse.json(result)
  } catch (err) {
    console.error('STK Query error:', err)
    return NextResponse.json({ message: 'Query failed' }, { status: 500 })
  }
}
