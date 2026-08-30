export type IntakeStepId =
  | "context"
  | "section-a"
  | "section-b"
  | "section-c"
  | "section-d"
  | "section-e"
  | "review"
  | "result";

export interface IntakeStep {
  id: IntakeStepId;
  label: string;
  section?: string;
}

export const intakeSteps: IntakeStep[] = [
  {
    id: "context",
    label: "Patient Context",
  },
  {
    id: "section-a",
    label: "Personal & Family History",
    section: "A",
  },
  {
    id: "section-b",
    label: "Hormonal & Health Influences",
    section: "B",
  },
  {
    id: "section-c",
    label: "Lifestyle & Environmental Triggers",
    section: "C",
  },
  {
    id: "section-d",
    label: "Current Hair Care & Treatments",
    section: "D",
  },
  {
    id: "section-e",
    label: "Sample Collection & Consent",
    section: "E",
  },
  {
    id: "review",
    label: "Review",
  },
  {
    id: "result",
    label: "Structured Result",
  },
];

export function getStepIndex(stepId: IntakeStepId): number {
  return intakeSteps.findIndex((step) => step.id === stepId);
}

export function getProgressPercent(stepId: IntakeStepId): number {
  const index = getStepIndex(stepId);

  if (index < 0) {
    return 0;
  }

  /**
   * Result is the completed state, so progress reaches 100%.
   */
  return Math.round(((index + 1) / intakeSteps.length) * 100);
}

export function getPreviousStep(
  stepId: IntakeStepId
): IntakeStepId | null {
  const index = getStepIndex(stepId);

  if (index <= 0) {
    return null;
  }

  return intakeSteps[index - 1].id;
}

export function getNextStep(
  stepId: IntakeStepId
): IntakeStepId | null {
  const index = getStepIndex(stepId);

  if (
    index < 0 ||
    index >= intakeSteps.length - 1
  ) {
    return null;
  }

  return intakeSteps[index + 1].id;
}