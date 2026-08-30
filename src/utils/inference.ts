import type {
  Duration,
  MenstrualCycle,
  PregnancyRelated,
  Sex,
} from "../types/intake";

/**
 * Q2 · Duration assistance
 *
 * Current age and onset age can sometimes reduce the patient's work,
 * but whole-year ages cannot always determine an exact duration.
 *
 * We therefore return:
 * - an exact suggestion only when the age difference clearly supports it
 * - narrowed options when the answer is still ambiguous
 * - no suggestion when the supplied ages are invalid
 */
export interface DurationInference {
  suggested: Duration | null;
  possibleOptions: Duration[];
  requiresConfirmation: boolean;
}

export function inferDurationFromAges(
  currentAge: number | null,
  onsetAge: number | null
): DurationInference {
  const allOptions: Duration[] = [
    "Less than 6 months",
    "6-12 months",
    "Over a year",
  ];

  if (
    currentAge === null ||
    onsetAge === null ||
    !Number.isFinite(currentAge) ||
    !Number.isFinite(onsetAge) ||
    currentAge < 0 ||
    onsetAge < 0 ||
    onsetAge > currentAge
  ) {
    return {
      suggested: null,
      possibleOptions: allOptions,
      requiresConfirmation: true,
    };
  }

  const ageDifference = currentAge - onsetAge;

  /**
   * Same whole-number age does not tell us whether onset was
   * 2 months ago or 10 months ago.
   */
  if (ageDifference === 0) {
    return {
      suggested: null,
      possibleOptions: [
        "Less than 6 months",
        "6-12 months",
      ],
      requiresConfirmation: true,
    };
  }

  /**
   * A one-year difference is still ambiguous because birthdays
   * can make the actual elapsed duration either side of one year.
   */
  if (ageDifference === 1) {
    return {
      suggested: null,
      possibleOptions: [
        "6-12 months",
        "Over a year",
      ],
      requiresConfirmation: true,
    };
  }

  /**
   * A difference of two or more whole years clearly satisfies
   * Haiku's "Over a year" category.
   */
  return {
    suggested: "Over a year",
    possibleOptions: ["Over a year"],
    requiresConfirmation: true,
  };
}

/**
 * Q6 · Menstrual cycle
 *
 * Q6 is femaleOnly in the supplied schema.
 * Male patients skip the UI, but the final output still requires a value.
 */
export function inferMenstrualCycleForSex(
  sex: Sex | null
): MenstrualCycle | null {
  if (sex === "Male") {
    return "Not applicable";
  }

  return null;
}

/**
 * Q7 · Pregnancy-related status
 *
 * Q7 is also femaleOnly.
 * Male patients skip the question and output "Not applicable".
 */
export function inferPregnancyRelatedForSex(
  sex: Sex | null
): PregnancyRelated | null {
  if (sex === "Male") {
    return "Not applicable";
  }

  return null;
}

/**
 * Used by navigation to determine whether femaleOnly questions
 * should be shown to the patient.
 */
export function shouldShowFemaleOnlyQuestions(
  sex: Sex | null
): boolean {
  return sex === "Female";
}