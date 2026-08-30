import { useState } from "react";

import {
  getNextStep,
  getPreviousStep,
  getProgressPercent,
  type IntakeStepId,
} from "../data/intakeSteps";

export function useIntakeNavigation() {
  const [currentStep, setCurrentStep] =
    useState<IntakeStepId>("context");

  const progressPercent =
    getProgressPercent(currentStep);

  function goNext() {
    const nextStep = getNextStep(currentStep);

    if (nextStep) {
      setCurrentStep(nextStep);
    }
  }

  function goBack() {
    const previousStep =
      getPreviousStep(currentStep);

    if (previousStep) {
      setCurrentStep(previousStep);
    }
  }

  function goToStep(step: IntakeStepId) {
    setCurrentStep(step);
  }

  return {
    currentStep,
    progressPercent,
    goNext,
    goBack,
    goToStep,
  };
}