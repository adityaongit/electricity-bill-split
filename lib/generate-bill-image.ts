import { formatCurrency, formatDate } from "@/lib/utils"
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency"
import { config as appConfig } from "@/lib/config"
import type { BillDetailData, FlatData } from "@/lib/data-service"

const W = 780
const PAD = 36
const CELL_PAD = 12   // inner left/right padding inside each table cell
const ROW_H = 40
const FONT = "Arial, Helvetica, sans-serif"

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function cellTx(col: { x: number; w: number; align: string }): number {
  return col.align === "end" ? col.x + col.w - CELL_PAD : col.x + CELL_PAD
}

function buildSvg(
  bill: BillDetailData,
  flat: FlatData | null,
  currency: CurrencyCode
): { svg: string; height: number } {
  const getLabel = (slug: string) => flat?.areas.find((a) => a.slug === slug)?.label ?? slug
  const fmt = (n: number) => esc(formatCurrency(n, currency))

  const splits = bill.splits
  const submeterEntries = Object.entries(bill.submeterReadings)

  // ── Layout constants ──────────────────────────────────────────────────────
  const summaryTop = 96
  const summaryH = 72
  const subTop = summaryTop + summaryH + 28        // "Submeter Readings" title
  const subTableTop = subTop + 14                   // divider
  const subHeaderTop = subTableTop + 8              // header row
  const subBodyTop = subHeaderTop + ROW_H           // first data row
  const subRowCount = submeterEntries.length + 1    // +1 for Common row
  const distTop = subBodyTop + subRowCount * ROW_H + 28 // "Individual Distribution" title
  const distTableTop = distTop + 14
  const distHeaderTop = distTableTop + 8
  const distBodyTop = distHeaderTop + ROW_H
  const footerY = distBodyTop + splits.length * ROW_H + 32
  const H = footerY + 20

  // ── Summary cards ─────────────────────────────────────────────────────────
  const summaryItems = [
    { label: "Total Bill", value: fmt(bill.totalBill) },
    { label: "Total Units", value: `${bill.totalUnits} units` },
    { label: "Per Unit Price", value: fmt(bill.computed.perUnitPrice) },
    { label: "Common Units", value: `${bill.computed.commonUnits} units` },
  ]
  const cardW = (W - PAD * 2 - 12 * 3) / 4
  const summaryCards = summaryItems
    .map((item, i) => {
      const x = PAD + i * (cardW + 12)
      const midX = x + cardW / 2
      return `
      <rect x="${x}" y="${summaryTop}" width="${cardW}" height="${summaryH}" rx="6" fill="#f5f5f5"/>
      <text x="${midX}" y="${summaryTop + 24}" font-family="${FONT}" font-size="11" fill="#777" text-anchor="middle">${esc(item.label)}</text>
      <text x="${midX}" y="${summaryTop + 52}" font-family="${FONT}" font-size="16" font-weight="bold" text-anchor="middle">${item.value}</text>`
    })
    .join("")

  // ── Submeter readings columns ──────────────────────────────────────────────
  const subCols = [
    { label: "Area",     x: PAD,           w: 180, align: "start" },
    { label: "Previous", x: PAD + 180,     w: 110, align: "end" },
    { label: "Current",  x: PAD + 290,     w: 110, align: "end" },
    { label: "Units",    x: PAD + 400,     w: 90,  align: "end" },
    { label: "Cost",     x: PAD + 490,     w: W - PAD - (PAD + 490), align: "end" },
  ]

  const subHeaderCells = subCols
    .map((col) => {
      const tx = cellTx(col)
      return `<text x="${tx}" y="${subHeaderTop + 26}" font-family="${FONT}" font-size="11" font-weight="bold" text-anchor="${col.align === "end" ? "end" : "start"}" fill="#333">${esc(col.label)}</text>`
    })
    .join("")

  const subRows = [
    ...submeterEntries.map(([slug, reading], i) => {
      const y = subBodyTop + i * ROW_H
      const bg = i % 2 === 0 ? "#fff" : "#fafafa"
      const units = bill.computed.areaUnits[slug] ?? 0
      const cost = bill.computed.areaCosts[slug] ?? 0
      const cells = [
        { col: subCols[0], val: esc(getLabel(slug)) },
        { col: subCols[1], val: String(reading.previous) },
        { col: subCols[2], val: String(reading.current) },
        { col: subCols[3], val: String(units) },
        { col: subCols[4], val: fmt(cost) },
      ]
      return rowSvg(cells, y, bg)
    }),
    // Common row
    (() => {
      const i = submeterEntries.length
      const y = subBodyTop + i * ROW_H
      const bg = i % 2 === 0 ? "#fff" : "#fafafa"
      const cells = [
        { col: subCols[0], val: "Common" },
        { col: subCols[1], val: "—" },
        { col: subCols[2], val: "—" },
        { col: subCols[3], val: String(bill.computed.commonUnits) },
        { col: subCols[4], val: fmt(bill.computed.commonCost) },
      ]
      return rowSvg(cells, y, bg)
    })(),
  ].join("")

  // ── Distribution table columns ─────────────────────────────────────────────
  const distCols = [
    { label: "Name",       x: PAD,       w: 130, align: "start", bold: false },
    { label: "Area",       x: PAD + 130, w: 100, align: "start", bold: false },
    { label: "Days",       x: PAD + 230, w: 55,  align: "end",   bold: false },
    { label: "Area Share", x: PAD + 285, w: 80,  align: "end",   bold: false },
    { label: "Area Cost",  x: PAD + 365, w: 100, align: "end",   bold: false },
    { label: "Common",     x: PAD + 465, w: 100, align: "end",   bold: false },
    { label: "Total",      x: PAD + 565, w: W - PAD - (PAD + 565), align: "end", bold: true },
  ]

  const distHeaderCells = distCols
    .map((col) => {
      const tx = cellTx(col)
      return `<text x="${tx}" y="${distHeaderTop + 26}" font-family="${FONT}" font-size="11" font-weight="bold" text-anchor="${col.align === "end" ? "end" : "start"}" fill="#333">${esc(col.label)}</text>`
    })
    .join("")

  const distRows = splits
    .map((s, i) => {
      const y = distBodyTop + i * ROW_H
      const bg = i % 2 === 0 ? "#fff" : "#fafafa"
      const cells = [
        { col: distCols[0], val: esc(s.roommateName) },
        { col: distCols[1], val: esc(getLabel(s.area)) },
        { col: distCols[2], val: String(s.daysStayed) },
        { col: distCols[3], val: `${s.areaSharePercent}%` },
        { col: distCols[4], val: fmt(s.areaCost) },
        { col: distCols[5], val: fmt(s.commonCost) },
        { col: distCols[6], val: fmt(s.totalAmount), bold: true },
      ]
      return rowSvg(cells, y, bg)
    })
    .join("")

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#fff"/>

    <!-- Title -->
    <text x="${PAD}" y="46" font-family="${FONT}" font-size="22" font-weight="bold" fill="#111">Electricity Bill Split</text>
    <text x="${PAD}" y="70" font-family="${FONT}" font-size="13" fill="#666">${esc(formatDate(bill.billingPeriod.from))} \u2014 ${esc(formatDate(bill.billingPeriod.to))}</text>

    <!-- Summary cards -->
    ${summaryCards}

    <!-- Submeter Readings section -->
    <text x="${PAD}" y="${subTop}" font-family="${FONT}" font-size="14" font-weight="bold" fill="#111">Submeter Readings</text>
    <line x1="${PAD}" y1="${subTableTop}" x2="${W - PAD}" y2="${subTableTop}" stroke="#ddd" stroke-width="1"/>
    <rect x="${PAD}" y="${subHeaderTop}" width="${W - PAD * 2}" height="${ROW_H}" fill="#f5f5f5" rx="3"/>
    ${subHeaderCells}
    ${subRows}

    <!-- Individual Distribution section -->
    <text x="${PAD}" y="${distTop}" font-family="${FONT}" font-size="14" font-weight="bold" fill="#111">Individual Distribution</text>
    <line x1="${PAD}" y1="${distTableTop}" x2="${W - PAD}" y2="${distTableTop}" stroke="#ddd" stroke-width="1"/>
    <rect x="${PAD}" y="${distHeaderTop}" width="${W - PAD * 2}" height="${ROW_H}" fill="#f5f5f5" rx="3"/>
    ${distHeaderCells}
    ${distRows}

    <!-- Footer -->
    <text x="${W - PAD}" y="${footerY}" font-family="${FONT}" font-size="11" fill="#bbb" text-anchor="end">Generated by ${esc(appConfig.app.name)}</text>
  </svg>`

  return { svg, height: H }
}

function rowSvg(
  cells: { col: { x: number; w: number; align: string }; val: string; bold?: boolean }[],
  y: number,
  bg: string
): string {
  const cellsSvg = cells
    .map(({ col, val, bold }) => {
      const fw = bold ? "bold" : "normal"
      return `<text x="${cellTx(col)}" y="${y + 26}" font-family="${FONT}" font-size="12" font-weight="${fw}" text-anchor="${col.align === "end" ? "end" : "start"}" fill="#111">${val}</text>`
    })
    .join("")
  return `
    <rect x="${PAD}" y="${y}" width="${W - PAD * 2}" height="${ROW_H}" fill="${bg}"/>
    <line x1="${PAD}" y1="${y + ROW_H}" x2="${W - PAD}" y2="${y + ROW_H}" stroke="#eee" stroke-width="1"/>
    ${cellsSvg}`
}

export function generateBillImageDataUrl(
  bill: BillDetailData,
  flat: FlatData | null,
  currency: CurrencyCode = DEFAULT_CURRENCY
): Promise<string> {
  const { svg, height } = buildSvg(bill, flat, currency)

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    canvas.width = W * 2
    canvas.height = height * 2
    const ctx = canvas.getContext("2d")!
    ctx.scale(2, 2)
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, W, height)

    const img = new Image()
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/png"))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to render bill image"))
    }
    img.src = url
  })
}

export async function generateBillImageBlob(
  bill: BillDetailData,
  flat: FlatData | null,
  currency: CurrencyCode = DEFAULT_CURRENCY
): Promise<Blob> {
  const dataUrl = await generateBillImageDataUrl(bill, flat, currency)
  const res = await fetch(dataUrl)
  return res.blob()
}
