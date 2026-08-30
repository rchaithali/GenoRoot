import type {
  DiagnosedCondition,
  Duration,
  FamilyHistory,
  HairLossPattern,
  HairWashFrequency,
  IntakeState,
  MenstrualCycle,
  PastSixMonths,
  PregnancyRelated,
  ProcedureName,
  ProcedureSessions,
  ProductDuration,
  ProductName,
  SampleType,
  SmokingSeverity,
  YesNo,
} from "../types/intake";

/**
 * Final machine-readable intake.
 *
 * UI-only context such as currentAge and sex is intentionally excluded.
 * This object represents Haiku's required 16-question output.
 */
export interface GenoRootIntakeOutput {
  // A · Personal & Family Hair Loss History
  age_hair_loss_began: number;
  duration: Duration;
  family_history: FamilyHistory[];
  pattern: HairLossPattern[];

  // B · Hormonal & Health Influences
  diagnosed_conditions: DiagnosedCondition[];
  menstrual_cycle: MenstrualCycle;
  pregnancy_related: PregnancyRelated;
  adult_acne_oily_skin: YesNo;
  excess_body_facial_hair: YesNo;

  // C · Lifestyle & Environmental Triggers
  past_6_months: PastSixMonths[];

  habits: {
    smoking: YesNo;
    smoking_severity: SmokingSeverity | null;
    alcohol: YesNo;
    hard_water: YesNo;
    hair_wash_frequency: HairWashFrequency;
    heating_tools_styling_chemicals: YesNo;
    salon_treatments: YesNo;
    salon_treatment_detail: string | null;
  };

  // D · Current Hair Care & Treatments
  products: Record<
    ProductName,
    {
      used: boolean;
      duration: ProductDuration | null;
      helped: YesNo | null;
      side_effects: YesNo | null;
    }
  >;

  procedures: Record<
    ProcedureName,
    {
      done: boolean;
      sessions: ProcedureSessions | null;
      helped: YesNo | null;
    }
  >;

  past_treatment_side_effects: YesNo;
  describe: string | null;

  // E · Sample Collection & Consent
  sample_type: SampleType;
  consent: YesNo;
}

/**
 * Builds the final structured output only after validation succeeds.
 *
 * Conditional follow-up values become null when they do not apply.
 * We keep all Q12/Q13 rows so their table structure remains complete.
 */
export function buildIntakeOutput(
  intake: IntakeState
): GenoRootIntakeOutput {
  assertReadyForOutput(intake);

  return {
    // A
    age_hair_loss_began: intake.age_hair_loss_began,
    duration: intake.duration,
    family_history: [...intake.family_history],
    pattern: [...intake.pattern],

    // B
    diagnosed_conditions: [...intake.diagnosed_conditions],
    menstrual_cycle: intake.menstrual_cycle,
    pregnancy_related: intake.pregnancy_related,
    adult_acne_oily_skin: intake.adult_acne_oily_skin,
    excess_body_facial_hair: intake.excess_body_facial_hair,

    // C
    past_6_months: [...intake.past_6_months],

    habits: {
      smoking: intake.habits.smoking,

      // Smoking severity only applies when smoking = Yes.
      smoking_severity:
        intake.habits.smoking === "Yes"
          ? intake.habits.smoking_severity
          : null,

      alcohol: intake.habits.alcohol,
      hard_water: intake.habits.hard_water,
      hair_wash_frequency: intake.habits.hair_wash_frequency,
      heating_tools_styling_chemicals:
        intake.habits.heating_tools_styling_chemicals,
      salon_treatments: intake.habits.salon_treatments,

      // Treatment detail only applies when salon treatment = Yes.
      salon_treatment_detail:
        intake.habits.salon_treatments === "Yes"
          ? intake.habits.salon_treatment_detail.trim()
          : null,
    },

    // D
    products: buildProductOutput(intake),

    procedures: buildProcedureOutput(intake),

    past_treatment_side_effects:
      intake.past_treatment_side_effects,

    // Q14 description only exists when the parent answer is Yes.
    describe:
      intake.past_treatment_side_effects === "Yes"
        ? intake.describe.trim()
        : null,

    // E
    sample_type: intake.sample_type,
    consent: intake.consent,
  };
}

function buildProductOutput(
  intake: IntakeState
): GenoRootIntakeOutput["products"] {
  const output = {} as GenoRootIntakeOutput["products"];

  for (const [name, response] of Object.entries(intake.products) as [
    ProductName,
    IntakeState["products"][ProductName],
  ][]) {
    output[name] = response.used
      ? {
          used: true,
          duration: response.duration,
          helped: response.helped,
          side_effects: response.side_effects,
        }
      : {
          // Every product row remains present in the final Q12 table.
          used: false,
          duration: null,
          helped: null,
          side_effects: null,
        };
  }

  return output;
}

function buildProcedureOutput(
  intake: IntakeState
): GenoRootIntakeOutput["procedures"] {
  const output = {} as GenoRootIntakeOutput["procedures"];

  for (const [name, response] of Object.entries(
    intake.procedures
  ) as [
    ProcedureName,
    IntakeState["procedures"][ProcedureName],
  ][]) {
    output[name] = response.done
      ? {
          done: true,
          sessions: response.sessions,
          helped: response.helped,
        }
      : {
          // Every procedure row remains present in the final Q13 table.
          done: false,
          sessions: null,
          helped: null,
        };
  }

  return output;
}

/**
 * buildIntakeOutput should never receive incomplete state.
 *
 * Validation provides patient-facing errors earlier; this guard protects
 * the final-output boundary from accidentally emitting partial data.
 */
function assertReadyForOutput(
  intake: IntakeState
): asserts intake is IntakeState & {
  age_hair_loss_began: number;
  duration: Duration;
  menstrual_cycle: MenstrualCycle;
  pregnancy_related: PregnancyRelated;
  adult_acne_oily_skin: YesNo;
  excess_body_facial_hair: YesNo;
  past_treatment_side_effects: YesNo;
  sample_type: SampleType;
  consent: YesNo;
  habits: IntakeState["habits"] & {
    smoking: YesNo;
    alcohol: YesNo;
    hard_water: YesNo;
    hair_wash_frequency: HairWashFrequency;
    heating_tools_styling_chemicals: YesNo;
    salon_treatments: YesNo;
  };
} {
  if (
    intake.age_hair_loss_began === null ||
    intake.duration === null ||
    intake.menstrual_cycle === null ||
    intake.pregnancy_related === null ||
    intake.adult_acne_oily_skin === null ||
    intake.excess_body_facial_hair === null ||
    intake.past_treatment_side_effects === null ||
    intake.sample_type === null ||
    intake.consent === null ||
    intake.habits.smoking === null ||
    intake.habits.alcohol === null ||
    intake.habits.hard_water === null ||
    intake.habits.hair_wash_frequency === null ||
    intake.habits.heating_tools_styling_chemicals === null ||
    intake.habits.salon_treatments === null
  ) {
    throw new Error(
      "Cannot build final intake output from incomplete state."
    );
  }
}