import { openGuestDb } from "./guest-db"

export async function migrateGuestData(): Promise<void> {
  const hasGuest = document.cookie.split("; ").some((c) => c === "guest=1")
  if (!hasGuest) return

  const db = await openGuestDb()

  const flats = await db.getAll("flats")
  if (flats.length === 0) {
    clearGuest()
    return
  }

  // If the account already has flats, skip migration to avoid duplicates.
  // This happens when a guest signs into an existing Google account.
  const existingFlats = await fetch("/api/flats").then((r) => r.json())
  if (existingFlats.data?.length > 0) {
    await clearGuestDb(db)
    clearGuest()
    return
  }

  for (const flat of flats) {
    const guestFlatId = flat._id

    // Create flat via API
    const flatRes = await fetch("/api/flats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: flat.name, areas: flat.areas }),
    }).then((r) => r.json())

    if (!flatRes.success) continue
    const apiFlatId = flatRes.data._id

    // Migrate roommates — map guest IDs to API IDs
    const roommates = await db.getAllFromIndex("roommates", "flatId", guestFlatId)
    const roommateIdMap = new Map<string, string>()

    for (const rm of roommates) {
      const rmRes = await fetch("/api/roommates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flatId: apiFlatId, name: rm.name, area: rm.area }),
      }).then((r) => r.json())

      if (rmRes.success) {
        roommateIdMap.set(rm._id, rmRes.data._id)
      }
    }

    // Migrate bills (oldest first for auto-reading-shift continuity)
    const bills = await db.getAllFromIndex("bills", "flatId", guestFlatId)
    bills.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    for (const bill of bills) {
      const splits = await db.getAllFromIndex("bill_splits", "billId", bill._id)
      const mappedRoommates = splits.map((s) => ({
        roommateId: roommateIdMap.get(s.roommateId) ?? s.roommateId,
        roommateName: s.roommateName,
        area: s.area,
        daysStayed: s.daysStayed,
      }))

      await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flatId: apiFlatId,
          billingPeriod: bill.billingPeriod,
          totalBill: bill.totalBill,
          totalUnits: bill.totalUnits,
          submeterReadings: bill.submeterReadings,
          roommates: mappedRoommates,
          status: bill.status,
        }),
      })
    }
  }

  await clearGuestDb(db)
  clearGuest()
}

async function clearGuestDb(db: Awaited<ReturnType<typeof openGuestDb>>) {
  const tx = db.transaction(["flats", "roommates", "bills", "bill_splits"], "readwrite")
  await Promise.all([
    tx.objectStore("flats").clear(),
    tx.objectStore("roommates").clear(),
    tx.objectStore("bills").clear(),
    tx.objectStore("bill_splits").clear(),
  ])
  await tx.done
}

function clearGuest() {
  document.cookie = "guest=; path=/; max-age=0"
}
