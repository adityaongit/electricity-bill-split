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
      submeterReadings: {
        hall: { previous: number; current: number }
        room: { previous: number; current: number }
      }
      computed: {
        hallUnits: number
        roomUnits: number
        commonUnits: number
        perUnitPrice: number
        hallCost: number
        roomCost: number
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
}

let dbPromise: Promise<IDBPDatabase<GuestDBSchema>> | null = null

export function openGuestDb() {
  if (!dbPromise) {
    dbPromise = openDB<GuestDBSchema>("splitwatt-guest", 3, {
      upgrade(db, oldVersion) {
        // Version 1 schema
        if (oldVersion < 1) {
          db.createObjectStore("flats", { keyPath: "_id" })

          const roommateStore = db.createObjectStore("roommates", { keyPath: "_id" })
          roommateStore.createIndex("flatId", "flatId")

          const billStore = db.createObjectStore("bills", { keyPath: "_id" })
          billStore.createIndex("flatId", "flatId")

          const splitStore = db.createObjectStore("bill_splits", { keyPath: "_id" })
          splitStore.createIndex("billId", "billId")
        }

        // Version 2: Add UPI fields to flats
        if (oldVersion < 2) {
          // IndexedDB automatically handles new optional fields
          // No schema changes needed, just version bump
        }

        // Version 3: Add user_settings store
        if (oldVersion < 3) {
          db.createObjectStore("user_settings", { keyPath: "key" })
        }
      },
    })
  }
  return dbPromise
}

export type { GuestDBSchema }
