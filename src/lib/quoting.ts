import { toNumber } from "@/lib/format";

export const VAT_RATE = 0.2;

export type QuoteLineUnit = "m²" | "m³" | "day" | "item";

export type DraftLine = {
  description: string;
  qty: number;
  unit: QuoteLineUnit;
  unitPrice: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Sensible default quote line items derived from the enquiry — screed
 * supply, edge insulation, DPM, mobilisation, plus survey / UFH / phased
 * extras where the job size or screed type calls for them.
 */
export function buildDefaultQuoteLines(opts: {
  screedType: string;
  pricePerM2: number;
  areaM2: number;
  depthMm: number;
  projectType: string;
}): DraftLine[] {
  const { screedType, pricePerM2, areaM2, depthMm, projectType } = opts;
  const area = round2(areaM2);

  const lines: DraftLine[] = [
    {
      description: `${screedType} — supplied & pumped, ${depthMm}mm`,
      qty: area,
      unit: "m²",
      unitPrice: pricePerM2,
    },
    {
      description: "Perimeter edge insulation strip",
      qty: area,
      unit: "m²",
      unitPrice: 0.75,
    },
    {
      description: "Polythene damp-proof / separating membrane",
      qty: area,
      unit: "m²",
      unitPrice: 1.2,
    },
    {
      description: "Site mobilisation & line pump set-up",
      qty: 1,
      unit: "item",
      unitPrice: areaM2 < 150 ? 295 : areaM2 < 500 ? 385 : 495,
    },
  ];

  if (areaM2 > 400 || projectType === "commercial") {
    lines.push({
      description: "Floor profile survey & moisture readings",
      qty: 1,
      unit: "item",
      unitPrice: 185,
    });
  }
  if (/therm/i.test(screedType)) {
    lines.push({
      description: "UFH pressure-test witness & sign-off",
      qty: 1,
      unit: "item",
      unitPrice: 120,
    });
  }
  if (areaM2 > 700) {
    lines.push({
      description: "Phased pour — additional crew day",
      qty: 1,
      unit: "day",
      unitPrice: 540,
    });
  }
  return lines;
}

export function lineTotal(
  qty: number | string,
  unitPrice: number | string,
): number {
  return round2(toNumber(qty) * toNumber(unitPrice));
}

export function calcTotals(
  lines: { qty: number | string; unitPrice: number | string }[],
): { subtotal: number; vat: number; total: number } {
  const subtotal = round2(
    lines.reduce((a, l) => a + toNumber(l.qty) * toNumber(l.unitPrice), 0),
  );
  const vat = round2(subtotal * VAT_RATE);
  return { subtotal, vat, total: round2(subtotal + vat) };
}
