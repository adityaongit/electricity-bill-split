import type { ObjectId } from "mongodb"

export interface SubmeterReading {
  previous: number
  current: number
}

export interface BillComputed {
  hallUnits: number
  roomUnits: number
  commonUnits: number
  perUnitPrice: number
  hallCost: number
  roomCost: number
  commonCost: number
}

export interface Bill {
  _id: ObjectId
  flatId: ObjectId
  createdBy: string
  billingPeriod: {
    from: Date
    to: Date
  }
  totalBill: number
  totalUnits: number
  submeterReadings: {
    hall: SubmeterReading
    room: SubmeterReading
  }
  computed: BillComputed
  status: "draft" | "finalized"
  createdAt: Date
  updatedAt: Date
}

export interface BillSplit {
  _id: ObjectId
  billId: ObjectId
  roommateId: ObjectId
  roommateName: string
  area: string
  daysStayed: number
  areaSharePercent: number
  areaCost: number
  commonCost: number
  totalAmount: number
  createdAt: Date
}
