/**
 * Payroll Engine Tests
 * 
 * Tests for UK PAYE/NI/Pension calculations
 */

import { describe, it, expect } from "vitest";
import {
  calculateEmployeePayroll,
  type EmployeePayrollData,
} from "../engine";
import {
  computePAYE,
  computeNIEmployee,
  computeNIEmployer,
  computePension,
  computeStudentLoan,
} from "../calculators";

describe("Payroll Calculations", () => {
  describe("PAYE Tax", () => {
    it("should calculate PAYE for basic rate taxpayer", () => {
      const tax = computePAYE(30000); // £30k annual
      expect(tax).toBeGreaterThan(0);
      expect(tax).toBeLessThan(30000);
    });

    it("should return zero tax for income below personal allowance", () => {
      const tax = computePAYE(10000);
      expect(tax).toBe(0);
    });

    it("should calculate PAYE for higher rate taxpayer", () => {
      const tax = computePAYE(60000); // £60k annual
      expect(tax).toBeGreaterThan(6000); // Should be > 20% of taxable
    });
  });

  describe("NI Calculations", () => {
    it("should calculate employee NI", () => {
      const ni = computeNIEmployee(30000);
      expect(ni).toBeGreaterThan(0);
      expect(ni).toBeLessThan(30000);
    });

    it("should calculate employer NI", () => {
      const ni = computeNIEmployer(30000);
      expect(ni).toBeGreaterThan(0);
      expect(ni).toBeGreaterThan(computeNIEmployee(30000)); // Employer rate higher
    });

    it("should return zero NI below primary threshold", () => {
      const ni = computeNIEmployee(8000);
      expect(ni).toBe(0);
    });
  });

  describe("Pension Calculations", () => {
    it("should calculate pension contributions", () => {
      const pension = computePension(30000, false);
      expect(pension.emp).toBeGreaterThan(0);
      expect(pension.er).toBeGreaterThan(0);
    });

    it("should return zero if opted out", () => {
      const pension = computePension(30000, true);
      expect(pension.emp).toBe(0);
      expect(pension.er).toBe(0);
    });
  });

  describe("Student Loan", () => {
    it("should calculate student loan deduction", () => {
      const loan = computeStudentLoan(30000, true);
      expect(loan).toBeGreaterThan(0);
    });

    it("should return zero if not applicable", () => {
      const loan = computeStudentLoan(30000, false);
      expect(loan).toBe(0);
    });

    it("should return zero below threshold", () => {
      const loan = computeStudentLoan(20000, true);
      expect(loan).toBe(0);
    });
  });

  describe("Employee Payroll Calculation", () => {
    const employee: EmployeePayrollData = {
      employeeId: "test-emp-1",
      empNo: "EMP001",
      firstName: "John",
      lastName: "Doe",
      grossAnnual: 30000,
      taxCode: "1257L",
      niCategory: "A",
      pensionOptOut: false,
      studentLoan: false,
    };

    it("should calculate monthly payroll correctly", () => {
      const result = calculateEmployeePayroll(employee, 30, "monthly");
      
      expect(result.periodGross).toBeGreaterThan(0);
      expect(result.payeTax).toBeGreaterThan(0);
      expect(result.niEmployee).toBeGreaterThan(0);
      expect(result.niEmployer).toBeGreaterThan(0);
      expect(result.pensionEmployee).toBeGreaterThan(0);
      expect(result.pensionEmployer).toBeGreaterThan(0);
      expect(result.netPay).toBeLessThan(result.periodGross);
      expect(result.totalCost).toBeGreaterThan(result.periodGross);
    });

    it("should calculate weekly payroll correctly", () => {
      const result = calculateEmployeePayroll(employee, 7, "weekly");
      
      expect(result.periodGross).toBeGreaterThan(0);
      expect(result.netPay).toBeLessThan(result.periodGross);
    });

    it("should handle pension opt-out", () => {
      const empOptOut = { ...employee, pensionOptOut: true };
      const result = calculateEmployeePayroll(empOptOut, 30, "monthly");
      
      expect(result.pensionEmployee).toBe(0);
      expect(result.pensionEmployer).toBe(0);
    });

    it("should handle student loan", () => {
      const empWithLoan = { ...employee, studentLoan: true };
      const result = calculateEmployeePayroll(empWithLoan, 30, "monthly");
      
      expect(result.studentLoan).toBeGreaterThan(0);
      expect(result.netPay).toBeLessThan(
        calculateEmployeePayroll(employee, 30, "monthly").netPay
      );
    });

    it("should handle period-specific gross override", () => {
      const empWithBonus = {
        ...employee,
        periodGross: 3500, // Bonus month
      };
      const result = calculateEmployeePayroll(empWithBonus, 30, "monthly");
      
      expect(result.periodGross).toBe(3500);
      expect(result.netPay).toBeLessThan(3500);
    });
  });

  describe("Net Pay Validation", () => {
    it("should ensure net pay equals gross minus deductions", () => {
      const employee: EmployeePayrollData = {
        employeeId: "test-emp-2",
        empNo: "EMP002",
        firstName: "Jane",
        lastName: "Smith",
        grossAnnual: 40000,
        taxCode: "1257L",
        niCategory: "A",
      };

      const result = calculateEmployeePayroll(employee, 30, "monthly");
      
      const expectedNet =
        result.periodGross -
        result.payeTax -
        result.niEmployee -
        result.pensionEmployee -
        result.studentLoan;

      expect(Math.abs(result.netPay - expectedNet)).toBeLessThan(0.01); // Allow rounding
    });
  });
});

