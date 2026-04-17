/**
 * PAYROLL CALCULATION ENGINE (Stateless)
 * Berdasarkan Regulasi Indonesia Terbaru (PP 58/2023 - TER PPh 21 & BPJS 2024)
 */

export interface PayrollInput {
  basicSalary: number;
  fixedAllowances: number;
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
    basicSalary, 
    fixedAllowances, 
    dailyMealAllowance, 
    dailyTransportAllowance,
    attendanceDays,
    workingDaysInMonth, 
    unpaidLeaveDays, 
    overtimeHours, 
    ptkpStatus 
  } = input;

  // 1. Perhitungan Prorata (Jika ada unpaid leave)
  // Perhitungan pengurang gaji akibat ketidakhadiran
  const unpaidLeaveDeduction = (unpaidLeaveDays / workingDaysInMonth) * basicSalary;
  const proratedBasic = basicSalary - unpaidLeaveDeduction;

  // 2. Perhitungan Tunjangan Tidak Tetap (Daily)
  const variableAllowances = (dailyMealAllowance + dailyTransportAllowance) * attendanceDays;

  // 3. Perhitungan Lembur (Overtime) - Sesuai Depnaker
  // Rumus: (1/173) * (Gaji Pokok + Tunjangan Tetap) * jam lembur
  const overtimeRate = (1 / 173) * (basicSalary + fixedAllowances);
  const overtimePay = overtimeHours * overtimeRate;

  // 4. Gross Income (Penghasilan Bruto Bulanan)
  const grossIncome = proratedBasic + fixedAllowances + variableAllowances + overtimePay;

  // 5. BPJS Calculation (Update 2024)
  // BPJS Kesehatan: 4% Perusahaan, 1% Karyawan (Max Salary Cap IDR 12jt)
  const bpjsKesLimit = 12000000;
  const bpjsKesEmp = Math.min(basicSalary + fixedAllowances, bpjsKesLimit) * 0.01;
  const bpjsKesComp = Math.min(basicSalary + fixedAllowances, bpjsKesLimit) * 0.04;

  // BPJS Ketenagakerjaan
  // JHT: 2% Karyawan, 3.7% Perusahaan
  const jhtEmp = (basicSalary + fixedAllowances) * 0.02;
  const jhtComp = (basicSalary + fixedAllowances) * 0.037;
  
  // JP (Jaminan Pensiun): 1% Karyawan, 2% Perusahaan (Max Salary Cap IDR 10.042.300 - 2024)
  const jpLimit = 10042300;
  const jpEmp = Math.min(basicSalary + fixedAllowances, jpLimit) * 0.01;
  const jpComp = Math.min(basicSalary + fixedAllowances, jpLimit) * 0.02;

  // JKK & JKM (Ditanggung Perusahaan sepenuhnya)
  const jkkComp = (basicSalary + fixedAllowances) * 0.0024; // Contoh tarif terendah 0.24%
  const jkmComp = (basicSalary + fixedAllowances) * 0.003;  // 0.3%

  // 6. PPh 21 TER (Tarif Efektif Rata-rata 2024)
  // Dasar pengenaan TER adalah Bruto (Gaji + Tunjangan + Premi BPJS dibayar pemberi kerja)
  const taxableBruto = grossIncome + bpjsKesComp + jkkComp + jkmComp;
  const terRate = getTERRate(ptkpStatus, taxableBruto);
  const pph21Amount = taxableBruto * terRate;

  // 7. Net Salary Calculation (Take Home Pay)
  // Potongan Karyawan: PPh 21 + BPJS Kes + JHT + JP
  const employeeDeductions = pph21Amount + bpjsKesEmp + jhtEmp + jpEmp;
  const netSalary = grossIncome - employeeDeductions;

  // 8. Company Cost (Total beban gaji bagi perusahaan)
  const companyCost = grossIncome + bpjsKesComp + jhtComp + jpComp + jkkComp + jkmComp;

  return {
    breakdown: {
      proratedBasic,
      fixedAllowances,
      variableAllowances,
      unpaidLeaveDeduction,
      overtimePay,
      grossIncome,
      pph21Amount,
      terRate: terRate * 100, // percentage for UI
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
    totalCompanyCost: companyCost
  };
};
