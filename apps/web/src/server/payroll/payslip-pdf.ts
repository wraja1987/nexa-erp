import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export type PayslipDoc = {
  employeeName: string
  employeeCode?: string
  periodStart: string
  periodEnd: string
  gross: number
  net: number
  tax: number
  ni: number
  pensionEmployee?: number
  pensionEmployer?: number
  studentLoan?: number
}

export async function renderPayslipPDF(data: PayslipDoc): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const title = 'Nexa ERP — Payslip'
  page.drawText(title, { x: 50, y: height - 60, size: 18, font, color: rgb(0, 0, 0) })
  page.drawText(`Employee: ${data.employeeName}${data.employeeCode ? ` (${data.employeeCode})` : ''}`, { x: 50, y: height - 100, size: 12, font })
  page.drawText(`Period: ${data.periodStart} to ${data.periodEnd}`, { x: 50, y: height - 120, size: 12, font })

  const rows: Array<[string, string]> = [
    ['Gross', pounds(data.gross)],
    ['Net', pounds(data.net)],
    ['PAYE', pounds(data.tax)],
    ['NI', pounds(data.ni)],
  ]
  if (data.pensionEmployee !== undefined) rows.push(['Pension (Emp)', pounds(data.pensionEmployee)])
  if (data.pensionEmployer !== undefined) rows.push(['Pension (Er)', pounds(data.pensionEmployer)])
  if (data.studentLoan !== undefined) rows.push(['Student Loan', pounds(data.studentLoan)])

  let y = height - 170
  for (const [k, v] of rows) {
    page.drawText(k, { x: 50, y, size: 12, font })
    page.drawText(v, { x: 300, y, size: 12, font })
    y -= 20
  }

  const pdfBytes = await pdfDoc.save()
  const outDir = path.resolve(process.cwd(), 'apps/web/public/_generated/payslips')
  fs.mkdirSync(outDir, { recursive: true })
  const filename = `payslip-${Date.now()}.pdf`
  const outPath = path.join(outDir, filename)
  fs.writeFileSync(outPath, pdfBytes)
  // Return a public path consumers can use
  return `/_generated/payslips/${filename}`
}

function pounds(amount: number): string {
  return `£${Number(amount || 0).toFixed(2)}`
}


