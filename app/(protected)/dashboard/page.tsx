"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { useDataService } from "@/lib/guest-context"
import { useCurrency } from "@/lib/currency-context"

interface DashboardData {
  flat: { _id: string; name: string } | null
  totalBills: number
  recentBill: {
    _id: string
    billingPeriod: { from: string; to: string }
    totalBill: number
    totalUnits: number
    computed: { perUnitPrice: number }
    createdAt: string
  } | null
  totalSpent: number
}

export default function DashboardPage() {
  const { service } = useDataService()
  const { currency } = useCurrency()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const flats = await service.getFlats()
      const flat = flats[0] ?? null

      if (!flat) {
        setData({ flat: null, totalBills: 0, recentBill: null, totalSpent: 0 })
        setLoading(false)
        return
      }

      const result = await service.getBills(flat._id, 1, 50)
      const bills = result.bills
      const totalSpent = bills.reduce((sum, b) => sum + b.totalBill, 0)

      setData({
        flat,
        totalBills: result.pagination.total,
        recentBill: bills[0] ?? null,
        totalSpent,
      })
      setLoading(false)
    }

    load()
  }, [service])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    )
  }

  if (!data?.flat) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Welcome to SplitWatt!</h2>
        <p className="mt-2 text-muted-foreground">
          Get started by creating your flat and adding roommates.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/settings">Create Your Flat</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">{data.flat.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex items-center justify-center">
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Total Bills</p>
            <p className="text-3xl font-bold">{data.totalBills}</p>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-3xl font-bold">{formatCurrency(data.totalSpent, currency)}</p>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Latest Bill</p>
            <p className="text-3xl font-bold">
              {data.recentBill
                ? formatCurrency(data.recentBill.totalBill, currency)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">Avg. Per Unit</p>
            <p className="text-3xl font-bold">
              {data.recentBill
                ? formatCurrency(data.recentBill.computed.perUnitPrice, currency)
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {data.recentBill && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Bill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {formatDateShort(data.recentBill.billingPeriod.from)} —{" "}
                  {formatDateShort(data.recentBill.billingPeriod.to)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.recentBill.totalUnits} units |{" "}
                  {formatCurrency(data.recentBill.totalBill, currency)}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/bill/${data.recentBill._id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/bill/new">Create New Bill</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/bill/history">View History</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/roommates">Manage Roommates</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
