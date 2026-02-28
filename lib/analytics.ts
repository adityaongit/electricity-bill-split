/**
 * Umami Analytics Utility
 *
 * Helper functions for tracking events with Umami Analytics.
 * All functions include type checking and error handling to prevent app crashes.
 */

// Extend Window interface for Umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, unknown>) => void
      trackEvent: (eventName: string, data?: Record<string, unknown>) => void
    }
  }
}

export interface AnalyticsEvent {
  name: string
  data?: Record<string, unknown>
}

/**
 * Check if Umami is available and loaded
 */
function isUmamiAvailable(): boolean {
  if (typeof window === "undefined") return false
  return typeof window.umami !== "undefined"
}

/**
 * Track an analytics event
 * @param eventName - The name of the event to track
 * @param data - Additional data to include with the event
 */
export function track(eventName: string, data?: Record<string, unknown>): void {
  if (!isUmamiAvailable()) return

  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    window.umami?.track(eventName, data)
  } catch {
    // Silently fail to avoid affecting user experience
  }
}

/**
 * Track an event using trackEvent alias
 * @param eventName - The name of the event to track
 * @param data - Additional data to include with the event
 */
export function trackEvent(
  eventName: string,
  data?: Record<string, unknown>
): void {
  track(eventName, data)
}

// =====================
// Authentication Events
// =====================

export function trackSignupInitiate(method: string = "email"): void {
  track("signup_initiate", { method })
}

export function trackSignupSuccess(method: string = "email"): void {
  track("signup_success", { method })
}

export function trackSignupFailed(method: string = "email", error?: string): void {
  track("signup_failed", { method, error })
}

export function trackLoginInitiate(method: string = "email"): void {
  track("login_initiate", { method })
}

export function trackLoginSuccess(method: string = "email"): void {
  track("login_success", { method })
}

export function trackLoginFailed(method: string = "email", error?: string): void {
  track("login_failed", { method, error })
}

export function trackOAuthClick(provider: string): void {
  track(`oauth_${provider}_click`, { provider })
}

export function trackGuestModeStart(): void {
  track("guest_mode_start")
}

// =====================
// Bill Events
// =====================

export function trackBillCreateInitiate(): void {
  track("bill_create_initiate")
}

export function trackBillCreateSuccess(
  totalAmount: number,
  numRoommates: number
): void {
  track("bill_create_success", {
    total_amount: totalAmount,
    num_roommates: numRoommates,
  })
}

export function trackBillCreateFailed(error?: string): void {
  track("bill_create_failed", { error })
}

export function trackBillView(billId: string): void {
  track("bill_view", { bill_id: billId })
}

export function trackBillHistoryView(totalBills: number): void {
  track("bill_history_view", { total_bills: totalBills })
}

// =====================
// Export Events
// =====================

export function trackExportPDF(billId: string): void {
  track("export_pdf", { bill_id: billId })
}

export function trackExportPDFFailed(billId: string, error?: string): void {
  track("export_pdf_failed", { bill_id: billId, error })
}

export function trackExportImage(billId: string): void {
  track("export_image", { bill_id: billId })
}

export function trackExportImageFailed(billId: string, error?: string): void {
  track("export_image_failed", { bill_id: billId, error })
}

export function trackShareWhatsApp(billId: string, type: "group" | "individual"): void {
  track("share_whatsapp", { bill_id: billId, type })
}

// =====================
// Settings Events
// =====================

export function trackFlatCreate(): void {
  track("flat_create")
}

export function trackFlatDelete(): void {
  track("flat_delete")
}

export function trackRoommateAdd(): void {
  track("roommate_add")
}

export function trackRoommateRemove(): void {
  track("roommate_remove")
}

export function trackRoommateUpdate(): void {
  track("roommate_update")
}

export function trackCurrencyChange(from: string, to: string): void {
  track("currency_change", { from, to })
}

// =====================
// Landing Page Events
// =====================

export function trackCTAClick(location: "hero" | "bottom"): void {
  track("cta_click", { location })
}

// =====================
// PWA Events
// =====================

export function trackPwaInstall(method: "native" | "manual_android" | "manual_ios"): void {
  track("pwa_install", { method })
}
