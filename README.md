# GenoRoot Hair & Scalp Intake

A patient-first digital intake experience built for the Haiku Studio Founding Full Stack Engineer take-home.

The goal is to turn a traditional 16-question hair and scalp clinic form into an intake that feels substantially lighter for the patient while still producing complete, structured data for the clinician.

## Product Approach

Rather than rendering the supplied schema as a conventional form, I designed the interaction question by question.

Different questions use different interaction patterns depending on the information being collected:

- direct single-tap selections for simple categorical answers
- multi-select controls where several answers can coexist
- visual recognition for hair-loss patterns
- conditional follow-ups that appear only when relevant
- contextual inference followed by patient confirmation where appropriate
- optional voice input where it meaningfully reduces repetitive typing or tapping
- explicit manual consent for sensitive consent information

Two lightweight context fields, current age and sex, are collected before the required intake to support contextual behavior and female-only question routing.

The supplied 16-question output contract remains intact.

## Architecture

```text
Patient
   ↓
Responsive React + TypeScript Intake
   ↓
Question-specific interaction logic
   ↓
Shared typed intake state
   ↓
Validation + schema mapping
   ↓
Complete structured Hair & Scalp Intake