import { openDB, type DBSchema, type IDBPDatabase } from "idb"

interface GuestDBSchema extends DBSchema {
  flats: {
    key: string
    value: {
      _id: string
      name: string
      areas: { slug: string; label: string }[]
      upiId?: string
      upiPayeeName?: string
      createdAt: string
      updatedAt: string
    }
  }
  roommates: {
    key: string
    value: {
      _id: string
      flatId: string
      name: string
      area: string
      phone?: string
      isActive: boolean
      createdAt: string
      updatedAt: string
    }
    indexes: { flatId: string }
  }
  bills: {
    key: string
    value: {
      _id: string
      flatId: string
      billingPeriod: { from: string; to: string }
      totalBill: number
      totalUnits: number
      submeterReadings: Record<string, { previous: number; current: number }>
      computed: {
        areaUnits: Record<string, number>
        commonUnits: number
        perUnitPrice: number
        areaCosts: Record<string, number>
        commonCost: number
      }
      status: string
      createdAt: string
      updatedAt: string
    }
    indexes: { flatId: string }
  }
  bill_splits: {
    key: string
    value: {
      _id: string
      billId: string
      roommateId: string
      roommateName: string
      area: string
      daysStayed: number
      areaSharePercent: number
      areaCost: number
      commonCost: number
      totalAmount: number
      createdAt: string
    }
    indexes: { billId: string }
  }
  user_settings: {
    key: string
    value: {
      key: string
      value: string
      updatedAt: string
    }
  }
  onboarding_drafts: {
    key: string
    value: {
      key: string
      value: {
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
      updatedAt: string
    }
  }
}

let dbPromise: Promise<IDBPDatabase<GuestDBSchema>> | null = null

export function openGuestDb() {
  if (!dbPromise) {
    dbPromise = openDB<GuestDBSchema>("splitwatt-guest", 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("flats")) {
          db.createObjectStore("flats", { keyPath: "_id" })
        }

        if (!db.objectStoreNames.contains("roommates")) {
          const roommateStore = db.createObjectStore("roommates", { keyPath: "_id" })
          roommateStore.createIndex("flatId", "flatId")
        }

        if (!db.objectStoreNames.contains("bills")) {
          const billStore = db.createObjectStore("bills", { keyPath: "_id" })
          billStore.createIndex("flatId", "flatId")
        }

        if (!db.objectStoreNames.contains("bill_splits")) {
          const splitStore = db.createObjectStore("bill_splits", { keyPath: "_id" })
          splitStore.createIndex("billId", "billId")
        }

        if (!db.objectStoreNames.contains("user_settings")) {
          db.createObjectStore("user_settings", { keyPath: "key" })
        }

        if (!db.objectStoreNames.contains("onboarding_drafts")) {
          db.createObjectStore("onboarding_drafts", { keyPath: "key" })
        }
      },
    })
  }
  return dbPromise
}

export async function clearGuestDb() {
  const db = await openGuestDb()
  const tx = db.transaction(['flats', 'roommates', 'bills', 'bill_splits', 'user_settings', 'onboarding_drafts'], 'readwrite')

  await Promise.all([
    tx.objectStore('flats').clear(),
    tx.objectStore('roommates').clear(),
    tx.objectStore('bills').clear(),
    tx.objectStore('bill_splits').clear(),
    tx.objectStore('user_settings').clear(),
    tx.objectStore('onboarding_drafts').clear(),
  ])

  await tx.done
}

export type { GuestDBSchema }
