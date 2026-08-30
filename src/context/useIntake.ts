import {
  createContext,
  useContext,
} from "react";

import type {
  Habits,
  IntakeState,
  ProcedureName,
  ProcedureResponse,
  ProductName,
  ProductResponse,
} from "../types/intake";

export interface IntakeContextValue {
  intake: IntakeState;

  updateField: <K extends keyof IntakeState>(
    field: K,
    value: IntakeState[K]
  ) => void;

  updateHabit: <K extends keyof Habits>(
    field: K,
    value: Habits[K]
  ) => void;

  updateProduct: (
    product: ProductName,
    updates: Partial<ProductResponse>
  ) => void;

  updateProcedure: (
    procedure: ProcedureName,
    updates: Partial<ProcedureResponse>
  ) => void;

  resetIntake: () => void;
}

export const IntakeContext =
  createContext<IntakeContextValue | null>(null);

export function useIntake() {
  const context = useContext(IntakeContext);

  if (!context) {
    throw new Error(
      "useIntake must be used inside IntakeProvider."
    );
  }

  return context;
}