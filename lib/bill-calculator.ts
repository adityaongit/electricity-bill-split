export interface SubmeterInput {
  hall: { previous: number; current: number }
  room: { previous: number; current: number }
}

export interface RoommateInput {
  roommateId: string
  roommateName: string
  area: string
  daysStayed: number
}

export interface BillInput {
  totalBill: number
  totalUnits: number
  submeterReadings: SubmeterInput
  roommates: RoommateInput[]
}

export interface ComputedBill {
  hallUnits: number
  roomUnits: number
  commonUnits: number
  perUnitPrice: number
  hallCost: number
  roomCost: number
  commonCost: number
}

export interface RoommateSplit {
  roommateId: string
  roommateName: string
  area: string
  daysStayed: number
  areaSharePercent: number
  areaCost: number
  commonCost: number
  totalAmount: number
}

export interface BillResult {
  computed: ComputedBill
  splits: RoommateSplit[]
}

export function calculateBill(input: BillInput): BillResult {
  const { totalBill, totalUnits, submeterReadings, roommates } = input

  const hallUnits =
    submeterReadings.hall.current - submeterReadings.hall.previous
  const roomUnits =
    submeterReadings.room.current - submeterReadings.room.previous
  const commonUnits = totalUnits - (hallUnits + roomUnits)
  const perUnitPrice = totalUnits > 0 ? totalBill / totalUnits : 0

  const hallCost = hallUnits * perUnitPrice
  const roomCost = roomUnits * perUnitPrice
  const commonCost = commonUnits * perUnitPrice

  const hallRoommates = roommates.filter((r) => r.area === "hall")
  const roomRoommates = roommates.filter((r) => r.area === "room")

  const hallTotalDays = hallRoommates.reduce((sum, r) => sum + r.daysStayed, 0)
  const roomTotalDays = roomRoommates.reduce((sum, r) => sum + r.daysStayed, 0)
  const totalPersonDays = hallTotalDays + roomTotalDays

  const splits: RoommateSplit[] = roommates.map((r) => {
    const isHall = r.area === "hall"
    const areaTotalDays = isHall ? hallTotalDays : roomTotalDays
    const areaBaseCost = isHall ? hallCost : roomCost

    const areaSharePercent =
      areaTotalDays > 0 ? (r.daysStayed / areaTotalDays) * 100 : 0
    const areaCostShare =
      areaTotalDays > 0 ? areaBaseCost * (r.daysStayed / areaTotalDays) : 0
    const commonCostShare =
      totalPersonDays > 0
        ? commonCost * (r.daysStayed / totalPersonDays)
        : 0

    return {
      roommateId: r.roommateId,
      roommateName: r.roommateName,
      area: r.area,
      daysStayed: r.daysStayed,
      areaSharePercent: Math.round(areaSharePercent * 100) / 100,
      areaCost: Math.round(areaCostShare * 100) / 100,
      commonCost: Math.round(commonCostShare * 100) / 100,
      totalAmount:
        Math.round((areaCostShare + commonCostShare) * 100) / 100,
    }
  })

  return {
    computed: {
      hallUnits: Math.round(hallUnits * 100) / 100,
      roomUnits: Math.round(roomUnits * 100) / 100,
      commonUnits: Math.round(commonUnits * 100) / 100,
      perUnitPrice: Math.round(perUnitPrice * 100) / 100,
      hallCost: Math.round(hallCost * 100) / 100,
      roomCost: Math.round(roomCost * 100) / 100,
      commonCost: Math.round(commonCost * 100) / 100,
    },
    splits,
  }
}
