import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { initialIntakeState } from "../data/initialIntakeState";
import type {
  Habits,
  IntakeState,
  ProcedureName,
  ProcedureResponse,
  ProductName,
  ProductResponse,
} from "../types/intake";
import {
  IntakeContext,
  type IntakeContextValue,
} from "./useIntake";

interface IntakeProviderProps {
  children: ReactNode;
}

export function IntakeProvider({ children }: IntakeProviderProps) {
  const [intake, setIntake] =
    useState<IntakeState>(initialIntakeState);

  function updateField<K extends keyof IntakeState>(
    field: K,
    value: IntakeState[K]
  ) {
    setIntake((current) => {
      const nextState: IntakeState = {
        ...current,
        [field]: value,
      };

      // Q6/Q7 are femaleOnly but still require output values.
      if (field === "sex") {
        if (value === "Male") {
          nextState.menstrual_cycle = "Not applicable";
          nextState.pregnancy_related = "Not applicable";
        }

        if (value === "Female") {
          nextState.menstrual_cycle = null;
          nextState.pregnancy_related = null;
        }
      }

      // Q14 description only applies when the parent answer is Yes.
      if (
        field === "past_treatment_side_effects" &&
        value === "No"
      ) {
        nextState.describe = "";
      }

      return nextState;
    });
  }

  function updateHabit<K extends keyof Habits>(
    field: K,
    value: Habits[K]
  ) {
    setIntake((current) => {
      const nextHabits: Habits = {
        ...current.habits,
        [field]: value,
      };

      if (field === "smoking" && value === "No") {
        nextHabits.smoking_severity = null;
      }

      if (
        field === "salon_treatments" &&
        value === "No"
      ) {
        nextHabits.salon_treatment_detail = "";
      }

      return {
        ...current,
        habits: nextHabits,
      };
    });
  }

  function updateProduct(
    product: ProductName,
    updates: Partial<ProductResponse>
  ) {
    setIntake((current) => {
      const nextProduct: ProductResponse = {
        ...current.products[product],
        ...updates,
      };

      // Unselected Q12 rows remain in output as used:false.
      if (updates.used === false) {
        nextProduct.duration = null;
        nextProduct.helped = null;
        nextProduct.side_effects = null;
      }

      return {
        ...current,
        products: {
          ...current.products,
          [product]: nextProduct,
        },
      };
    });
  }

  function updateProcedure(
    procedure: ProcedureName,
    updates: Partial<ProcedureResponse>
  ) {
    setIntake((current) => {
      const nextProcedure: ProcedureResponse = {
        ...current.procedures[procedure],
        ...updates,
      };

      // Unselected Q13 rows remain in output as done:false.
      if (updates.done === false) {
        nextProcedure.sessions = null;
        nextProcedure.helped = null;
      }

      return {
        ...current,
        procedures: {
          ...current.procedures,
          [procedure]: nextProcedure,
        },
      };
    });
  }

  function resetIntake() {
    setIntake(initialIntakeState);
  }

  const value = useMemo<IntakeContextValue>(
    () => ({
      intake,
      updateField,
      updateHabit,
      updateProduct,
      updateProcedure,
      resetIntake,
    }),
    [intake]
  );

  return (
    <IntakeContext.Provider value={value}>
      {children}
    </IntakeContext.Provider>
  );
}