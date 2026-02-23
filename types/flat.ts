import type { ObjectId } from "mongodb"

export interface FlatArea {
  slug: string
  label: string
}

export interface Flat {
  _id: ObjectId
  ownerId: string
  name: string
  areas: FlatArea[]
  upiId?: string
  upiPayeeName?: string
  createdAt: Date
  updatedAt: Date
}
