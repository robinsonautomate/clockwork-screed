/**
 * Drying & aftercare guidance for liquid screed.
 *
 * Rule of thumb used across the trade for calcium-sulfate / Cemfloor-type
 * liquid screeds: roughly 1mm per day for the first 40mm, then ~2mm per day
 * for the depth beyond 40mm, in good drying conditions.
 */

export type UfhStep = { label: string; detail: string };

export type AftercareGuidance = {
  depthMm: number;
  screedType: string;
  naturalDryingDays: number;
  estimatedDryDate: Date | null;
  footTrafficHours: number;
  lightLoadingDays: number;
  ufhCommissionFromDays: number;
  ufhRamp: UfhStep[];
  tilingFromDays: number;
  sensitiveFlooringDays: number;
  protectionNotes: string[];
  warranty: string[];
};

export function naturalDryingDays(depthMm: number): number {
  const base = Math.min(depthMm, 40);
  const extra = Math.max(depthMm - 40, 0);
  return Math.round(base * 1 + extra * 2);
}

export function getAftercareGuidance(opts: {
  depthMm: number;
  screedType: string;
  pourDate?: Date | string | null;
}): AftercareGuidance {
  const { depthMm, screedType } = opts;
  const dryDays = naturalDryingDays(depthMm);

  let estimatedDryDate: Date | null = null;
  if (opts.pourDate) {
    const d = new Date(opts.pourDate);
    if (!Number.isNaN(d.getTime())) {
      d.setDate(d.getDate() + dryDays);
      estimatedDryDate = d;
    }
  }

  const ufhRamp: UfhStep[] = [
    {
      label: "Days 1–7 — cure",
      detail:
        "Keep underfloor heating switched off. Allow the screed to cure undisturbed and protect from rapid drying, draughts and direct heat.",
    },
    {
      label: "Day 8 — first heat",
      detail:
        "Commission UFH at a flow temperature of 20–25°C. Keep at this temperature for 3 days.",
    },
    {
      label: "Ramp up",
      detail:
        "Increase the flow temperature by no more than 5°C per day until the design temperature is reached.",
    },
    {
      label: "Hold",
      detail:
        "Hold at maximum design temperature for at least 72 hours, then return to normal operating temperature.",
    },
    {
      label: "Before floor finishes",
      detail:
        "Reduce the flow temperature to 15–20°C at least 48 hours before laying finishes, then ramp back up gradually afterwards.",
    },
  ];

  return {
    depthMm,
    screedType,
    naturalDryingDays: dryDays,
    estimatedDryDate,
    footTrafficHours: 24,
    lightLoadingDays: 7,
    ufhCommissionFromDays: 7,
    ufhRamp,
    tilingFromDays: 21,
    sensitiveFlooringDays: dryDays,
    protectionNotes: [
      "Light foot traffic permitted after 24–48 hours; avoid loading or trades on the floor for 5–7 days.",
      "Protect the surface from site traffic, plaster, paint and standing water until floor finishes are laid.",
      "Ventilate the building gently — avoid both stagnant humidity and forced drying for the first 7 days.",
      "Confirm residual moisture with a calcium-carbide (CM) or hygrometer test before laying impervious or moisture-sensitive finishes.",
    ],
    warranty: [
      "Screed laid and finished to SR2 surface regularity tolerance.",
      "12-month workmanship guarantee from the date of pour, covering installation defects.",
      "Guarantee is conditional on the drying, heating and protection guidance above being followed.",
      "Cracking from building movement, sub-base failure or premature loading is excluded.",
    ],
  };
}
