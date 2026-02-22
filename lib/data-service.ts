export interface FlatData {
  _id: string
  name: string
  areas: { slug: string; label: string }[]
}

export interface RoommateData {
  _id: string
  flatId: string
  name: string
  area: string
  phone?: string
  isActive: boolean
}

export interface BillData {
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

export interface BillDetailData extends BillData {
  splits: {
    roommateName: string
    area: string
    daysStayed: number
    areaSharePercent: number
    areaCost: number
    commonCost: number
    totalAmount: number
  }[]
}

export interface BillListResult {
  bills: BillData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateBillInput {
  flatId: string
  billingPeriod: { from: string; to: string }
  totalBill: number
  totalUnits: number
  submeterReadings: {
    hall: { previous: number; current: number }
    room: { previous: number; current: number }
  }
  roommates: {
    roommateId: string
    roommateName: string
    area: string
    daysStayed: number
  }[]
  status: string
}

export interface DataService {
  getFlats(): Promise<FlatData[]>
  createFlat(name: string): Promise<FlatData>
  deleteFlat(id: string): Promise<void>

  getRoommates(flatId: string): Promise<RoommateData[]>
  createRoommate(flatId: string, name: string, area: string, phone?: string): Promise<RoommateData>
  updateRoommate(id: string, data: { name?: string; area?: string; phone?: string }): Promise<RoommateData>
  deleteRoommate(id: string): Promise<void>

  getBills(flatId: string, page?: number, limit?: number): Promise<BillListResult>
  getBill(billId: string): Promise<BillDetailData | null>
  createBill(input: CreateBillInput): Promise<{ _id: string }>

  generatePdfBlob(billId: string): Promise<Blob>
}
