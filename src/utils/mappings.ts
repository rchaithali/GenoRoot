import type {
  HairWashFrequency,
  PregnancyRelated,
  ProductDuration,
  ProcedureSessions,
  SampleType,
  SmokingSeverity,
  YesNo,
} from "../types/intake";

/**
 * Guided voice maps only when the answer can be interpreted
 * confidently enough for the required schema.
 *
 * Ambiguous input returns null so the UI can clarify or
 * switch to manual input instead of guessing.
 */

/* -------------------------------------------------------------------------- */
/* Q7 · Pregnancy-related status                                               */
/* -------------------------------------------------------------------------- */

export function mapPregnancyLabel(
  label:
    | "I'm currently pregnant"
    | "I gave birth within the past year"
    | "Neither of these applies to me"
): PregnancyRelated {
  switch (label) {
    case "I'm currently pregnant":
      return "Currently pregnant";

    case "I gave birth within the past year":
      return "Postpartum <1 year";

    case "Neither of these applies to me":
      return "Not applicable";
  }
}

/* -------------------------------------------------------------------------- */
/* Shared Yes / No voice mapping                                               */
/* -------------------------------------------------------------------------- */

/**
 * Used only when the question has a hard Yes/No output.
 * Clear natural variants are accepted; ambiguous responses return null.
 */
export function parseYesNo(input: string): YesNo | null {
  const normalized = normalizeSpeech(input);

  const noPatterns = [
    /^no$/,
    /^no thanks$/,
    /^nope$/,
    /^nah$/,
    /^no i don't$/,
    /^no i do not$/,
    /^i don't$/,
    /^i do not$/,
    /^i haven't$/,
    /^i have not$/,
    /^i'm not$/,
    /^i am not$/,
  ];

  if (noPatterns.some((pattern) => pattern.test(normalized))) {
    return "No";
  }

  const yesPatterns = [
    /^yes$/,
    /^yes i do$/,
    /^yes i have$/,
    /^yeah$/,
    /^yeah i do$/,
    /^yep$/,
    /^yup$/,
    /^i do$/,
    /^i have$/,
  ];

  if (yesPatterns.some((pattern) => pattern.test(normalized))) {
    return "Yes";
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Q11 · Smoking                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Approximate cigarettes/day → Haiku's required severity bucket.
 */
export function mapCigarettesPerDay(
  cigarettesPerDay: number
): SmokingSeverity | null {
  if (!Number.isFinite(cigarettesPerDay) || cigarettesPerDay < 0) {
    return null;
  }

  if (cigarettesPerDay < 5) {
    return "Mild <5/day";
  }

  if (cigarettesPerDay <= 10) {
    return "Moderate 5-10/day";
  }

  return "Severe >10/day";
}

/**
 * Examples:
 * "around seven" → Moderate 5-10/day
 * "about 3 cigarettes" → Mild <5/day
 * "12 a day" → Severe >10/day
 */
export function parseCigarettesPerDay(
  input: string
): SmokingSeverity | null {
  const count = extractSingleNumber(input);

  if (count === null) {
    return null;
  }

  return mapCigarettesPerDay(count);
}

/* -------------------------------------------------------------------------- */
/* Q11 · Hair-wash frequency                                                   */
/* -------------------------------------------------------------------------- */

// Patient-facing label → required schema value.
export function mapHairWashLabel(
  label: "Daily" | "Every other day" | "About once a week"
): HairWashFrequency {
  switch (label) {
    case "Daily":
      return "Daily";

    case "Every other day":
      return "Alternate Days";

    case "About once a week":
      return "Weekly";
  }
}

/**
 * Natural bounded responses → required category.
 */
export function parseHairWashFrequency(
  input: string
): HairWashFrequency | null {
  const normalized = normalizeSpeech(input);

  if (
    includesAny(normalized, [
      "every other day",
      "alternate day",
      "alternate days",
      "every second day",
    ])
  ) {
    return "Alternate Days";
  }

  if (
    includesAny(normalized, [
      "once a week",
      "about once a week",
      "weekly",
      "one time a week",
    ])
  ) {
    return "Weekly";
  }

  if (
    includesAny(normalized, [
      "every day",
      "everyday",
      "daily",
    ])
  ) {
    return "Daily";
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Q12 · Product duration                                                      */
/* -------------------------------------------------------------------------- */

// Manual patient-facing label → required schema value.
export function mapProductDurationLabel(
  label: "Under 3 months" | "3–6 months" | "Over 6 months"
): ProductDuration {
  switch (label) {
    case "Under 3 months":
      return "<3mo";

    case "3–6 months":
      return "3-6mo";

    case "Over 6 months":
      return ">6mo";
  }
}

/**
 * Numeric months → required product-duration bucket.
 */
export function mapProductDurationFromMonths(
  months: number
): ProductDuration | null {
  if (!Number.isFinite(months) || months < 0) {
    return null;
  }

  if (months < 3) {
    return "<3mo";
  }

  if (months <= 6) {
    return "3-6mo";
  }

  return ">6mo";
}

/**
 * Natural bounded duration examples:
 *
 * "about 2 months" → <3mo
 * "4 months" → 3-6mo
 * "around 6 months" → 3-6mo
 * "8 months" → >6mo
 * "one year" → >6mo
 * "about 2 years" → >6mo
 *
 * Complex date histories such as "since January, but I stopped for
 * two months" return null unless they can be interpreted safely.
 */
export function parseProductDuration(
  input: string
): ProductDuration | null {
  const normalized = normalizeSpeech(input);

  const amount = extractSingleNumber(normalized);

  if (amount === null) {
    return null;
  }

  if (containsYearUnit(normalized)) {
    return ">6mo";
  }

  if (containsMonthUnit(normalized)) {
    return mapProductDurationFromMonths(amount);
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* Q13 · Procedure sessions                                                    */
/* -------------------------------------------------------------------------- */

// Manual patient-facing label → required schema value.
export function mapProcedureSessionsLabel(
  label: "1–3" | "4–6" | "More than 6"
): ProcedureSessions {
  switch (label) {
    case "1–3":
      return "1-3";

    case "4–6":
      return "4-6";

    case "More than 6":
      return ">6";
  }
}

/**
 * Numeric session count → required schema bucket.
 */
export function mapProcedureSessionCount(
  sessions: number
): ProcedureSessions | null {
  if (!Number.isInteger(sessions) || sessions < 1) {
    return null;
  }

  if (sessions <= 3) {
    return "1-3";
  }

  if (sessions <= 6) {
    return "4-6";
  }

  return ">6";
}

/**
 * Examples:
 *
 * "2" → 1-3
 * "I've had five sessions" → 4-6
 * "around 8 sessions" → >6
 */
export function parseProcedureSessions(
  input: string
): ProcedureSessions | null {
  const count = extractSingleNumber(input);

  if (count === null) {
    return null;
  }

  return mapProcedureSessionCount(count);
}

/* -------------------------------------------------------------------------- */
/* Q15 · Sample type                                                           */
/* -------------------------------------------------------------------------- */

// Patient-facing label → required schema value.
export function mapSampleTypeLabel(
  label: "Saliva" | "Blood" | "Either is fine"
): SampleType {
  switch (label) {
    case "Saliva":
      return "Saliva";

    case "Blood":
      return "Blood";

    case "Either is fine":
      return "Either";
  }
}

/* -------------------------------------------------------------------------- */
/* Shared speech helpers                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Extracts one clear number from a short guided response.
 *
 * If multiple different numeric values are present, returns null
 * because the meaning may be ambiguous.
 */
function extractSingleNumber(input: string): number | null {
  const normalized = normalizeSpeech(input);

  const digitMatches = normalized.match(/\b\d+(?:\.\d+)?\b/g);

  if (digitMatches) {
    if (digitMatches.length !== 1) {
      return null;
    }

    const value = Number(digitMatches[0]);

    return Number.isFinite(value) ? value : null;
  }

  const wordNumber = extractWordNumber(normalized);

  return wordNumber;
}

/**
 * Supports the small number range needed by the current guided flows.
 */
function extractWordNumber(input: string): number | null {
  const wordNumbers: Record<string, number> = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
  };

  const matches = Object.entries(wordNumbers).filter(([word]) =>
    new RegExp(`\\b${word}\\b`).test(input)
  );

  if (matches.length !== 1) {
    return null;
  }

  return matches[0][1];
}

function containsMonthUnit(input: string): boolean {
  return /\bmonth\b|\bmonths\b/.test(input);
}

function containsYearUnit(input: string): boolean {
  return /\byear\b|\byears\b/.test(input);
}

function normalizeSpeech(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
}

function includesAny(input: string, values: string[]): boolean {
  return values.some((value) => input.includes(value));
}