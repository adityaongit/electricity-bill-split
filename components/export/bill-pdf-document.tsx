import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import { formatCurrency } from "@/lib/utils"
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency"
import { config } from "@/lib/config"

Font.register({
  family: "NotoSans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5/files/noto-sans-all-400-normal.woff2",
      fontWeight: "normal",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5/files/noto-sans-all-700-normal.woff2",
      fontWeight: "bold",
    },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "NotoSans" },
  title: { fontSize: 18, marginBottom: 4, fontFamily: "NotoSans", fontWeight: "bold" },
  subtitle: { fontSize: 10, color: "#666", marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  label: { color: "#555" },
  value: { fontFamily: "NotoSans", fontWeight: "bold" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 6,
    fontFamily: "NotoSans",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    fontSize: 9,
  },
  col1: { width: "20%" },
  col2: { width: "12%" },
  col3: { width: "10%", textAlign: "right" },
  col4: { width: "14%", textAlign: "right" },
  col5: { width: "16%", textAlign: "right" },
  col6: { width: "14%", textAlign: "right" },
  col7: { width: "14%", textAlign: "right", fontFamily: "NotoSans", fontWeight: "bold" },
  footer: { position: "absolute", bottom: 30, left: 40, fontSize: 8, color: "#999" },
})

interface BillPdfProps {
  bill: {
    billingPeriod: { from: string; to: string }
    totalBill: number
    totalUnits: number
    submeterReadings: Record<string, { previous: number; current: number }>
    computed: {
      areaUnits: Record<string, number>
      commonUnits: number
      perUnitPrice: number
      areaCosts: Record<string, number>
      commonCost: number
    }
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
  flat?: {
    areas: { slug: string; label: string }[]
  }
  currency?: CurrencyCode
}

function fmt(n: number, currencyCode: CurrencyCode) {
  return formatCurrency(n, currencyCode)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function BillPdfDocument({ bill, flat, currency = DEFAULT_CURRENCY }: BillPdfProps) {
  const getAreaLabel = (slug: string) => flat?.areas.find((a) => a.slug === slug)?.label || slug

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Electricity Bill Split</Text>
        <Text style={styles.subtitle}>
          {fmtDate(bill.billingPeriod.from)} to {fmtDate(bill.billingPeriod.to)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Bill</Text>
            <Text style={styles.value}>{fmt(bill.totalBill, currency)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Units</Text>
            <Text style={styles.value}>{bill.totalUnits}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Per Unit Price</Text>
            <Text style={styles.value}>{fmt(bill.computed.perUnitPrice, currency)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Area Breakdown</Text>
          {Object.entries(bill.submeterReadings).map(([slug, reading]) => (
            <View key={slug} style={styles.row}>
              <Text style={styles.label}>
                {getAreaLabel(slug)}: {reading.previous} to {reading.current} = {bill.computed.areaUnits[slug]} units
              </Text>
              <Text style={styles.value}>{fmt(bill.computed.areaCosts[slug] || 0, currency)}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text style={styles.label}>Common: {bill.computed.commonUnits} units</Text>
            <Text style={styles.value}>{fmt(bill.computed.commonCost, currency)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Distribution</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Name</Text>
            <Text style={styles.col2}>Area</Text>
            <Text style={styles.col3}>Days</Text>
            <Text style={styles.col4}>Area Share %</Text>
            <Text style={styles.col5}>Area Cost</Text>
            <Text style={styles.col6}>Common</Text>
            <Text style={styles.col7}>Total</Text>
          </View>
          {bill.splits.map((s, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{s.roommateName}</Text>
              <Text style={styles.col2}>{getAreaLabel(s.area)}</Text>
              <Text style={styles.col3}>{s.daysStayed}</Text>
              <Text style={styles.col4}>{s.areaSharePercent}%</Text>
              <Text style={styles.col5}>{fmt(s.areaCost, currency)}</Text>
              <Text style={styles.col6}>{fmt(s.commonCost, currency)}</Text>
              <Text style={styles.col7}>{fmt(s.totalAmount, currency)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Generated by {config.app.name} - {new URL(process.env.NEXT_PUBLIC_APP_URL ?? config.app.url).hostname}</Text>
      </Page>
    </Document>
  )
}
