export interface RoommateInput {
  roommateId: string
  roommateName: string
  area: string
  daysStayed: number
}

export interface BillInput {
  totalBill: number
  totalUnits: number
  submeterReadings: Record<string, { previous: number; current: number }>
  roommates: RoommateInput[]
}

export interface ComputedBill {
  areaUnits: Record<string, number>
  commonUnits: number
  perUnitPrice: number
  areaCosts: Record<string, number>
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

  // Calculate units for each area
  const areaUnits: Record<string, number> = {}
  let totalAreaUnits = 0

  for (const [area, reading] of Object.entries(submeterReadings)) {
    const units = reading.current - reading.previous
    areaUnits[area] = units
    totalAreaUnits += units
  }

  const commonUnits = totalUnits - totalAreaUnits
  const perUnitPrice = totalUnits > 0 ? totalBill / totalUnits : 0

  // Calculate cost for each area
  const areaCosts: Record<string, number> = {}
  for (const [area, units] of Object.entries(areaUnits)) {
    areaCosts[area] = units * perUnitPrice
  }

  const commonCost = commonUnits * perUnitPrice

  // Group roommates by area and calculate totals
  const areaGroups: Record<string, typeof roommates> = {}
  for (const roommate of roommates) {
    if (!areaGroups[roommate.area]) {
      areaGroups[roommate.area] = []
    }
    areaGroups[roommate.area].push(roommate)
  }

  // Calculate total days per area
  const areaTotalDays: Record<string, number> = {}
  for (const [area, areaRoommates] of Object.entries(areaGroups)) {
    areaTotalDays[area] = areaRoommates.reduce((sum, r) => sum + r.daysStayed, 0)
  }

  const totalPersonDays = Object.values(areaTotalDays).reduce((sum, days) => sum + days, 0)

  // Calculate splits for each roommate
  const splits: RoommateSplit[] = roommates.map((r) => {
    const areaTotalDay = areaTotalDays[r.area] || 0
    const areaBaseCost = areaCosts[r.area] || 0

    const areaSharePercent =
      areaTotalDay > 0 ? (r.daysStayed / areaTotalDay) * 100 : 0
    const areaCostShare =
      areaTotalDay > 0 ? areaBaseCost * (r.daysStayed / areaTotalDay) : 0
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
      areaUnits: Object.fromEntries(
        Object.entries(areaUnits).map(([k, v]) => [k, Math.round(v * 100) / 100])
      ),
      commonUnits: Math.round(commonUnits * 100) / 100,
      perUnitPrice: Math.round(perUnitPrice * 100) / 100,
      areaCosts: Object.fromEntries(
        Object.entries(areaCosts).map(([k, v]) => [k, Math.round(v * 100) / 100])
      ),
      commonCost: Math.round(commonCost * 100) / 100,
    },
    splits,
  }
}
