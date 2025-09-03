import { describe, it, expect } from 'vitest'
import { computePAYE, computeNIEmployee, computeNIEmployer, computePension, computeStudentLoan, computeAnnual } from '../server/payroll/calculators'

describe('payroll calculators', () => {
  it('computes PAYE for 30k', () => {
    const tax = computePAYE(30000)
    expect(tax).toBeGreaterThan(0)
  })

  it('computes NI employee/employer for 30k', () => {
    expect(computeNIEmployee(30000)).toBeGreaterThan(0)
    expect(computeNIEmployer(30000)).toBeGreaterThan(0)
  })

  it('computes pension default for 30k', () => {
    const p = computePension(30000, false)
    expect(p.emp).toBeGreaterThan(0)
    expect(p.er).toBeGreaterThan(0)
  })

  it('computes student loan above threshold', () => {
    expect(computeStudentLoan(40000, true)).toBeGreaterThan(0)
  })

  it('computes annual summary for 30k', () => {
    const out = computeAnnual({ grossAnnual: 30000 })
    expect(out.netAnnual).toBeGreaterThan(0)
    expect(out.payeTaxAnnual).toBeGreaterThan(0)
  })
})


