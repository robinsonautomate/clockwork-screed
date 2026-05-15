import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { QuoteDetail } from "@/lib/queries/quotes";
import { formatArea, formatDate, gbp } from "@/lib/format";
import { C, Letterhead, PageFooter, styles } from "./shared";

const COL = {
  desc: { flexGrow: 1, flexBasis: 0 },
  qty: { width: 52, textAlign: "right" as const },
  unit: { width: 46, textAlign: "center" as const },
  price: { width: 70, textAlign: "right" as const },
  total: { width: 74, textAlign: "right" as const },
};

const TERMS = [
  "Prices exclude VAT, which is charged at the prevailing rate of 20%.",
  "Quotation valid for 30 days from the date of issue.",
  "Programme is subject to site readiness — sub-base, edge insulation, DPM and underfloor heating must be installed and signed off prior to pour.",
  "Payment terms: 14 days from date of invoice unless agreed otherwise.",
  "All screed laid to SR2 surface regularity. Drying and protection guidance issued on completion.",
];

export function QuoteDocument({ quote }: { quote: QuoteDetail }) {
  const { enquiry } = quote;
  const { site, contact } = enquiry;

  return (
    <Document
      title={`Quotation ${quote.quoteNumber}`}
      author="Clockwork Screed Ltd"
    >
      <Page size="A4" style={styles.page}>
        <Letterhead />

        {/* Title + meta */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 18,
          }}
        >
          <View>
            <Text style={styles.docTitle}>QUOTATION</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 22 }}>
            <View>
              <Text style={styles.metaLabel}>Quote no.</Text>
              <Text style={styles.metaValue}>{quote.quoteNumber}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Issued</Text>
              <Text style={styles.metaValue}>
                {formatDate(quote.createdAt)}
              </Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Valid until</Text>
              <Text style={styles.metaValue}>
                {formatDate(quote.validUntil)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quote-for + project */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
          <View style={[styles.panel, { flexGrow: 1, flexBasis: 0 }]}>
            <Text style={styles.panelLabel}>Quotation for</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>
              {contact.company ?? contact.name}
            </Text>
            {contact.company && <Text>{contact.name}</Text>}
            {contact.email && (
              <Text style={{ color: C.slate500 }}>{contact.email}</Text>
            )}
            {contact.phone && (
              <Text style={{ color: C.slate500 }}>{contact.phone}</Text>
            )}
          </View>
          <View style={[styles.panel, { flexGrow: 1, flexBasis: 0 }]}>
            <Text style={styles.panelLabel}>Site</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>
              {site.addressLine1}
            </Text>
            {site.addressLine2 && <Text>{site.addressLine2}</Text>}
            <Text>
              {site.town}, {site.postcode}
            </Text>
            <Text style={{ color: C.slate500, marginTop: 2 }}>
              {enquiry.projectType} · {enquiry.screedType}
            </Text>
            <Text style={{ color: C.slate500 }}>
              {formatArea(enquiry.areaM2)} at {enquiry.depthMm}mm
            </Text>
          </View>
        </View>

        {/* Line items */}
        <View style={{ marginTop: 16 }}>
          <View style={styles.tableHead}>
            <Text style={COL.desc}>Description</Text>
            <Text style={COL.qty}>Qty</Text>
            <Text style={COL.unit}>Unit</Text>
            <Text style={COL.price}>Unit price</Text>
            <Text style={COL.total}>Line total</Text>
          </View>
          {quote.lines.map((line) => (
            <View key={line.id} style={styles.tableRow}>
              <Text style={COL.desc}>{line.description}</Text>
              <Text style={COL.qty}>{line.qty}</Text>
              <Text style={COL.unit}>{line.unit}</Text>
              <Text style={COL.price}>{gbp(line.unitPrice)}</Text>
              <Text style={[COL.total, { fontFamily: "Helvetica-Bold" }]}>
                {gbp(line.lineTotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
          <View style={{ width: 220 }}>
            <TotalRow label="Subtotal" value={gbp(quote.subtotal)} />
            <TotalRow label="VAT at 20%" value={gbp(quote.vat)} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                backgroundColor: C.slate800,
                color: C.white,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 4,
                marginTop: 4,
              }}
            >
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>
                Total
              </Text>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>
                {gbp(quote.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={{ marginTop: 22 }}>
          <Text
            style={{
              fontSize: 8,
              fontFamily: "Helvetica-Bold",
              textTransform: "uppercase",
              letterSpacing: 0.6,
              color: C.slate500,
              marginBottom: 4,
            }}
          >
            Terms &amp; conditions
          </Text>
          {TERMS.map((t) => (
            <View key={t} style={{ flexDirection: "row", marginBottom: 2 }}>
              <Text style={{ color: C.amber, marginRight: 4 }}>•</Text>
              <Text style={{ flexGrow: 1, flexBasis: 0, color: C.slate600 }}>
                {t}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            marginTop: 16,
            fontSize: 8.5,
            color: C.slate500,
          }}
        >
          Thank you for the opportunity to quote. To proceed, please confirm
          acceptance and we will schedule your pour.
        </Text>

        <PageFooter note={`Quotation ${quote.quoteNumber}`} />
      </Page>
    </Document>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 3,
        paddingHorizontal: 10,
      }}
    >
      <Text style={{ color: C.slate500 }}>{label}</Text>
      <Text style={{ fontFamily: "Helvetica-Bold" }}>{value}</Text>
    </View>
  );
}
