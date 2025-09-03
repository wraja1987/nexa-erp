export type BacsRow = {
  DestinationSortCode: string
  DestinationAccountNumber: string
  AmountPence: number
  DestinationName: string
  Reference: string
  ProcessingDate: string // YYYYMMDD
}

export function toBacsCsv(rows: BacsRow[]): string {
  const header = [
    'DestinationSortCode',
    'DestinationAccountNumber',
    'AmountPence',
    'DestinationName',
    'Reference',
    'ProcessingDate',
  ].join(',')
  const body = rows
    .map((r) =>
      [
        r.DestinationSortCode,
        r.DestinationAccountNumber,
        String(r.AmountPence),
        csvEscape(r.DestinationName),
        csvEscape(r.Reference),
        r.ProcessingDate,
      ].join(',')
    )
    .join('\n')
  return `${header}\n${body}\n`
}

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"')) {
    return '"' + v.replace(/"/g, '""') + '"'
  }
  return v
}


