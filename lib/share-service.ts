import { nanoid } from "nanoid"
import { config } from "@/lib/config"

export function generateShareId(): string {
  return nanoid(6).toLowerCase()
}

export function isValidExpiration(days: number): boolean {
  return days >= config.share.minExpirationDays && days <= config.share.maxExpirationDays
}

export function calculateExpirationDate(days: number): Date {
  const now = new Date()
  now.setDate(now.getDate() + days)
  return now
}
