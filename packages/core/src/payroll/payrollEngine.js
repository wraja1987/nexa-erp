function calculatePayroll(employees) {
  if (!Array.isArray(employees)) return 0
  return employees.reduce((sum, e) => sum + ((e.hours || 0) * (e.rate || 0)), 0)
}

function validateEmployee(e) {
  return !!(e && e.id)
}

function run(config) {
  return { ok: true, config: !!config }
}

module.exports = {
  calculatePayroll,
  validateEmployee,
  run,
  default: run,
}

// Minimal payroll engine stubs: PAYE/NI samples, statutory pay skeleton, AE assessment, journal output
function calcPAYE(gross, code) {
  // Extremely simplified: demo only, not production-calibre
  // BR: flat 20%, K: add 50 to gross as negative allowance, W1/M1: treat as non-cumulative, S: Scottish rate 19%
  let taxable = gross;
  if (code.startsWith('K')) taxable += 50;
  let rate = 0.2;
  if (code.startsWith('S')) rate = 0.19;
  return Math.max(0, +(taxable * rate).toFixed(2));
}

function calcNI(gross, letter) {
  const rate = letter === "A" ? 0.12 : 0.12
  // Simplified NI: A 12% over 1000, else 0
  const threshold = 1000;
  return gross > threshold ? +(((gross - threshold) * rate).toFixed(2)) : 0;
}

function statutoryPay(type, params) {
  // Placeholder: return positive number for sample coverage
  const base = params?.avgWeekly || 100;
  return type === 'SMP' ? +(base * 0.9).toFixed(2) : type === 'SSP' ? +(base * 0.28).toFixed(2) : 0;
}

function autoEnrolmentAssessment(age, earnings) {
  // Basic AE rule stub
  const eligible = age >= 22 && earnings >= 10000;
  return { eligible, scheme: eligible ? 'AUTO' : 'NONE' };
}

function buildPayrollJournal({ tenant_id, gross, paye, ni, periodId }) {
  const lines = [
    { account: '7000', debit: gross },
    { account: '2210', credit: paye },
    { account: '2220', credit: ni },
    { account: '1000', credit: +(gross - paye - ni).toFixed(2) }
  ];
  const total = lines.reduce((s, l) => s + (l.debit || 0) - (l.credit || 0), 0);
  if (Math.abs(total) > 1e-6) throw new Error('Unbalanced payroll journal');
  return { tenant_id, periodId, lines };
}

const { assertSoD } = require('../index.js');
function finalisePayroll(ctx){ assertSoD(ctx,'CHANGE_SUBSCRIPTION'); return { status: 'PENDING_APPROVAL' }; }
module.exports = { calcPAYE, calcNI, statutoryPay, autoEnrolmentAssessment, buildPayrollJournal, finalisePayroll };
