import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 10, color: "#666", marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
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
  value: { fontFamily: "Helvetica-Bold" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 6,
    fontFamily: "Helvetica-Bold",
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
  col7: { width: "14%", textAlign: "right", fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 30, left: 40, fontSize: 8, color: "#999" },
})

interface BillPdfProps {
  bill: {
    billingPeriod: { from: string; to: string }
    totalBill: number
    totalUnits: number
    submeterReadings: {
      hall: { previous: number; current: number }
      room: { previous: number; current: number }
    }
    computed: {
      hallUnits: number
      roomUnits: number
      commonUnits: number
      perUnitPrice: number
      hallCost: number
      roomCost: number
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
}

function fmt(n: number) {
  return `₹${n.toFixed(2)}`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function BillPdfDocument({ bill }: BillPdfProps) {
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
            <Text style={styles.value}>{fmt(bill.totalBill)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Units</Text>
            <Text style={styles.value}>{bill.totalUnits}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Per Unit Price</Text>
            <Text style={styles.value}>{fmt(bill.computed.perUnitPrice)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Area Breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.label}>
              Hall: {bill.submeterReadings.hall.previous} to {bill.submeterReadings.hall.current} = {bill.computed.hallUnits} units
            </Text>
            <Text style={styles.value}>{fmt(bill.computed.hallCost)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>
              Room: {bill.submeterReadings.room.previous} to {bill.submeterReadings.room.current} = {bill.computed.roomUnits} units
            </Text>
            <Text style={styles.value}>{fmt(bill.computed.roomCost)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Common: {bill.computed.commonUnits} units</Text>
            <Text style={styles.value}>{fmt(bill.computed.commonCost)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Distribution</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Name</Text>
            <Text style={styles.col2}>Area</Text>
            <Text style={styles.col3}>Days</Text>
            <Text style={styles.col4}>Share %</Text>
            <Text style={styles.col5}>Area Cost</Text>
            <Text style={styles.col6}>Common</Text>
            <Text style={styles.col7}>Total</Text>
          </View>
          {bill.splits.map((s, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{s.roommateName}</Text>
              <Text style={styles.col2}>{s.area}</Text>
              <Text style={styles.col3}>{s.daysStayed}</Text>
              <Text style={styles.col4}>{s.areaSharePercent}%</Text>
              <Text style={styles.col5}>{fmt(s.areaCost)}</Text>
              <Text style={styles.col6}>{fmt(s.commonCost)}</Text>
              <Text style={styles.col7}>{fmt(s.totalAmount)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Generated by SplitWatt</Text>
      </Page>
    </Document>
  )
}
