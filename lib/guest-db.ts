import { openDB, type DBSchema, type IDBPDatabase } from "idb"

interface GuestDBSchema extends DBSchema {
  flats: {
    key: string
    value: {
      _id: string
      name: string
      areas: { slug: string; label: string }[]
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
}

let dbPromise: Promise<IDBPDatabase<GuestDBSchema>> | null = null

export function openGuestDb() {
  if (!dbPromise) {
    dbPromise = openDB<GuestDBSchema>("splitwatt-guest", 1, {
      upgrade(db) {
        db.createObjectStore("flats", { keyPath: "_id" })

        const roommateStore = db.createObjectStore("roommates", { keyPath: "_id" })
        roommateStore.createIndex("flatId", "flatId")

        const billStore = db.createObjectStore("bills", { keyPath: "_id" })
        billStore.createIndex("flatId", "flatId")

        const splitStore = db.createObjectStore("bill_splits", { keyPath: "_id" })
        splitStore.createIndex("billId", "billId")
      },
    })
  }
  return dbPromise
}

export type { GuestDBSchema }
