import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { InvoiceDetail } from "@/lib/queries/invoices";
import { formatDate, gbp } from "@/lib/format";
import { C, Letterhead, PageFooter, styles } from "./shared";

const COL = {
  desc: { flexGrow: 1, flexBasis: 0 },
  qty: { width: 56, textAlign: "right" as const },
  unit: { width: 46, textAlign: "center" as const },
  price: { width: 70, textAlign: "right" as const },
  total: { width: 74, textAlign: "right" as const },
};

export function InvoiceDocument({ invoice }: { invoice: InvoiceDetail }) {
  const { job } = invoice;
  const { site, contact } = job;
  const lines = job.quote?.lines ?? [];

  return (
    <Document
      title={`Invoice ${invoice.invoiceNumber}`}
      author="Clockwork Screed Ltd"
    >
      <Page size="A4" style={styles.page}>
        <Letterhead />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 18,
          }}
        >
          <Text style={styles.docTitle}>INVOICE</Text>
          <View style={{ flexDirection: "row", gap: 22 }}>
            <View>
              <Text style={styles.metaLabel}>Invoice no.</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Issued</Text>
              <Text style={styles.metaValue}>
                {formatDate(invoice.createdAt)}
              </Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Due</Text>
              <Text style={styles.metaValue}>
                {formatDate(invoice.dueDate)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
          <View style={[styles.panel, { flexGrow: 1, flexBasis: 0 }]}>
            <Text style={styles.panelLabel}>Invoice to</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>
              {contact.company ?? contact.name}
            </Text>
            {contact.company && <Text>{contact.name}</Text>}
            {contact.email && (
              <Text style={{ color: C.slate500 }}>{contact.email}</Text>
            )}
          </View>
          <View style={[styles.panel, { flexGrow: 1, flexBasis: 0 }]}>
            <Text style={styles.panelLabel}>Job & site</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>
              {job.jobNumber}
            </Text>
            <Text>{site.addressLine1}</Text>
            <Text>
              {site.town}, {site.postcode}
            </Text>
          </View>
        </View>

        {/* Lines */}
        <View style={{ marginTop: 16 }}>
          <View style={styles.tableHead}>
            <Text style={COL.desc}>Description</Text>
            <Text style={COL.qty}>Qty</Text>
            <Text style={COL.unit}>Unit</Text>
            <Text style={COL.price}>Unit price</Text>
            <Text style={COL.total}>Amount</Text>
          </View>
          {lines.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[COL.desc, { color: C.slate500 }]}>
                {job.screedType} — screed installation
              </Text>
              <Text style={COL.qty}>1</Text>
              <Text style={COL.unit}>job</Text>
              <Text style={COL.price}>{gbp(invoice.subtotal)}</Text>
              <Text style={[COL.total, { fontFamily: "Helvetica-Bold" }]}>
                {gbp(invoice.subtotal)}
              </Text>
            </View>
          ) : (
            lines.map((line) => (
              <View key={line.id} style={styles.tableRow}>
                <Text style={COL.desc}>{line.description}</Text>
                <Text style={COL.qty}>{line.qty}</Text>
                <Text style={COL.unit}>{line.unit}</Text>
                <Text style={COL.price}>{gbp(line.unitPrice)}</Text>
                <Text style={[COL.total, { fontFamily: "Helvetica-Bold" }]}>
                  {gbp(line.lineTotal)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Totals */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 12,
          }}
        >
          <View style={{ width: 220 }}>
            <TotalRow label="Subtotal" value={gbp(invoice.subtotal)} />
            <TotalRow label="VAT at 20%" value={gbp(invoice.vat)} />
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
                Total due
              </Text>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11 }}>
                {gbp(invoice.total)}
              </Text>
            </View>
          </View>
        </View>

        {invoice.status === "paid" && (
          <View
            style={{
              marginTop: 14,
              alignSelf: "flex-start",
              borderWidth: 1.5,
              borderColor: C.green,
              borderRadius: 4,
              paddingVertical: 4,
              paddingHorizontal: 10,
            }}
          >
            <Text
              style={{
                color: C.green,
                fontFamily: "Helvetica-Bold",
                fontSize: 12,
              }}
            >
              PAID{invoice.paidAt ? ` — ${formatDate(invoice.paidAt)}` : ""}
            </Text>
          </View>
        )}

        {/* Payment details */}
        <View
          style={{
            marginTop: 22,
            borderTopWidth: 1,
            borderTopColor: C.slate200,
            paddingTop: 10,
          }}
        >
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
            Payment details
          </Text>
          <Text style={{ color: C.slate600 }}>
            Payment due within 14 days of invoice date. Please pay by BACS and
            quote {invoice.invoiceNumber} as the reference.
          </Text>
          <Text style={{ color: C.slate600, marginTop: 3 }}>
            Account name: Clockwork Screed Ltd · Sort code 09-01-29 · Account
            41827733
          </Text>
        </View>

        <PageFooter note={`Invoice ${invoice.invoiceNumber}`} />
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
