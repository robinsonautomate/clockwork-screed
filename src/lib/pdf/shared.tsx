import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import { LOGO_PNG_DATA_URL } from "./logo";

export const COMPANY = {
  name: "Clockwork Screed Ltd",
  tagline: "Liquid floor screed & poured insulation",
  addressLines: ["Unit 5, Brinksway Trade Park", "Stockport SK3 0BY"],
  phone: "0161 478 0090",
  email: "office@clockworkscreed.co.uk",
  web: "clockworkscreed.co.uk",
  region: "Cheshire · Gtr Manchester · Merseyside · Lancashire · N Wales",
};

export const C = {
  slate900: "#0f172a",
  slate800: "#1e293b",
  slate600: "#475569",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50: "#f8fafc",
  amber: "#f59e0b",
  white: "#ffffff",
  green: "#16a34a",
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: C.slate800,
    lineHeight: 1.45,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandName: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: C.slate900,
    letterSpacing: 0.3,
  },
  brandTagline: { fontSize: 7.5, color: C.slate500, marginTop: 1 },
  companyBlock: { textAlign: "right", fontSize: 8, color: C.slate600 },
  rule: { height: 2, backgroundColor: C.slate800, marginTop: 14 },
  ruleAmber: { height: 2, backgroundColor: C.amber, marginTop: 0, width: 70 },
  docTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: C.slate900,
    letterSpacing: 1,
  },
  metaLabel: {
    fontSize: 7,
    color: C.slate400,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metaValue: { fontSize: 9.5, color: C.slate800, fontFamily: "Helvetica-Bold" },
  panel: {
    borderWidth: 1,
    borderColor: C.slate200,
    borderRadius: 4,
    padding: 10,
  },
  panelLabel: {
    fontSize: 7,
    color: C.slate400,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.slate800,
    color: C.white,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.slate100,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: C.slate200,
    paddingTop: 8,
    fontSize: 7,
    color: C.slate400,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export function Letterhead() {
  return (
    <View>
      <View style={styles.headerRow}>
        {/* Brand logo, top-left */}
        <Image src={LOGO_PNG_DATA_URL} style={{ width: 168, height: 49 }} />
        <View style={styles.companyBlock}>
          <Text style={{ fontFamily: "Helvetica-Bold", color: C.slate800 }}>
            {COMPANY.name}
          </Text>
          {COMPANY.addressLines.map((l) => (
            <Text key={l}>{l}</Text>
          ))}
          <Text>{COMPANY.phone}</Text>
          <Text>{COMPANY.email}</Text>
        </View>
      </View>
      <View style={styles.rule} />
      <View style={styles.ruleAmber} />
    </View>
  );
}

export function PageFooter({ note }: { note: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{COMPANY.name}</Text>
      <Text>{note}</Text>
      <Text>{COMPANY.web}</Text>
    </View>
  );
}
