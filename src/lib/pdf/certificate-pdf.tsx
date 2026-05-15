import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import type { JobDetail } from "@/lib/queries/jobs";
import { capitalize, formatArea, formatDate, formatVolume } from "@/lib/format";
import { getAftercareGuidance } from "@/lib/screed";
import { C, Letterhead, PageFooter, styles } from "./shared";

function isRaster(dataUrl: string | null | undefined): boolean {
  return (
    !!dataUrl &&
    (dataUrl.startsWith("data:image/png") ||
      dataUrl.startsWith("data:image/jpeg") ||
      dataUrl.startsWith("data:image/jpg"))
  );
}

export function CertificateDocument({ job }: { job: JobDetail }) {
  const pour = job.pourRecord!;
  const guidance = getAftercareGuidance({
    depthMm: pour.actualDepthMm,
    screedType: pour.screedType,
    pourDate: pour.completedAt,
  });

  return (
    <Document
      title={`Aftercare Certificate ${job.jobNumber}`}
      author="Clockwork Screed Ltd"
    >
      <Page size="A4" style={styles.page}>
        <Letterhead />

        <View style={{ marginTop: 18 }}>
          <Text style={[styles.docTitle, { lineHeight: 1 }]}>
            AFTERCARE CERTIFICATE
          </Text>
          <Text style={{ fontSize: 9, color: C.slate500, marginTop: 10 }}>
            Liquid screed installation — drying, heating &amp; protection
            guidance
          </Text>
        </View>

        {/* Meta */}
        <View style={{ flexDirection: "row", gap: 22, marginTop: 12 }}>
          <Meta label="Job no." value={job.jobNumber} />
          <Meta label="Date of pour" value={formatDate(pour.completedAt)} />
          <Meta label="Certificate issued" value={formatDate(new Date())} />
        </View>

        {/* Site + customer */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
          <View style={[styles.panel, { flexGrow: 1, flexBasis: 0 }]}>
            <Text style={styles.panelLabel}>Site</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>
              {job.site.addressLine1}
            </Text>
            {job.site.addressLine2 && <Text>{job.site.addressLine2}</Text>}
            <Text>
              {job.site.town}, {job.site.postcode}
            </Text>
          </View>
          <View style={[styles.panel, { flexGrow: 1, flexBasis: 0 }]}>
            <Text style={styles.panelLabel}>Customer</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>
              {job.contact.company ?? job.contact.name}
            </Text>
            {job.contact.company && <Text>{job.contact.name}</Text>}
          </View>
        </View>

        {/* Pour details */}
        <SectionHeading>Pour details</SectionHeading>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            borderWidth: 1,
            borderColor: C.slate200,
            borderRadius: 4,
          }}
        >
          <Spec label="Screed type" value={pour.screedType} />
          <Spec label="Batch reference" value={pour.batchRef ?? "—"} />
          <Spec label="Area poured" value={formatArea(pour.actualAreaM2)} />
          <Spec label="Depth" value={`${pour.actualDepthMm} mm`} />
          <Spec label="Volume" value={formatVolume(pour.actualVolumeM3)} />
          <Spec
            label="Conditions"
            value={`${pour.conditions ? capitalize(pour.conditions) : "—"}${
              pour.ambientTempC != null ? `, ${pour.ambientTempC}°C` : ""
            }`}
          />
        </View>

        {/* Drying */}
        <SectionHeading>Drying &amp; protection</SectionHeading>
        <Text style={{ color: C.slate600, marginBottom: 6 }}>
          Estimated natural drying time for a {pour.actualDepthMm}mm screed is
          approximately {guidance.naturalDryingDays} days in good conditions
          {guidance.estimatedDryDate
            ? ` — on or around ${formatDate(guidance.estimatedDryDate)}`
            : ""}
          . Always confirm with a moisture test before laying finishes.
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 0 }}>
          <KeyDate label="Light foot traffic" value="After 24–48 hours" />
          <KeyDate
            label="Light loading / trades"
            value={`After ${guidance.lightLoadingDays} days`}
          />
          <KeyDate
            label="Tiling & stone"
            value={`From ${guidance.tilingFromDays} days*`}
          />
          <KeyDate
            label="Timber, vinyl & carpet"
            value={`From ~${guidance.sensitiveFlooringDays} days*`}
          />
        </View>
        <Text style={{ fontSize: 7.5, color: C.slate400, marginTop: 4 }}>
          * Subject to a passing moisture test (≤75% RH, or ≤0.5% by
          calcium-carbide method for timber).
        </Text>

        {/* UFH */}
        <SectionHeading>Underfloor heating commissioning</SectionHeading>
        <Text style={{ color: C.slate600, marginBottom: 6 }}>
          Underfloor heating must remain off for the first{" "}
          {guidance.ufhCommissionFromDays} days. Commission as follows:
        </Text>
        {guidance.ufhRamp.map((step) => (
          <View
            key={step.label}
            style={{ flexDirection: "row", marginBottom: 3 }}
          >
            <View
              style={{
                width: 92,
                backgroundColor: C.slate100,
                borderRadius: 3,
                paddingVertical: 2,
                paddingHorizontal: 5,
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold" }}>
                {step.label}
              </Text>
            </View>
            <Text style={{ flexGrow: 1, flexBasis: 0, color: C.slate600 }}>
              {step.detail}
            </Text>
          </View>
        ))}

        {/* Protection notes */}
        <SectionHeading>Protection on site</SectionHeading>
        {guidance.protectionNotes.map((n) => (
          <Bullet key={n}>{n}</Bullet>
        ))}

        {/* Warranty */}
        <SectionHeading>Warranty</SectionHeading>
        {guidance.warranty.map((w) => (
          <Bullet key={w}>{w}</Bullet>
        ))}

        {/* Sign-off */}
        <View
          style={{
            flexDirection: "row",
            gap: 14,
            marginTop: 16,
            borderTopWidth: 1,
            borderTopColor: C.slate200,
            paddingTop: 10,
          }}
        >
          <View style={{ flexGrow: 1, flexBasis: 0 }}>
            <Text style={styles.panelLabel}>Accepted on site by</Text>
            {isRaster(pour.customerSignatureDataUrl) ? (
              <Image
                src={pour.customerSignatureDataUrl!}
                style={{ height: 44, width: 150, objectFit: "contain" }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Helvetica-Oblique",
                  color: C.slate800,
                  marginTop: 6,
                }}
              >
                {pour.customerSignatureName ?? "—"}
              </Text>
            )}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: C.slate400,
                marginTop: 4,
                width: 170,
                paddingTop: 2,
              }}
            >
              <Text style={{ fontSize: 8, color: C.slate600 }}>
                {pour.customerSignatureName ?? "—"}
              </Text>
              <Text style={{ fontSize: 7.5, color: C.slate400 }}>
                {pour.signedAt
                  ? `Signed ${formatDate(pour.signedAt)}`
                  : ""}
              </Text>
            </View>
          </View>
          <View style={{ flexGrow: 1, flexBasis: 0 }}>
            <Text style={styles.panelLabel}>Installed by</Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Helvetica-Bold",
                color: C.slate800,
                marginTop: 6,
              }}
            >
              Clockwork Screed Ltd
            </Text>
            <Text style={{ fontSize: 8, color: C.slate500 }}>
              {job.crew?.name ?? "Clockwork Screed crew"}
            </Text>
          </View>
        </View>

        <PageFooter note={`Aftercare Certificate · ${job.jobNumber}`} />
      </Page>
    </Document>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: C.slate800,
        marginTop: 16,
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: C.amber,
        paddingBottom: 3,
      }}
    >
      {children}
    </Text>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        width: "33.33%",
        padding: 8,
      }}
    >
      <Text style={styles.panelLabel}>{label}</Text>
      <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold" }}>
        {value}
      </Text>
    </View>
  );
}

function KeyDate({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        width: "50%",
        paddingVertical: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingRight: 14,
      }}
    >
      <Text style={{ color: C.slate600 }}>{label}</Text>
      <Text style={{ fontFamily: "Helvetica-Bold" }}>{value}</Text>
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 2.5 }}>
      <Text style={{ color: C.amber, marginRight: 4 }}>•</Text>
      <Text style={{ flexGrow: 1, flexBasis: 0, color: C.slate600 }}>
        {children}
      </Text>
    </View>
  );
}
