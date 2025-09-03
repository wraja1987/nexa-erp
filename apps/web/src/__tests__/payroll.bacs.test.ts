import { describe, it, expect } from 'vitest'
import { toBacsCsv } from '../server/payroll/bacs'

describe('BACS CSV', () => {
  it('produces header and rows', () => {
    const csv = toBacsCsv([
      { DestinationSortCode: '000000', DestinationAccountNumber: '00000000', AmountPence: 12345, DestinationName: 'EMP', Reference: 'PAY-001', ProcessingDate: '20250101' },
    ])
    expect(csv).toMatch(/DestinationSortCode,DestinationAccountNumber,AmountPence,DestinationName,Reference,ProcessingDate/)
    expect(csv).toMatch(/PAY-001/)
  })
})


