import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
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
