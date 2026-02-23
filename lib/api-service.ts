import type {
  DataService,
  FlatData,
  RoommateData,
  BillListResult,
  BillDetailData,
} from "./data-service"

export function createApiService(): DataService {
  return {
    async getFlats() {
      const res = await fetch("/api/flats").then((r) => r.json())
      return (res.data ?? []) as FlatData[]
    },

    async createFlat(name) {
      const res = await fetch("/api/flats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          areas: [
            { slug: "hall", label: "Hall" },
            { slug: "room", label: "Room" },
          ],
        }),
      }).then((r) => r.json())
      if (!res.success) throw new Error(res.error)
      return res.data as FlatData
    },

    async updateFlat(id, data) {
      const res = await fetch(`/api/flats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json())
      if (!res.success) throw new Error(res.error)
      return res.data as FlatData
    },

    async deleteFlat(id) {
      const res = await fetch(`/api/flats/${id}`, { method: "DELETE" }).then((r) => r.json())
      if (!res.success) throw new Error(res.error)
    },

    async getRoommates(flatId) {
      const res = await fetch(`/api/roommates?flatId=${flatId}`).then((r) => r.json())
      return (res.data ?? []) as RoommateData[]
    },

    async createRoommate(flatId, name, area, phone) {
      const res = await fetch("/api/roommates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flatId, name, area, phone }),
      }).then((r) => r.json())
      if (!res.success) throw new Error(res.error)
      return res.data as RoommateData
    },

    async deleteRoommate(id) {
      const res = await fetch(`/api/roommates/${id}`, { method: "DELETE" }).then((r) => r.json())
      if (!res.success) throw new Error(res.error)
    },

    async updateRoommate(id, data) {
      const res = await fetch(`/api/roommates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json())
      if (!res.success) throw new Error(res.error)
      return res.data as RoommateData
    },

    async getBills(flatId, page = 1, limit = 10) {
      const res = await fetch(
        `/api/bills?flatId=${flatId}&page=${page}&limit=${limit}`
      ).then((r) => r.json())
      return {
        bills: res.data?.bills ?? [],
        pagination: res.data?.pagination ?? { page, limit, total: 0, totalPages: 0 },
      } as BillListResult
    },

    async getBill(billId) {
      const res = await fetch(`/api/bills/${billId}`).then((r) => r.json())
      return (res.data ?? null) as BillDetailData | null
    },

    async createBill(input) {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => r.json())
      if (!res.success) throw new Error(res.error)
      return { _id: res.data._id }
    },

    async generatePdfBlob(billId, currency) {
      const url = currency
        ? `/api/bills/${billId}/pdf?currency=${encodeURIComponent(currency)}`
        : `/api/bills/${billId}/pdf`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to generate PDF")
      return res.blob()
    },
  }
}
