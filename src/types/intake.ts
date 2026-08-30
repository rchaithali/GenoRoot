export type Sex = "Male" | "Female";

export type Duration =
  | "Less than 6 months"
  | "6-12 months"
  | "Over a year";

export type FamilyHistory =
  | "Father had hair loss"
  | "Mother had hair loss"
  | "Siblings with thinning or baldness"
  | "No known family history";

export type HairLossPattern =
  | "Receding hairline"
  | "Thinning at crown"
  | "Widening part line"
  | "Diffuse thinning"
  | "Patchy loss"
  | "Sudden excessive shedding";

export type DiagnosedCondition =
  | "PCOS/PCOD"
  | "Thyroid disorder"
  | "Diabetes"
  | "Autoimmune disease"
  | "Anemia"
  | "None";

export type MenstrualCycle =
  | "Regular"
  | "Irregular"
  | "Menopausal"
  | "Not applicable";

export type PregnancyRelated =
  | "Currently pregnant"
  | "Postpartum <1 year"
  | "Not applicable";

export type YesNo = "Yes" | "No";

export type PastSixMonths =
  | "Crash dieting or major weight loss"
  | "High stress or emotional trauma"
  | "Fever with illness (COVID, Dengue, Typhoid)"
  | "Recent surgery"
  | "Change in location/water/air quality";

export type SmokingSeverity =
  | "Mild <5/day"
  | "Moderate 5-10/day"
  | "Severe >10/day";

export type HairWashFrequency =
  | "Daily"
  | "Alternate Days"
  | "Weekly";

export interface Habits {
  smoking: YesNo | null;
  smoking_severity: SmokingSeverity | null;
  alcohol: YesNo | null;
  hard_water: YesNo | null;
  hair_wash_frequency: HairWashFrequency | null;
  heating_tools_styling_chemicals: YesNo | null;
  salon_treatments: YesNo | null;
  salon_treatment_detail: string;
}

export type ProductName =
  | "OTC/Medicated Shampoos"
  | "Hair Oils/Serums"
  | "Topical Minoxidil"
  | "Oral Minoxidil"
  | "Supplements";

export type ProductDuration = "<3mo" | "3-6mo" | ">6mo";

export interface ProductResponse {
  used: boolean;
  duration: ProductDuration | null;
  helped: YesNo | null;
  side_effects: YesNo | null;
}

export type ProcedureName =
  | "PRP/GFC/iPRF"
  | "Stem Cells/Exosomes"
  | "Hair Transplant"
  | "Other";

export type ProcedureSessions = "1-3" | "4-6" | ">6";

export interface ProcedureResponse {
  done: boolean;
  sessions: ProcedureSessions | null;
  helped: YesNo | null;
}

export type SampleType = "Saliva" | "Blood" | "Either";

export interface IntakeState {
  // Additional patient context used by the UI
  currentAge: number | null;
  sex: Sex | null;

  // A · Personal & Family Hair Loss History
  age_hair_loss_began: number | null;
  duration: Duration | null;
  family_history: FamilyHistory[];
  pattern: HairLossPattern[];

  // B · Hormonal & Health Influences
  diagnosed_conditions: DiagnosedCondition[];
  menstrual_cycle: MenstrualCycle | null;
  pregnancy_related: PregnancyRelated | null;
  adult_acne_oily_skin: YesNo | null;
  excess_body_facial_hair: YesNo | null;

  // C · Lifestyle & Environmental Triggers
  past_6_months: PastSixMonths[];
  habits: Habits;

  // D · Current Hair Care & Treatments
  products: Record<ProductName, ProductResponse>;
  procedures: Record<ProcedureName, ProcedureResponse>;
  past_treatment_side_effects: YesNo | null;
  describe: string;

  // E · Sample Collection & Consent
  sample_type: SampleType | null;
  consent: YesNo | null;
}