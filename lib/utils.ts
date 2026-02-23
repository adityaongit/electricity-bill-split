import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DEFAULT_CURRENCY, getCurrencyConfig, type CurrencyCode } from "./currency"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencyCode?: CurrencyCode): string {
  const currency = currencyCode ?? DEFAULT_CURRENCY
  const config = getCurrencyConfig(currency)
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Get month name from date (e.g., "jan", "feb", "mar")
export function getMonthName(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short" }).toLowerCase()
}

// Generate filename based on billing period (e.g., "electricity-bill-jan-mar")
export function generateBillFilename(fromDate: Date | string, toDate: Date | string, extension: string): string {
  const fromMonth = getMonthName(fromDate)
  const toMonth = getMonthName(toDate)
  return `electricity-bill-${fromMonth}-${toMonth}.${extension}`
}
