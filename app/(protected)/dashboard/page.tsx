"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { useDataService } from "@/lib/guest-context"
import { useCurrency } from "@/lib/currency-context"
import { useSession } from "@/lib/auth-client"
import { trackSignupSuccess } from "@/lib/analytics"
import { config } from "@/lib/config"
import {
  Receipt, TrendingUp, Zap, BarChart3,
  Plus, History, Users, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Bar, BarChart,
  Area, AreaChart,
  CartesianGrid, XAxis, YAxis,
} from "recharts"
import type { BillData } from "@/lib/data-service"

interface DashboardData {
  flat: { _id: string; name: string } | null
  totalBills: number
  bills: BillData[]
  recentBill: BillData | null
  totalSpent: number
}

const spendingChartConfig = {
  amount: {
    label: "Bill Amount",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const unitsChartConfig = {
  units: {
    label: "Units",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function TrendBadge({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null || previous === 0) return null
  const pct = ((current - previous) / previous) * 100
  if (Math.abs(pct) < 0.5) return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" /> same as last
    </span>
  )
  const up = pct > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(pct).toFixed(0)}% vs last
    </span>
  )
}

export default function DashboardPage() {
  const { service } = useDataService()
  const { currency } = useCurrency()
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.createdAt) return
    const isNewUser = Date.now() - new Date(session.user.createdAt).getTime() < 60_000
    if (isNewUser) trackSignupSuccess("google")
  }, [session?.user?.id])

  useEffect(() => {
    async function load() {
      const flats = await service.getFlats()
      const flat = flats[0] ?? null
      if (!flat) {
        setData({ flat: null, totalBills: 0, bills: [], recentBill: null, totalSpent: 0 })
        setLoading(false)
        return
      }
      const result = await service.getBills(flat._id, 1, 50)
      const bills = result.bills
      const totalSpent = bills.reduce((sum, b) => sum + b.totalBill, 0)
      setData({ flat, totalBills: result.pagination.total, bills, recentBill: bills[0] ?? null, totalSpent })
      setLoading(false)
    }
    load()
  }, [service])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5"><Skeleton className="h-7 w-32" /><Skeleton className="h-4 w-20" /></div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-60 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!data?.flat) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Welcome to {config.app.name}!</h2>
        <p className="mt-2 text-muted-foreground max-w-sm">Get started by creating your flat and adding roommates.</p>
        <Button className="mt-6" asChild><Link href="/settings">Create Your Flat</Link></Button>
      </div>
    )
  }

  // Chart data — oldest→newest, last 12
  const chartBills = [...data.bills].reverse().slice(-12)
  const chartData = chartBills.map((bill) => ({
    label: formatDateShort(bill.billingPeriod.from),
    amount: bill.totalBill,
    units: bill.totalUnits,
  }))

  const recentBill = data.recentBill
  const prevBill = data.bills[1] ?? null
  const avgBill = data.totalBills > 0 ? data.totalSpent / data.totalBills : 0
  const avgUnit = recentBill ? recentBill.computed.perUnitPrice : 0

  const stats = [
    {
      label: "Total Bills",
      value: String(data.totalBills),
      sub: null,
      icon: Receipt,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Total Spent",
      value: formatCurrency(data.totalSpent, currency),
      sub: data.totalBills > 0 ? `avg. ${formatCurrency(avgBill, currency)}/bill` : null,
      icon: TrendingUp,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Latest Bill",
      value: recentBill ? formatCurrency(recentBill.totalBill, currency) : "—",
      trend: recentBill ? <TrendBadge current={recentBill.totalBill} previous={prevBill?.totalBill ?? null} /> : null,
      icon: Zap,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
    },
    {
      label: "Avg. Per Unit",
      value: recentBill ? formatCurrency(avgUnit, currency) : "—",
      sub: recentBill ? `${recentBill.totalUnits} units latest` : null,
      icon: BarChart3,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">{data.flat.name}</p>
        </div>
        <Button asChild>
          <Link href="/bill/new"><Plus className="h-4 w-4 mr-1.5" />New Bill</Link>
        </Button>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-3 sm:p-4 lg:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
                      {stat.label}
                    </p>
                    <p className="mt-1.5 text-[clamp(1rem,4vw,2rem)] font-bold leading-[1.05] tracking-tight [overflow-wrap:anywhere] tabular-nums sm:text-[clamp(1.35rem,3vw,2rem)]">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${stat.iconBg}`}>
                    <Icon className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${stat.iconColor}`} />
                  </div>
                </div>
                {(stat as any).trend && <div className="mt-1.5 text-[11px] sm:mt-2 sm:text-xs">{(stat as any).trend}</div>}
                {stat.sub && !((stat as any).trend) && (
                  <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground sm:mt-2 sm:text-xs">
                    {stat.sub}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions — compact bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground mr-1">Quick:</span>
        <Button size="sm" asChild>
          <Link href="/bill/new"><Plus className="h-3.5 w-3.5 mr-1" />New Bill</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/bill/history"><History className="h-3.5 w-3.5 mr-1" />History</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/roommates"><Users className="h-3.5 w-3.5 mr-1" />Roommates</Link>
        </Button>
      </div>

      {/* Two charts side by side */}
      {chartData.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Area chart — spending trend */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Spending Trend</CardTitle>
              <CardDescription className="text-xs">Bill amounts over time</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0 pb-4 px-3">
              <ChartContainer config={spendingChartConfig} className="h-[200px] w-full">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    width={52}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) => formatCurrency(v, currency)}
                  />
                  <ChartTooltip
                    cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [formatCurrency(Number(value), currency), "Amount"]}
                      />
                    }
                  />
                  <Area
                    dataKey="amount"
                    type="monotone"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#fillAmount)"
                    dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Bar chart — units consumed */}
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Units Consumed</CardTitle>
              <CardDescription className="text-xs">Electricity units per billing period</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0 pb-4 px-3">
              <ChartContainer config={unitsChartConfig} className="h-[200px] w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  barSize={chartData.length <= 4 ? 40 : chartData.length <= 8 ? 28 : undefined}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                    width={40}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  />
                  <ChartTooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`${value} units`, "Consumed"]}
                      />
                    }
                  />
                  <Bar
                    dataKey="units"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                    opacity={0.85}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <BarChart3 className="h-10 w-10 text-muted-foreground/20" />
            <div>
              <p className="text-sm font-medium">No data to chart yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">Create bills to see your spending trend</p>
            </div>
            <Button size="sm" asChild><Link href="/bill/new">Create First Bill</Link></Button>
          </CardContent>
        </Card>
      )}

      {/* Recent bill */}
      {recentBill && (
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Most Recent Bill</p>
                <p className="font-semibold text-sm">
                  {formatDateShort(recentBill.billingPeriod.from)} — {formatDateShort(recentBill.billingPeriod.to)}
                </p>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{recentBill.totalUnits}</span> units
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{formatCurrency(recentBill.computed.perUnitPrice, currency)}</span>/unit
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    Total: {formatCurrency(recentBill.totalBill, currency)}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full shrink-0 sm:w-auto" asChild>
                <Link href={`/bill/${recentBill._id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
