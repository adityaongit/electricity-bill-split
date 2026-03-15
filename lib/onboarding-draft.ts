import { openGuestDb } from "./guest-db"

export interface OnboardingDraft {
  selectedFlatId?: string
  quickSetupAreas: string[]
  quickSetupRoommates: { id: string; name: string; area: string }[]
  dateFrom?: string
  dateTo?: string
  totalBill: string
  totalUnits: string
  submeterReadings: Record<string, { previous: string; current: string }>
  roommatesDays: Record<string, string>
}

const DRAFT_KEY = "bill-new"

export async function getOnboardingDraft(): Promise<OnboardingDraft | null> {
  const db = await openGuestDb()
  const draft = await db.get("onboarding_drafts", DRAFT_KEY)
  return draft?.value ?? null
}

export async function saveOnboardingDraft(value: OnboardingDraft): Promise<void> {
  const db = await openGuestDb()
  await db.put("onboarding_drafts", {
    key: DRAFT_KEY,
    value,
    updatedAt: new Date().toISOString(),
  })
}

export async function clearOnboardingDraft(): Promise<void> {
  const db = await openGuestDb()
  await db.delete("onboarding_drafts", DRAFT_KEY)
}
