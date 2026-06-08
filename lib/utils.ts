import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function formatDate(date: any) {
  if (!date) return ''
  let d: Date
  if (date.seconds) {
    d = new Date(date.seconds * 1000)
  } else if (date.toDate && typeof date.toDate === 'function') {
    d = date.toDate()
  } else if (date instanceof Date) {
    d = date
  } else if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date)
  } else {
    return ''
  }
  return format(d, 'MMM dd, yyyy')
}

export function formatDateTime(date: any) {
  if (!date) return ''
  let d: Date
  if (date.seconds) {
    d = new Date(date.seconds * 1000)
  } else if (date.toDate && typeof date.toDate === 'function') {
    d = date.toDate()
  } else if (date instanceof Date) {
    d = date
  } else if (typeof date === 'string' || typeof date === 'number') {
    d = new Date(date)
  } else {
    return ''
  }
  return format(d, 'MMM dd, yyyy h:mm a')
}
