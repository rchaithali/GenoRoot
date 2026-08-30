import type {
  DiagnosedCondition,
  Duration,
  FamilyHistory,
  HairLossPattern,
  HairWashFrequency,
  MenstrualCycle,
  PastSixMonths,
  PregnancyRelated,
  ProcedureName,
  ProcedureSessions,
  ProductDuration,
  ProductName,
  SampleType,
  SmokingSeverity,
} from "../types/intake";

export const durationOptions: Duration[] = [
  "Less than 6 months",
  "6-12 months",
  "Over a year",
];

export const familyHistoryOptions: FamilyHistory[] = [
  "Father had hair loss",
  "Mother had hair loss",
  "Siblings with thinning or baldness",
  "No known family history",
];

export const hairLossPatternOptions: HairLossPattern[] = [
  "Receding hairline",
  "Thinning at crown",
  "Widening part line",
  "Diffuse thinning",
  "Patchy loss",
  "Sudden excessive shedding",
];

export const diagnosedConditionOptions: DiagnosedCondition[] = [
  "PCOS/PCOD",
  "Thyroid disorder",
  "Diabetes",
  "Autoimmune disease",
  "Anemia",
  "None",
];

export const menstrualCycleOptions: MenstrualCycle[] = [
  "Regular",
  "Irregular",
  "Menopausal",
  "Not applicable",
];

export const pregnancyRelatedOptions: PregnancyRelated[] = [
  "Currently pregnant",
  "Postpartum <1 year",
  "Not applicable",
];

export const pastSixMonthsOptions: PastSixMonths[] = [
  "Crash dieting or major weight loss",
  "High stress or emotional trauma",
  "Fever with illness (COVID, Dengue, Typhoid)",
  "Recent surgery",
  "Change in location/water/air quality",
];

export const smokingSeverityOptions: SmokingSeverity[] = [
  "Mild <5/day",
  "Moderate 5-10/day",
  "Severe >10/day",
];

export const hairWashFrequencyOptions: HairWashFrequency[] = [
  "Daily",
  "Alternate Days",
  "Weekly",
];

export const productNames: ProductName[] = [
  "OTC/Medicated Shampoos",
  "Hair Oils/Serums",
  "Topical Minoxidil",
  "Oral Minoxidil",
  "Supplements",
];

export const productDurationOptions: ProductDuration[] = [
  "<3mo",
  "3-6mo",
  ">6mo",
];

export const procedureNames: ProcedureName[] = [
  "PRP/GFC/iPRF",
  "Stem Cells/Exosomes",
  "Hair Transplant",
  "Other",
];

export const procedureSessionOptions: ProcedureSessions[] = [
  "1-3",
  "4-6",
  ">6",
];

export const sampleTypeOptions: SampleType[] = [
  "Saliva",
  "Blood",
  "Either",
];