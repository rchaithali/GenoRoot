# GenoRoot Hair & Scalp Intake

A patient-facing hair and scalp intake experience built for the Haiku Studio Full Stack Engineer take-home.

The goal of this implementation was not to reproduce the supplied questionnaire as a conventional form. I treated the provided 16-question structure and output schema as the contract, then designed the patient interaction around making each answer as low-effort and understandable as possible.

A substantial part of the work on this project went into thinking through each question individually: what the patient actually needs to understand, whether the answer is best collected through a tap, conditional interaction, short text response, or voice, what can safely be inferred from earlier information, and where the application should deliberately avoid making assumptions.

The current version includes:

- A responsive patient intake across five focused sections
- Lightweight patient context for age and sex where it helps the interaction and applicability logic
- Conditional handling of female-only questions
- Question-specific single-select and multi-select interactions
- Conditional follow-ups that appear only when relevant
- A guided voice-assisted interaction for the habits and hair-routine section
- Review-before-submission experience
- Validation across required and conditional answers
- Exact structured output aligned to the supplied intake contract
- A separate evaluator/developer JSON output view
- Automated contract and edge-case tests for the intake logic

The implementation deliberately stays focused on the patient-facing outcome requested in the brief. I did not add login, an admin panel, patient accounts, or backend infrastructure simply to increase implementation surface area.

For a detailed explanation of the interaction decision, constraint, and possible future refinement for every required question, see **Question-by-Question Design Decisions** near the end of this README.

---

## Links

**Live application:**  
[https://genoroot-intake-lovat.vercel.app]

**Evaluator structured output:**  
[https://genoroot-intake-lovat.vercel.app/#/output]

**GitHub repository:**  
[https://github.com/rchaithali/GenoRoot]

**walkthrough:**  
[https://drive.google.com/file/d/1se_V-SD__Cv1Yrywvsap_aGtH3Q9SS33/view?usp=sharing]

> The evaluator output is intentionally separate from the patient-facing experience. After a successful intake submission, `/#/output` displays the exact structured JSON produced by the application.

---

## Tech Stack & Tools

The application is built with **React, TypeScript, and Vite**.

The intake state is represented through explicit TypeScript types and shared through React Context, allowing every page to work against the same structured patient state while preserving the supplied output contract.

**Vitest** is used for automated contract and edge-case testing. The current suite contains **30 passing tests** covering initialization, required answers, conditional fields, contradictory states, gender-dependent fields, nested treatment structures, consent, and final output integrity.

The guided voice interaction uses browser speech capabilities for speech input and maps recognized answers into the same structured state used by manual controls. Voice is treated as an input method, not as a separate version of the form.

**Stitch** was used during the UI/design workflow, alongside AI-assisted development tools for implementation and iteration.

The application is deployed using **Vercel**.

I deliberately kept the technical architecture lightweight for this prototype. The requested outcome is a patient-facing intake, and the final structured result can be demonstrated and verified without introducing a database, authentication system, or backend solely for architectural complexity.

---

## Application Flow

```text
Language entry
      ↓
Patient context
Current age + assigned sex at birth
      ↓
Section A
Personal & Family Hair Loss History
      ↓
Section B
Hormonal & Health Influences
      ↓
Section C
Lifestyle & Environmental Triggers
      ↓
Section D
Current Hair Care & Treatments
      ↓
Section E
Sample Collection & Consent
      ↓
Review Answers
      ↓
Validation
      ↓
Submit
      ↓
Exact structured intake output
      ↓
Patient sees completion state

Separately:

Submitted structured output
      ↓
sessionStorage
      ↓
/#/output
      ↓
Evaluator-readable JSON
```

All five intake pages operate on one typed `IntakeState`.

Patient-facing helper context such as `currentAge` and `sex` can support interaction and branching without being added to the required final output.

The final transformation deliberately returns the supplied intake structure rather than simply serializing every piece of UI state.

---

## Patient Experience & Interaction Design

The questionnaire is not treated as sixteen identical form fields.

Each interaction was chosen based on the answer being collected.

Small fixed sets of mutually exclusive answers use large single-select controls. Multi-value questions use visible multi-select controls. Conditional information appears only after the parent answer makes it relevant. Open-ended information uses text where the schema genuinely requires text.

For the habits and hair-routine section, the patient can use a guided voice interaction. This is a section where several short questions would otherwise require repeated taps, so voice can meaningfully reduce interaction rather than being added simply because speech input is available.

The application also distinguishes between **patient-facing language** and **stored schema values**.

For example, a patient can see a more natural phrase such as:

> Either is fine

while the structured value remains:

`Either`

Likewise, internal table-shaped data does not require the patient to fill a literal table. Products and procedures are presented as relevant selections and conditional follow-ups while still producing the required nested structure.

### Deliberate limits on inference

This is a medical intake, so reducing effort cannot mean silently manufacturing medical information.

The application therefore avoids unnecessary clinical inference.

For example:

- Male patients can skip fields explicitly marked female-only while the required value becomes `Not applicable`.
- Menopause is not inferred from age.
- Pregnancy status is not inferred.
- Diagnosed conditions are not inferred from symptoms.
- Consent is never inferred or preselected.
- Clinical questions outside the supplied questionnaire are not invented simply because they may appear medically plausible.

Where a future version could collect richer medical context, I would validate that additional information with clinicians before expanding the questionnaire.

---

## Structured Output & Contract Fidelity

The supplied structured intake is treated as the source of truth.

The final output preserves the required fields:

```text
age_hair_loss_began
duration
family_history
pattern
diagnosed_conditions
menstrual_cycle
pregnancy_related
adult_acne_oily_skin
excess_body_facial_hair
past_6_months
habits
products
procedures
past_treatment_side_effects
describe (conditional)
sample_type
consent
```

Additional UI context such as:

```text
currentAge
sex
```

is deliberately excluded from the final structured output.

### Conditional output behavior

The application also preserves meaningful conditional behavior:

- Male patients receive `Not applicable` for the female-only menstrual and pregnancy fields.
- Smoking severity is relevant only when smoking is `Yes`.
- Salon treatment detail is relevant only when salon treatments are `Yes`.
- Unused product rows remain represented with `used: false`.
- Product follow-ups are required only for selected products.
- Procedures not undergone remain represented with `done: false`.
- Procedure follow-ups are required only for selected procedures.
- The Q14 `describe` field is included only when past treatment side effects / poor response is `Yes`.
- Q10 can legitimately produce an empty array because the supplied schema does not provide a `None` value.
- Consent `Yes` and `No` are both valid patient responses. A `No` response is preserved rather than being silently converted into consent.

The evaluator output route exists specifically so this contract can be inspected independently of the patient-facing UI.

---

## Validation & Testing

I wanted the verification for this prototype to test the **intake contract and its edge cases**, rather than simply filling the form repeatedly with a collection of fake patients.

The project therefore includes an automated Vitest suite with **30 tests**.

Current result:

```text
Test Files  1 passed (1)
Tests       30 passed (30)
```

The suite checks cases including:

- Complete initialization of the structured intake
- Presence of every required product row
- Presence of every required procedure row
- Untouched intake being incomplete
- Valid completed female intake
- Valid completed male intake with female-only fields marked `Not applicable`
- Q10 being valid with no selected triggers
- Smoking severity being required when smoking is `Yes`
- Rejection of stale smoking severity when smoking becomes `No`
- Salon treatment detail being conditional
- Rejection of stale salon treatment detail
- Required product follow-ups when a product is used
- Valid completely unused product rows
- Rejection of stale follow-up values on unused products
- Required procedure follow-ups when a procedure was performed
- Rejection of stale follow-up values on procedures not performed
- Required Q14 description after a positive answer
- Rejection of stale Q14 description after the parent answer becomes `No`
- Contradictory family-history selections
- `None` combined with diagnosed conditions
- Incorrect female-only values for a male patient
- Consent `Yes`
- Consent `No`
- Missing consent
- Exclusion of helper fields from final output
- Presence of every required top-level output field
- Conditional Q14 description output
- Preservation of every nested product row
- Preservation of every nested procedure row

The test data is synthetic and contains no real patient information.

Linting is also checked with:

```bash
npm run lint
```

and the production bundle can be verified with:

```bash
npm run build
```

This testing approach is intentionally focused on the parts of the intake most likely to produce incorrect clinical data: conditional dependencies, contradictory selections, stale hidden values, and output-shape regressions.

---

## What I Added Beyond the Supplied Form

I kept additions deliberately small and tied them to the patient experience or evaluation of the prototype.

### Patient context

Current age and assigned sex at birth are collected before the required intake.

Sex provides the context needed to handle the supplied `femaleOnly` questions without making every patient answer irrelevant fields.

These helper values do not alter the required final structured output.

### Language entry point

The intake begins with a language step.

The current prototype is intentionally implemented in English, but the entry point establishes the interaction needed for a future localized intake rather than assuming language selection should be retrofitted into every page later.

### Guided voice interaction

The habits and hair-routine section demonstrates the core idea of a form that can partially fill itself.

Instead of treating speech as unstructured output, recognized answers are mapped into the same typed structured state as manual interactions.

### Patient review

Before submission, patients can review their answers in a readable format rather than being shown raw JSON.

### Separate evaluator output

The patient never needs to inspect implementation-oriented structured data.

The submitted JSON is instead available through a separate evaluator route.

### Automated intake-contract tests

Rather than relying only on manual happy-path testing, the project includes dedicated tests for conditional logic, contradictions, stale state, nested structures, and output integrity.

---

# With One More Week

The highest-value next step would not be to add AI to every question.

It would be to take the working voice-assisted intake concept and develop it into a reliable **multilingual, question-aware input layer** while preserving the fastest interaction for each individual question.

## 1. Multilingual + voice-assisted intake

At the beginning of the intake, the patient could choose a preferred language.

For example:

```text
English
Hindi
Kannada
Other supported languages
```

The questionnaire could then render in that language.

Each question could optionally be read aloud, and questions where speech genuinely reduces effort could accept spoken answers.

Conceptually:

```text
Preferred language
        ↓
Localized question
        ↓
Tap answer OR speak
        ↓
Speech-to-text when needed
        ↓
Question-aware interpretation
        ↓
Validate against allowed schema
        ↓
Autofill structured answer
        ↓
Confirm only if interpretation is ambiguous
```

I would evaluate speech-to-text, text-to-speech, localization/translation, and potentially LLM-based interpretation services based on:

- Indian-language quality
- latency
- reliability
- privacy
- cost
- structured-output support

I would not choose a provider solely because it has the broadest model capability.

For fixed questions, deterministic mapping remains preferable wherever possible. A model becomes useful when the patient gives a genuinely natural answer that needs interpretation.

Most importantly, ambiguous interpretation should lead to **patient confirmation**, not silent guessing.

---

## 2. Clinician-validated conditional detail

Several supplied fields intentionally compress information.

For example, Q10 records whether the patient experienced:

- major weight loss / crash dieting
- significant stress
- illness with fever
- surgery
- environmental change

but not much context about the event.

With additional time, I would work with clinicians to identify which positive answers genuinely deserve one short follow-up.

Examples worth evaluating include:

- What illness and approximately when?
- What surgery and approximately when?
- Approximately when did the major weight loss occur?
- What changed: location, water, air quality, or more than one?

The important constraint is that these should be added **only when the additional information helps the consultation**.

Making the questionnaire clinically longer simply because the software can collect more data would work against the low-friction goal.

---

## 3. Represent uncertainty more accurately

Some supplied fields force certainty where a real patient may be uncertain.

Examples include:

- whether their water is hard
- exact onset age
- some health-history classifications
- routines that do not fit the supplied frequency buckets

A production version could preserve uncertainty separately rather than forcing it into the closest allowed answer.

This would require evolving the data model with the clinic rather than silently changing the meaning of the supplied fields.

---

## 4. Richer treatment context where useful

The supplied treatment structures intentionally remain compact.

Potential clinician-validated improvements include:

- description of side effects after a positive product response
- description of what improved or failed to improve
- identifying the procedure represented by `Other`
- more natural duration answers such as “since January,” mapped into the clinic's required range

Again, the goal would be to improve useful clinical context without turning every positive response into another page of questions.

---

## 5. Accessibility and device hardening

I would expand testing across:

- smaller mobile screens
- different browsers
- keyboard-only navigation
- screen readers
- larger text settings
- speech-permission failures
- poor/noisy microphone input
- slow network conditions where external speech services are involved

Touch targets, contrast, focus states, readable typography, and non-voice fallback paths would remain first-class requirements.

---

## 6. Production data flow

The current prototype deliberately avoids backend infrastructure that is unnecessary for demonstrating the patient experience and structured result.

For a production clinic workflow, I would evaluate adding:

```text
Patient intake
      ↓
Validated API
      ↓
Server-side schema validation
      ↓
Secure persistence
      ↓
Clinician-facing structured record
```

The exact backend, database, hosting, encryption, retention, and access-control choices should be made against the clinic's real privacy, operational, and compliance requirements rather than assumed during a short prototype.

---

## 7. Clinical and consent review

I deliberately did not expand the clinical questionnaire independently.

With more time, I would review the intake with clinicians for gaps across different patient populations and validate any additional branching before implementing it.

Likewise, production consent should use clinic-approved clinical/legal language covering whatever sample use, storage, retention, privacy, or other policies actually apply.

The prototype does not invent permissions that were not present in the supplied requirement.

---

> **P.S.** A substantial part of this prototype was spent deciding how each individual question should be answered rather than treating the supplied JSON as a generic form schema. The section below documents those decisions question by question, including the reasoning behind the interaction, important constraints in the supplied structure, and the most relevant future improvement where one was identified.

---

# Run Locally

### Requirements

- Node.js
- npm

### Install

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Run automated tests

```bash
npm test
```

### Run lint

```bash
npm run lint
```

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

After submitting an intake locally, the structured evaluator output can be inspected at:

```text
/#/output
```

---

# Question-by-Question Design Decisions

## Pre-intake context · Current age and sex

Two lightweight context fields are collected before the supplied 16 questions.

**Current age** gives the intake basic patient context and can support future improvements around age-related validation or assisted answers.

**Assigned sex at birth** supports the applicability of Q6 and Q7, which the supplied schema explicitly marks as female-only.

For this prototype, the choices remain aligned to the branching needed by the supplied contract. A production version should revisit broader patient representation and the corresponding clinical branching **together**, with clinician guidance, rather than simply adding identity options without changing the underlying medical logic.

Neither helper field is included in the required final output.

---

## Q1 · Age when hair loss began

**Interaction:** Direct numeric entry with reassurance that an approximate age is acceptable.

**Why:** The supplied output explicitly requires a number. Entering a short numeric value is faster and more reliable than introducing speech, a slider, or ranges for a simple answer.

**Constraint:** The current schema cannot distinguish an exact age from a patient's best estimate.

**Possible improvement:** If clinically useful, preserve approximation/range metadata rather than manufacturing false precision.

---

## Q2 · Duration

**Interaction:** Three directly visible single-select options:

- Less than 6 months
- 6–12 months
- Over a year

**Why:** These map one-to-one to the three allowed values, making the interaction one question, one tap, and no interpretation.

**Constraint:** Everything beyond one year is grouped together, so 14 months and several years produce the same structured value.

**Possible improvement:** Preserve a more precise duration alongside the required category if clinicians find the additional detail useful.

---

## Q3 · Family history

**Interaction:** Visible multi-select controls for father, mother, siblings, and no known family history.

**Why:** Several relatives may apply, matching the supplied multi-value output.

**Important logic:** `No known family history` is mutually exclusive with positive family-history selections. Contradictory combinations are prevented rather than accepted and corrected later.

**Possible improvement:** Extended-family history should only be added if clinicians determine that it provides useful additional information.

---

## Q4 · Hair-loss pattern

**Interaction:** Multi-select presentation of the supplied pattern categories with clear patient-facing labels and selection states.

**Why:** Several patterns can coexist, so the interaction must support multiple answers without forcing the patient into one category.

This question particularly benefits from reducing terminology burden. Concepts such as crown thinning, diffuse thinning, or widening of the part line may not be equally familiar to every patient.

**Constraint:** The supplied output contains exactly six categories and should not be silently expanded into diagnoses.

**Possible improvement:** Clinician-reviewed visual references across different hair types and presentations could make recognition easier, with a natural-language fallback that suggests categories for explicit patient confirmation rather than assigning them silently.

---

## Q5 · Diagnosed conditions

**Interaction:** Multi-select controls for the five supplied conditions plus `None`.

**Why:** The field asks specifically about diagnosed conditions. Patients identify diagnoses they already have rather than describing symptoms for the application to diagnose.

**Important logic:** `None` is mutually exclusive with all diagnosed conditions.

**Constraint:** The supplied schema has no explicit uncertainty state.

**Possible improvement:** A future clinical model could distinguish confirmed none from patient uncertainty and preserve patient-reported symptoms separately, without writing inferred conditions into `diagnosed_conditions`.

---

## Q6 · Menstrual cycle

**Interaction:** Direct single-select choices with concise patient-friendly explanation where needed.

**Applicability:** For a male patient, the question is skipped and the required output becomes:

`Not applicable`

For a female patient, the supplied menstrual-cycle options are presented.

**Why:** The output already consists of fixed categories, but labels such as regular, irregular, menopausal, and not applicable can benefit from contextual wording.

**Important constraint:** The application does not infer menopause from age or independently diagnose reproductive status.

**Possible improvement:** With clinician validation, a richer model could distinguish situations currently compressed into the supplied categories, such as perimenopause or other reasons for absent/irregular cycles.

---

## Q7 · Pregnancy-related status

**Interaction:** Three natural-language single-select choices corresponding to:

- Currently pregnant
- Postpartum <1 year
- Not applicable

**Applicability:** Male patients skip the question and receive `Not applicable`.

**Why:** Patient-facing language such as “I gave birth within the past year” is easier to understand than exposing schema-oriented wording such as `Postpartum <1 year`.

**Important constraint:** Pregnancy is never inferred from another response.

**Possible improvement:** If clinicians need it, current pregnancy/postpartum status could eventually be separated from historical pregnancy-related hair loss.

---

## Q8 · Adult acne / oily skin

**Interaction:** Direct Yes/No.

**Why:** The supplied output is binary. Patient-facing wording clarifies that the question concerns meaningful adult acne/breakouts or noticeably oily skin rather than an occasional pimple.

The original OR relationship is preserved: the patient does not need to experience both acne and oily skin for the answer to be Yes.

**Possible improvement:** Acne and oily skin could be separated into individual signals if clinicians find the distinction useful.

---

## Q9 · Excess body / facial hair

**Interaction:** Direct Yes/No.

**Why:** Instead of asking the patient to determine whether their hair is objectively “excessive,” the wording focuses on noticeable increase, thickness, or new growth relative to their own baseline.

This reduces subjective comparison with other people.

**Possible improvement:** Location, timing, or progression could be collected after a positive response if clinicians determine that those details materially help assessment.

---

## Q10 · Past six months

**Interaction:** Large multi-select controls for the five supplied triggers.

**Why:** Multiple lifestyle, health, and environmental events can coexist.

The patient-facing wording clarifies potentially narrow interpretations. Illness examples such as COVID, dengue, and typhoid are treated as examples rather than an exhaustive disease list. Stress is framed relative to the patient's own baseline, and environmental change is not unnecessarily limited to long-distance relocation.

**Important schema decision:** The supplied output provides no `None` value. Therefore a patient with none of the listed triggers produces:

```json
[]
```

rather than an invented additional option.

**Possible improvement:** Clinician-validated conditional follow-ups could collect useful timing/context for positive answers without making every patient complete additional fields.

---

## Q11 · Habits & Hair Routine

This is the main voice-assisted interaction in the current prototype.

The supplied field is table-shaped, but the patient is not asked to fill a table.

The section collects:

- Smoking
- Smoking severity when relevant
- Alcohol
- Hard water
- Hair-wash frequency
- Heating tools / styling chemicals
- Salon treatments
- Salon-treatment detail when relevant

### Voice interaction

The patient can use a guided voice flow where questions are presented sequentially and recognized responses populate the same structured state used by manual controls.

Conditional questions appear only when required.

For example:

```text
Do you smoke?
      ↓
Yes
      ↓
How many cigarettes per day?
      ↓
7
      ↓
Moderate 5-10/day
```

The patient supplies the understandable real-world information, while the application maps it into the clinic's required category.

### Manual interaction

The same information can be completed through direct controls.

Voice is therefore an optional input method, not a separate data model.

**Why voice here:** Several short questions and conditional follow-ups make this one of the places where speaking can genuinely reduce repetitive interaction.

**Current constraints:** Hard water accepts only Yes/No even though a patient may genuinely not know. Hair-wash frequency is limited to the three supplied categories even though real routines may fall between them.

**Possible improvement:** Extend the guided system into multilingual speech, optional spoken questions, better uncertainty handling, and more natural answers while retaining deterministic structured mapping wherever possible.

---

## Q12 · Products / medications

The supplied structure contains five fixed product rows:

- OTC/Medicated Shampoos
- Hair Oils/Serums
- Topical Minoxidil
- Oral Minoxidil
- Supplements

Each row preserves:

```text
used
duration
helped
side_effects
```

**Interaction:** Patients first identify products they have actually used. Follow-up information is relevant only for selected products.

**Why:** A literal table could expose many irrelevant cells. Starting with relevance avoids asking about duration, effectiveness, or side effects for something the patient never used.

Unselected products remain in the structured result as:

```json
{
  "used": false,
  "duration": null,
  "helped": null,
  "side_effects": null
}
```

**Important state behavior:** If a previously selected product is deselected, stale follow-up values are cleared rather than remaining hidden in the final data.

**Possible improvement:** For positive side effects or treatment response, collect a short clinician-useful description. Natural durations such as “since January” could also be mapped into the supplied duration categories.

---

## Q13 · In-clinic procedures

The supplied procedure rows are:

- PRP/GFC/iPRF
- Stem Cells/Exosomes
- Hair Transplant
- Other

Each preserves:

```text
done
sessions
helped
```

**Interaction:** Patients identify procedures they have undergone and complete follow-ups only for relevant procedures.

**Why:** As with products, the schema's table structure is useful for data but unnecessary as a patient-facing table.

Unselected procedures remain represented with `done: false`, and stale follow-up state is cleared when a procedure is deselected.

**Constraint:** The supplied `Other` row contains no field for the name of the other procedure.

**Possible improvement:** Add a clinician-approved conditional description for `Other`, rather than knowing that another procedure occurred but not what it was.

---

## Q14 · Past treatment side effects / poor response

**Interaction:** Direct Yes/No, followed by a text description only when the answer is Yes.

The follow-up asks the patient to explain what happened rather than asking only about physical side effects, because the supplied field also covers poor treatment response.

**Why:** Free text is appropriate here because Haiku explicitly requests a description rather than a fixed category.

When the parent answer becomes No, stale description text is cleared.

The final output includes `describe` only when the parent response is Yes.

**Possible improvement:** Optional speech-to-text could reduce mobile typing, while a carefully validated summarization layer could eventually organize longer patient descriptions for clinicians without changing the patient's reported meaning.

---

## Q15 · Preferred sample type

**Interaction:** Three directly visible single-select choices:

- Saliva
- Blood
- Either is fine

**Why:** This is a straightforward preference question and needs only one tap.

Patient-facing `Either is fine` maps directly to the required structured value:

`Either`

No additional interaction is necessary.

---

## Q16 · Consent

**Interaction:** Explicit manual choice:

- Yes, I consent
- No, I do not consent

The question states that consent concerns collection of the selected sample and its use for genetic analysis.

**Why:** Consent should be deliberate, visible, and unambiguous.

Nothing is preselected, and consent is not inferred from any previous answer.

A patient choosing `No` has still provided a valid answer to the intake. The application preserves that answer and communicates that sample collection/genetic analysis should not proceed without consent.

**Production consideration:** A real clinic deployment should replace prototype wording with clinic-approved clinical/legal consent language and any required information about privacy, storage, retention, or sample use.

---

# Final Product Judgment

The central design decision in this prototype was to treat the supplied JSON as a **data contract, not a UI specification**.

A `single` field does not automatically become a dropdown.

A `multi` field does not automatically become a generic checkbox list without considering contradictions or comprehension.

A `table` does not mean the patient should fill a spreadsheet.

A free-text field does not need AI simply because AI is available.

And a medical question should not be inferred simply because inference is technically possible.

The application uses the simplest interaction that reliably produces each required value, introduces conditional behavior where it removes unnecessary patient work, and uses voice where it can meaningfully reduce repetitive interaction.

The same principle would guide the next version:

**make the software do more work for the patient, while never turning convenience into silent medical certainty.**