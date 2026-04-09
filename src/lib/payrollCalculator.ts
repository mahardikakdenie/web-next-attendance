/**
 * PAYROLL CALCULATION ENGINE (Stateless)
 * Berdasarkan Regulasi Indonesia (TER PPh 21 & BPJS 2024)
 */

export interface PayrollInput {
  basicSalary: number;
  allowances: number;
  attendanceDays: number;
  workingDaysInMonth: number;
  overtimeHours: number;
  unpaidLeaveDays: number;
  ptkpStatus: "TK/0" | "TK/1" | "K/0" | "K/1" | "K/2" | "K/3"; // simplified
}

export const calculatePayroll = (input: PayrollInput) => {
  const { basicSalary, allowances, attendanceDays, workingDaysInMonth, unpaidLeaveDays } = input;

  // 1. Perhitungan Prorata (Jika ada unpaid leave atau mid-joiner)
  const proratedBasic = (attendanceDays / workingDaysInMonth) * basicSalary;
  const unpaidLeaveDeduction = (unpaidLeaveDays / workingDaysInMonth) * basicSalary;

  // 2. Gross Income (Bruto)
  const grossIncome = proratedBasic + allowances - unpaidLeaveDeduction;

  // 3. BPJS Calculation (Standard Indonesia)
  // Kesehatan: 4% Perusahaan, 1% Karyawan (Max Salary Cap IDR 12jt)
  const bpjsKesEmp = Math.min(grossIncome, 12000000) * 0.01;
  const bpjsKesComp = Math.min(grossIncome, 12000000) * 0.04;

  // Ketenagakerjaan (JHT: 2% Emp, 3.7% Comp | JKK: 0.24% Comp | JKM: 0.3% Comp)
  const jhtEmp = grossIncome * 0.02;
  const jhtComp = grossIncome * 0.037;
  const jkkComp = grossIncome * 0.0024;
  const jkmComp = grossIncome * 0.003;

  // 4. PPh 21 TER (Tarif Efektif Rata-rata 2024) - Simplified Logic
  // Kategori A (TK/0, TK/1, K/0), Kategori B (TK/2, TK/3, K/1, K/2), Kategori C (K/3)
  const getTERPercentage = (bruto: number) => {
    if (bruto <= 5400000) return 0;
    if (bruto <= 6200000) return 0.0025;
    if (bruto <= 7500000) return 0.005;
    if (bruto <= 8500000) return 0.0075;
    if (bruto <= 9200000) return 0.01;
    if (bruto <= 10400000) return 0.0125;
    if (bruto <= 15000000) return 0.03;
    return 0.05; // Simplified for demo
  };

  const pph21Amount = grossIncome * getTERPercentage(grossIncome);

  // 5. Net Salary Calculation
  const totalDeductions = bpjsKesEmp + jhtEmp + pph21Amount;
  const netSalary = grossIncome - totalDeductions;

  return {
    breakdown: {
      proratedBasic,
      unpaidLeaveDeduction,
      grossIncome,
      pph21Amount,
      bpjs: {
        health: { employee: bpjsKesEmp, company: bpjsKesComp },
        jht: { employee: jhtEmp, company: jhtComp },
        jkk: jkkComp,
        jkm: jkmComp
      }
    },
    netSalary,
    totalDeductions
  };
};
