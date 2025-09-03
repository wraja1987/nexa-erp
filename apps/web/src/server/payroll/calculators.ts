export type PayrollInputs = {
  grossAnnual: number
  niCategory?: 'A'
  pensionOptOut?: boolean
  taxCode?: string
  studentLoan?: boolean
}

export type PayrollOutputs = {
  payeTaxAnnual: number
  niEmployeeAnnual: number
  niEmployerAnnual: number
  pensionEmployeeAnnual: number
  pensionEmployerAnnual: number
  studentLoanAnnual: number
  netAnnual: number
}

// Simplified UK bands for demo (2025) — numbers illustrative
const PERSONAL_ALLOWANCE = 12570
const BASIC_RATE_LIMIT = 50270
const HIGHER_RATE_LIMIT = 125140

const BASIC_RATE = 0.2
const HIGHER_RATE = 0.4
const ADDITIONAL_RATE = 0.45

const NI_PT = 9500
const NI_UE_THRESHOLD = 50000
const NI_EMP_RATE = 0.12
const NI_EMP_RATE_UPPER = 0.02
const NI_ER_RATE = 0.138

const PENSION_EMP_DEFAULT = 0.05
const PENSION_ER_DEFAULT = 0.03
const PENSION_LOWER_EARNINGS = 6240

const STUDENT_LOAN_THRESHOLD = 27295
const STUDENT_LOAN_RATE = 0.09

export function computePAYE(grossAnnual: number): number {
  const taxable = Math.max(0, grossAnnual - PERSONAL_ALLOWANCE)
  if (taxable <= 0) return 0
  let tax = 0
  const basicSlice = Math.min(taxable, BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE)
  tax += basicSlice * BASIC_RATE
  const higherSlice = Math.min(
    Math.max(0, taxable - (BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE)),
    HIGHER_RATE_LIMIT - BASIC_RATE_LIMIT
  )
  tax += higherSlice * HIGHER_RATE
  const additionalSlice = Math.max(0, taxable - (HIGHER_RATE_LIMIT - PERSONAL_ALLOWANCE))
  tax += additionalSlice * ADDITIONAL_RATE
  return Math.max(0, Math.round(tax))
}

export function computeNIEmployee(grossAnnual: number): number {
  const overPT = Math.max(0, grossAnnual - NI_PT)
  const base = Math.min(overPT, NI_UE_THRESHOLD - NI_PT)
  const upper = Math.max(0, overPT - base)
  return Math.round(base * NI_EMP_RATE + upper * NI_EMP_RATE_UPPER)
}

export function computeNIEmployer(grossAnnual: number): number {
  const overPT = Math.max(0, grossAnnual - NI_PT)
  return Math.round(overPT * NI_ER_RATE)
}

export function computePension(grossAnnual: number, optOut?: boolean): { emp: number; er: number } {
  if (optOut) return { emp: 0, er: 0 }
  const qualifying = Math.max(0, grossAnnual - PENSION_LOWER_EARNINGS)
  return {
    emp: Math.round(qualifying * PENSION_EMP_DEFAULT),
    er: Math.round(qualifying * PENSION_ER_DEFAULT),
  }
}

export function computeStudentLoan(grossAnnual: number, enabled?: boolean): number {
  if (!enabled) return 0
  const over = Math.max(0, grossAnnual - STUDENT_LOAN_THRESHOLD)
  return Math.round(over * STUDENT_LOAN_RATE)
}

export function computeAnnual(inputs: PayrollInputs): PayrollOutputs {
  const paye = computePAYE(inputs.grossAnnual)
  const niEmp = computeNIEmployee(inputs.grossAnnual)
  const niEr = computeNIEmployer(inputs.grossAnnual)
  const pension = computePension(inputs.grossAnnual, inputs.pensionOptOut)
  const loan = computeStudentLoan(inputs.grossAnnual, inputs.studentLoan)
  const net = Math.round(
    inputs.grossAnnual - paye - niEmp - pension.emp - loan
  )
  return {
    payeTaxAnnual: paye,
    niEmployeeAnnual: niEmp,
    niEmployerAnnual: niEr,
    pensionEmployeeAnnual: pension.emp,
    pensionEmployerAnnual: pension.er,
    studentLoanAnnual: loan,
    netAnnual: net,
  }
}


