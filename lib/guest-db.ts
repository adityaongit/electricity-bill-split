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
}

let dbPromise: Promise<IDBPDatabase<GuestDBSchema>> | null = null

export function openGuestDb() {
  if (!dbPromise) {
    dbPromise = openDB<GuestDBSchema>("splitwatt-guest", 4, {
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
        }

        // Version 3: Add user_settings store
        if (oldVersion < 3) {
          db.createObjectStore("user_settings", { keyPath: "key" })
        }

        // Version 4: Migrate to dynamic submeterReadings
        if (oldVersion < 4) {
          // Migrate existing bills to new format
          const billStore = db.transaction("bills", "readwrite").objectStore("bills")

          billStore.iterateCursor((cursor) => {
            const oldBill = cursor.value as any
            if (oldBill.submeterReadings) {
              // Convert old format {hall: {...}, room: {...}} to new Record format
              const newReadings: Record<string, { previous: number; current: number }> = {}
              if (oldBill.submeterReadings.hall) {
                newReadings.hall = oldBill.submeterReadings.hall
              }
              if (oldBill.submeterReadings.room) {
                newReadings.room = oldBill.submeterReadings.room
              }

              // Update with new computed format
              const newComputed = {
                areaUnits: {},
                commonUnits: oldBill.computed.commonUnits,
                perUnitPrice: oldBill.computed.perUnitPrice,
                areaCosts: {},
                commonCost: oldBill.computed.commonCost,
              }
              if (oldBill.computed.hallUnits !== undefined) {
                newComputed.areaUnits.hall = oldBill.computed.hallUnits
              }
              if (oldBill.computed.roomUnits !== undefined) {
                newComputed.areaUnits.room = oldBill.computed.roomUnits
              }
              if (oldBill.computed.hallCost !== undefined) {
                newComputed.areaCosts.hall = oldBill.computed.hallCost
              }
              if (oldBill.computed.roomCost !== undefined) {
                newComputed.areaCosts.room = oldBill.computed.roomCost
              }

              cursor.update({
                ...oldBill,
                submeterReadings: newReadings,
                computed: newComputed,
              })
            }
          })
        }
      },
    })
  }
  return dbPromise
}

export type { GuestDBSchema }
