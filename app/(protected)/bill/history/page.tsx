"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
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
import { Trash2 } from "lucide-react"
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
          <Link href="/bill/new">New Bill</Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">No bills yet.</p>
          <Button className="mt-4" asChild>
            <Link href="/bill/new">Create Your First Bill</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bills.map((bill) => (
              <Card key={bill._id} className="transition-all hover:shadow-md hover:border-primary/50 h-full relative group">
                <Link href={`/bill/${bill._id}`} className="absolute inset-0 z-0" />
                <CardContent className="p-4 space-y-3 relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {formatDateShort(bill.billingPeriod.from)} —{" "}
                        {formatDateShort(bill.billingPeriod.to)}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {bill.totalUnits} units · {formatCurrency(bill.computed.perUnitPrice, currency)}/unit
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0",
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
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold">
                        {formatCurrency(bill.totalBill, currency)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault()
                          setDeleteDialog({ open: true, bill })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
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
