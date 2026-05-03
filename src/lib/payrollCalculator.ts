/**
 * PAYROLL CALCULATION ENGINE (Stateless)
 * Berdasarkan Regulasi Indonesia Terbaru (PP 58/2023 - TER PPh 21 & BPJS 2024)
 */

export interface PayrollInput {
  userId?: number;
  runType: 'Regular' | 'THR' | 'Bonus' | 'All';
  method: 'Gross' | 'Net';
  basicSalary: number;
  fixedAllowances: number;
  incentives: number;
  calculateThr?: boolean;
  dailyMealAllowance: number;
  dailyTransportAllowance: number;
  attendanceDays: number;
  workingDaysInMonth: number;
  overtimeHours: number;
  unpaidLeaveDays: number;
  ptkpStatus: "TK/0" | "TK/1" | "TK/2" | "TK/3" | "K/0" | "K/1" | "K/2" | "K/3";
}

/**
 * PPh 21 TER (Tarif Efektif Rata-rata) 2024
 * Berdasarkan PP No. 58 Tahun 2023
 */
const getTERRate = (status: string, bruto: number): number => {
  // 1. Tentukan Kategori TER
  let category: "A" | "B" | "C" = "A";
  
  if (["TK/0", "TK/1", "K/0"].includes(status)) category = "A";
  else if (["TK/2", "TK/3", "K/1", "K/2"].includes(status)) category = "B";
  else if (status === "K/3") category = "C";

  // 2. Ambil Persentase Berdasarkan Bruto Bulanan (Data diperingkas untuk akurasi tinggi)
  if (category === "A") {
    if (bruto <= 5400000) return 0;
    if (bruto <= 5650000) return 0.0025;
    if (bruto <= 5950000) return 0.005;
    if (bruto <= 6300000) return 0.0075;
    if (bruto <= 6750000) return 0.01;
    if (bruto <= 7500000) return 0.0125;
    if (bruto <= 8550000) return 0.015;
    if (bruto <= 9650000) return 0.0175;
    if (bruto <= 10650000) return 0.02;
    if (bruto <= 12250000) return 0.0225;
    if (bruto <= 14000000) return 0.025;
    if (bruto <= 16000000) return 0.03;
    if (bruto <= 19000000) return 0.04;
    if (bruto <= 23000000) return 0.05;
    if (bruto <= 27000000) return 0.06;
    if (bruto <= 31000000) return 0.07;
    if (bruto <= 35000000) return 0.08;
    if (bruto <= 40000000) return 0.09;
    return 0.10; // > 40jt
  }

  if (category === "B") {
    if (bruto <= 6200000) return 0;
    if (bruto <= 6500000) return 0.0025;
    if (bruto <= 6850000) return 0.005;
    if (bruto <= 7300000) return 0.0075;
    if (bruto <= 7850000) return 0.01;
    if (bruto <= 8900000) return 0.0125;
    if (bruto <= 9800000) return 0.015;
    if (bruto <= 11050000) return 0.0175;
    if (bruto <= 12300000) return 0.02;
    if (bruto <= 13850000) return 0.0225;
    if (bruto <= 15550000) return 0.025;
    if (bruto <= 18300000) return 0.03;
    if (bruto <= 21850000) return 0.04;
    if (bruto <= 26000000) return 0.05;
    if (bruto <= 30500000) return 0.06;
    if (bruto <= 36000000) return 0.07;
    if (bruto <= 41000000) return 0.08;
    if (bruto <= 47000000) return 0.09;
    return 0.10; // > 47jt
  }

  if (category === "C") {
    if (bruto <= 6600000) return 0;
    if (bruto <= 6950000) return 0.0025;
    if (bruto <= 7350000) return 0.005;
    if (bruto <= 7800000) return 0.0075;
    if (bruto <= 8350000) return 0.01;
    if (bruto <= 9450000) return 0.0125;
    if (bruto <= 10350000) return 0.015;
    if (bruto <= 11350000) return 0.0175;
    if (bruto <= 12700000) return 0.02;
    if (bruto <= 14200000) return 0.0225;
    if (bruto <= 16000000) return 0.025;
    if (bruto <= 18850000) return 0.03;
    if (bruto <= 22300000) return 0.04;
    if (bruto <= 26600000) return 0.05;
    if (bruto <= 31400000) return 0.06;
    if (bruto <= 37150000) return 0.07;
    if (bruto <= 42650000) return 0.08;
    if (bruto <= 49350000) return 0.09;
    return 0.10; // > 49jt
  }

  return 0;
};

export const calculatePayroll = (input: PayrollInput) => {
  const { 
    runType,
    method,
    basicSalary, 
    fixedAllowances, 
    incentives,
    dailyMealAllowance, 
    dailyTransportAllowance,
    attendanceDays,
    workingDaysInMonth, 
    unpaidLeaveDays, 
    overtimeHours, 
    ptkpStatus 
  } = input;

  // 1. Perhitungan Prorata (Hanya jika RunType = Regular atau All)
  const isRegularOrAll = runType === 'Regular' || runType === 'All';
  const unpaidLeaveDeduction = isRegularOrAll ? (unpaidLeaveDays / workingDaysInMonth) * basicSalary : 0;
  const proratedBasic = isRegularOrAll ? (basicSalary - unpaidLeaveDeduction) : 0;

  // 2. Perhitungan Tunjangan Tidak Tetap (Daily) - Hanya jika Regular/All
  const variableAllowances = isRegularOrAll ? (dailyMealAllowance + dailyTransportAllowance) * attendanceDays : 0;

  // 3. Perhitungan Lembur (Overtime) - Hanya jika Regular/All
  const overtimeRate = (1 / 173) * (basicSalary + fixedAllowances);
  const overtimePay = isRegularOrAll ? (overtimeHours * overtimeRate) : 0;

  // 4. THR & Bonus
  const thr = (runType === 'THR' || runType === 'All') ? basicSalary : 0;
  const bonus = (runType === 'Bonus') ? basicSalary : 0; // Simplified for simulation

  // 5. Gross Income (Penghasilan Bruto Bulanan)
  const grossIncome = proratedBasic + fixedAllowances + variableAllowances + overtimePay + incentives + thr + bonus;

  // 6. BPJS Calculation (Update 2024)
  const bpjsSalaryBase = basicSalary + fixedAllowances;
  const bpjsKesLimit = 12000000;
  const bpjsKesEmp = Math.min(bpjsSalaryBase, bpjsKesLimit) * 0.01;
  const bpjsKesComp = Math.min(bpjsSalaryBase, bpjsKesLimit) * 0.04;

  const jhtEmp = bpjsSalaryBase * 0.02;
  const jhtComp = bpjsSalaryBase * 0.037;
  
  const jpLimit = 10042300;
  const jpEmp = Math.min(bpjsSalaryBase, jpLimit) * 0.01;
  const jpComp = Math.min(bpjsSalaryBase, jpLimit) * 0.02;

  const jkkComp = bpjsSalaryBase * 0.0024;
  const jkmComp = bpjsSalaryBase * 0.003;

  // 7. BPJS Allowance (Hanya jika Method Net)
  let bpjsAllowance = 0;
  if (method === 'Net') {
    bpjsAllowance = bpjsKesEmp + jhtEmp + jpEmp;
  }

  // 8. PPh 21 Calculation & Gross-Up Logic
  let pph21Amount = 0;
  let taxAllowance = 0;

  const calculateTax = (currentGross: number, currentTaxAllowance: number, currentBpjsAllowance: number) => {
    const taxableBruto = currentGross + currentTaxAllowance + currentBpjsAllowance + bpjsKesComp + jkkComp + jkmComp;
    const terRate = getTERRate(ptkpStatus, taxableBruto);
    return taxableBruto * terRate;
  };

  if (method === 'Gross') {
    pph21Amount = calculateTax(grossIncome, 0, 0);
  } else {
    // Gross-Up Iteration (Metode Net)
    // Mencari taxAllowance sehingga taxAllowance == PPh21
    let allowance = 0;
    let prevAllowance = -1;
    let iterations = 0;
    
    while (Math.abs(allowance - prevAllowance) > 1 && iterations < 10) {
      prevAllowance = allowance;
      allowance = calculateTax(grossIncome, allowance, bpjsAllowance);
      iterations++;
    }
    taxAllowance = allowance;
    pph21Amount = allowance;
  }

  // 9. Net Salary Calculation (Take Home Pay)
  // THP = Gross Income + Tax Allowance + BPJS Allowance - PPh 21 - Employee BPJS
  // Jika Method Net, Tax Allowance == PPh 21 dan BPJS Allowance == Employee BPJS, maka THP == Gross Income
  const employeeDeductions = pph21Amount + bpjsKesEmp + jhtEmp + jpEmp;
  const netSalary = (grossIncome + taxAllowance + bpjsAllowance) - employeeDeductions;

  // 10. Company Cost
  const companyCost = grossIncome + taxAllowance + bpjsAllowance + bpjsKesComp + jhtComp + jpComp + jkkComp + jkmComp;

  return {
    breakdown: {
      proratedBasic,
      fixedAllowances,
      variableAllowances,
      incentives,
      unpaidLeaveDeduction,
      overtimePay,
      thr,
      bonus,
      taxAllowance,
      bpjsAllowance,
      grossIncome: grossIncome + taxAllowance + bpjsAllowance,
      pph21Amount,
      terRate: getTERRate(ptkpStatus, grossIncome + taxAllowance + bpjsAllowance + bpjsKesComp + jkkComp + jkmComp) * 100,
      bpjs: {
        health: { employee: bpjsKesEmp, company: bpjsKesComp },
        jht: { employee: jhtEmp, company: jhtComp },
        jp: { employee: jpEmp, company: jpComp },
        jkk: jkkComp,
        jkm: jkmComp
      }
    },
    netSalary,
    totalDeductions: employeeDeductions,
    totalCompanyCost: companyCost,
    run_type: runType,
    method: method
  };
};
