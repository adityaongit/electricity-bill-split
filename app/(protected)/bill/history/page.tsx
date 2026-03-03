"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { useDataService } from "@/lib/guest-context"
import { useCurrency } from "@/lib/currency-context"
import type { BillData } from "@/lib/data-service"
import { trackBillHistoryView } from "@/lib/analytics"
import { Trash2, Plus, Zap, ChevronRight, ChevronLeft } from "lucide-react"
import { toast } from "sonner"

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function BillHistoryPage() {
  const { service } = useDataService()
  const { currency } = useCurrency()
  const [bills, setBills] = useState<BillData[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; bill: BillData | null }>({
    open: false,
    bill: null,
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const flats = await service.getFlats()
      const flat = flats[0]
      if (!flat) {
        setLoading(false)
        return
      }

      const result = await service.getBills(flat._id, page, 10)
      setBills(result.bills)
      setPagination(result.pagination)
      trackBillHistoryView(result.pagination.total)
      setLoading(false)
    }
    load()
  }, [service, page])

  async function handleDeleteBill() {
    if (!deleteDialog.bill) return
    setDeleting(true)
    try {
      await service.deleteBill(deleteDialog.bill._id)
      setBills((prev) => prev.filter((b) => b._id !== deleteDialog.bill?._id))
      setPagination((prev) =>
        prev ? { ...prev, total: prev.total - 1, totalPages: Math.ceil((prev.total - 1) / 10) } : null
      )
      toast.success("Bill deleted successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete bill")
    }
    setDeleting(false)
    setDeleteDialog({ open: false, bill: null })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bill History</h1>
          <p className="text-muted-foreground">
            {pagination
              ? `${pagination.total} bill${pagination.total !== 1 ? "s" : ""}`
              : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/bill/new">
            <Plus className="h-4 w-4 mr-1.5" />
            New Bill
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border overflow-hidden">
          {/* Table header skeleton */}
          <div className="bg-muted/40 px-6 py-3 grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b last:border-b-0 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          ))}
        </div>
      ) : bills.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
            <Zap className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <div>
            <p className="font-medium">No bills yet</p>
            <p className="text-sm text-muted-foreground mt-0.5">Create your first bill to get started</p>
          </div>
          <Button className="mt-2" asChild>
            <Link href="/bill/new">Create Your First Bill</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table layout */}
          <div className="hidden md:block rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Billing Period
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Units
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bills.map((bill) => (
                  <tr
                    key={bill._id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/bill/${bill._id}`} className="block">
                        <span className="font-medium text-sm">
                          {formatDateShort(bill.billingPeriod.from)} — {formatDateShort(bill.billingPeriod.to)}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/bill/${bill._id}`} className="block">
                        <span className="text-sm text-muted-foreground">{bill.totalUnits}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/bill/${bill._id}`} className="block">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(bill.computed.perUnitPrice, currency)}/unit
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/bill/${bill._id}`} className="block">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            bill.status === "finalized"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "border-border bg-background text-muted-foreground dark:bg-input/30 dark:border-input"
                          )}
                        >
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            bill.status === "finalized" ? "bg-emerald-500" : "bg-muted-foreground/50"
                          )} />
                          {bill.status === "finalized" ? "Done" : "Draft"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/bill/${bill._id}`} className="block">
                        <span className="text-base font-bold tabular-nums">
                          {formatCurrency(bill.totalBill, currency)}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault()
                          setDeleteDialog({ open: true, bill })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card layout */}
          <div className="md:hidden space-y-3">
            {bills.map((bill) => (
              <div key={bill._id} className="relative group rounded-xl border bg-card overflow-hidden">
                <Link href={`/bill/${bill._id}`} className="block p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-sm">
                        {formatDateShort(bill.billingPeriod.from)} — {formatDateShort(bill.billingPeriod.to)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bill.totalUnits} units · {formatCurrency(bill.computed.perUnitPrice, currency)}/unit
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0",
                        bill.status === "finalized"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "border-border bg-background text-muted-foreground"
                      )}
                    >
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        bill.status === "finalized" ? "bg-emerald-500" : "bg-muted-foreground/50"
                      )} />
                      {bill.status === "finalized" ? "Done" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{formatCurrency(bill.totalBill, currency)}</p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteDialog({ open: true, bill })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, bill: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bill for{' '}
              <strong>
                {deleteDialog.bill && formatDateShort(deleteDialog.bill.billingPeriod.from)} —{' '}
                {deleteDialog.bill && formatDateShort(deleteDialog.bill.billingPeriod.to)}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBill}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
