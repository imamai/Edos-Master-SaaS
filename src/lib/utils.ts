import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    ...options,
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatDateOnly(date: string | Date): string {
  return new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium' }).format(new Date(date))
}

export function generateSKU(categoryName: string, productName: string): string {
  const cat = categoryName.replace(/\W/g, '').toUpperCase().slice(0, 3)
  const prod = productName.replace(/\W/g, '').toUpperCase().slice(0, 4)
  const num = Math.floor(Math.random() * 900 + 100)
  return `${cat}-${prod}-${num}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function generateReceiptNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count).padStart(6, '0')}`
}

export function formatPhone(phone: string): string {
  // Normalize to +254XXXXXXXXX
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('254')) return `+${digits}`
  if (digits.startsWith('0')) return `+254${digits.slice(1)}`
  return `+254${digits}`
}

export function isValidPhone(phone: string): boolean {
  return /^(\+?254|0)[17]\d{8}$/.test(phone.replace(/\s/g, ''))
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}...`
}

export function getDaysLeft(date: string | Date): number {
  const diff = new Date(date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function getPlanPrice(
  plan: { price_monthly: number; price_semiannual: number; price_yearly: number },
  cycle: 'monthly' | 'semiannual' | 'yearly'
): number {
  switch (cycle) {
    case 'semiannual': return plan.price_semiannual
    case 'yearly': return plan.price_yearly
    default: return plan.price_monthly
  }
}

export function getSubdomain(hostname: string): string | null {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) return null
  if (hostname.endsWith(`.${rootDomain}`)) {
    return hostname.replace(`.${rootDomain}`, '')
  }
  // localhost development
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.')
    if (parts.length > 1) return parts[0]
  }
  return null
}
