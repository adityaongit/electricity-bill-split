import { openGuestDb, clearGuestDb } from "./guest-db"
import { calculateBill } from "./bill-calculator"
import { DEFAULT_CURRENCY, type CurrencyCode } from "./currency"
import type {
  DataService,
  FlatData,
  RoommateData,
  BillListResult,
  BillDetailData,
  CreateBillInput,
} from "./data-service"

export function createGuestService(): DataService {
  return {
    async getFlats() {
      const db = await openGuestDb()
      const all = await db.getAll("flats")
      return all as FlatData[]
    },

    async createFlat(name, areas) {
      const db = await openGuestDb()
      const now = new Date().toISOString()
      const flat = {
        _id: crypto.randomUUID(),
        name,
        areas: areas.map((a, idx) => ({
          slug: a.slug || `area-${idx}`,
          label: a.label,
        })),
        createdAt: now,
        updatedAt: now,
      }
      await db.put("flats", flat)
      return flat as FlatData
    },

    async updateFlat(id, data) {
      const db = await openGuestDb()
      const existing = await db.get("flats", id)
      if (!existing) throw new Error("Flat not found")

      const updated = {
        ...existing,
        ...(data.upiId !== undefined && { upiId: data.upiId || undefined }),
        ...(data.upiPayeeName !== undefined && { upiPayeeName: data.upiPayeeName || undefined }),
        updatedAt: new Date().toISOString(),
      }
      await db.put("flats", updated)
      return updated as FlatData
    },

    async deleteFlat(id) {
      const db = await openGuestDb()
      // Gather all related data before starting the transaction
      const roommates = await db.getAllFromIndex("roommates", "flatId", id)
      const bills = await db.getAllFromIndex("bills", "flatId", id)
      const allSplits: { _id: string }[] = []
      for (const b of bills) {
        const splits = await db.getAllFromIndex("bill_splits", "billId", b._id)
        allSplits.push(...splits)
      }
      // Now delete everything in a single transaction
      const tx = db.transaction(["flats", "roommates", "bills", "bill_splits"], "readwrite")
      tx.objectStore("flats").delete(id)
      for (const r of roommates) tx.objectStore("roommates").delete(r._id)
      for (const s of allSplits) tx.objectStore("bill_splits").delete(s._id)
      for (const b of bills) tx.objectStore("bills").delete(b._id)
      await tx.done
    },

    async getRoommates(flatId) {
      const db = await openGuestDb()
      const all = await db.getAllFromIndex("roommates", "flatId", flatId)
      return all as RoommateData[]
    },

    async createRoommate(flatId, name, area, phone) {
      const db = await openGuestDb()
      const now = new Date().toISOString()
      const roommate = {
        _id: crypto.randomUUID(),
        flatId,
        name,
        area,
        ...(phone && { phone }),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
      await db.put("roommates", roommate)
      return roommate as RoommateData
    },

    async deleteRoommate(id) {
      const db = await openGuestDb()
      await db.delete("roommates", id)
    },

    async updateRoommate(id, data) {
      const db = await openGuestDb()
      const existing = await db.get("roommates", id)
      if (!existing) throw new Error("Roommate not found")

      const updated = {
        ...existing,
        ...(data.name && { name: data.name }),
        ...(data.area && { area: data.area }),
        ...(data.phone !== undefined && { phone: data.phone || undefined }),
        updatedAt: new Date().toISOString(),
      }
      await db.put("roommates", updated)
      return updated as RoommateData
    },

    async getBills(flatId, page = 1, limit = 10) {
      const db = await openGuestDb()
      const all = await db.getAllFromIndex("bills", "flatId", flatId)
      // Sort by createdAt descending
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      const total = all.length
      const totalPages = Math.ceil(total / limit)
      const start = (page - 1) * limit
      const bills = all.slice(start, start + limit)
      return { bills, pagination: { page, limit, total, totalPages } } as BillListResult
    },

    async getBill(billId) {
      const db = await openGuestDb()
      const bill = await db.get("bills", billId)
      if (!bill) return null
      const splits = await db.getAllFromIndex("bill_splits", "billId", billId)
      return { ...bill, splits } as BillDetailData
    },

    async createBill(input: CreateBillInput) {
      const db = await openGuestDb()
      const now = new Date().toISOString()
      const result = calculateBill({
        totalBill: input.totalBill,
        totalUnits: input.totalUnits,
        submeterReadings: input.submeterReadings,
        roommates: input.roommates,
      })

      const billId = crypto.randomUUID()
      const bill = {
        _id: billId,
        flatId: input.flatId,
        billingPeriod: input.billingPeriod,
        totalBill: input.totalBill,
        totalUnits: input.totalUnits,
        submeterReadings: input.submeterReadings,
        computed: result.computed,
        status: input.status,
        createdAt: now,
        updatedAt: now,
      }

      const tx = db.transaction(["bills", "bill_splits"], "readwrite")
      await tx.objectStore("bills").put(bill)
      for (const split of result.splits) {
        await tx.objectStore("bill_splits").put({
          _id: crypto.randomUUID(),
          billId,
          roommateId: split.roommateId,
          roommateName: split.roommateName,
          area: split.area,
          daysStayed: split.daysStayed,
          areaSharePercent: split.areaSharePercent,
          areaCost: split.areaCost,
          commonCost: split.commonCost,
          totalAmount: split.totalAmount,
          createdAt: now,
        })
      }
      await tx.done

      return { _id: billId }
    },

    async generatePdfBlob(billId, currency?: string) {
      const bill = await this.getBill(billId)
      if (!bill) throw new Error("Bill not found")

      // Get flat for area labels
      const db = await openGuestDb()
      const flat = await db.get("flats", bill.flatId)

      const { pdf } = await import("@react-pdf/renderer")
      const { BillPdfDocument } = await import("@/components/export/bill-pdf-document")
      const { createElement } = await import("react")

      const doc = createElement(BillPdfDocument, {
        bill,
        flat: flat ? { areas: flat.areas } : undefined,
        currency: currency as any
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(doc as any).toBlob()
      return blob
    },

    async deleteBill(id) {
      const db = await openGuestDb()
      // First delete all splits associated with this bill
      const splits = await db.getAllFromIndex("bill_splits", "billId", id)
      const tx = db.transaction(["bills", "bill_splits"], "readwrite")
      for (const split of splits) {
        await tx.objectStore("bill_splits").delete(split._id)
      }
      await tx.objectStore("bills").delete(id)
      await tx.done
    },

    async clearAllData() {
      await clearGuestDb()
    },
  }
}

// Currency preference helpers for guest mode
export async function getCurrencyPreference(): Promise<CurrencyCode> {
  try {
    const db = await openGuestDb()
    const setting = await db.get("user_settings", "currency")
    return (setting?.value as CurrencyCode) ?? DEFAULT_CURRENCY
  } catch {
    return DEFAULT_CURRENCY
  }
}

export async function setCurrencyPreference(code: CurrencyCode): Promise<void> {
  const db = await openGuestDb()
  await db.put("user_settings", {
    key: "currency",
    value: code,
    updatedAt: new Date().toISOString(),
  })
}

export async function generateShareToken(billId: string): Promise<never> {
  throw new Error("Please login with Google to use the share link feature")
}
