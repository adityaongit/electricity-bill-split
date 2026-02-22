import type { ObjectId } from "mongodb"

export interface Roommate {
  _id: ObjectId
  flatId: ObjectId
  name: string
  area: string
  phone?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
