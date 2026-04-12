"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// --- TYPES ---
interface SlipBreakdown {
  grossIncome: number;
  pph21Amount: number;
  unpaidLeaveDeduction: number;
  bpjs: {
    health: { employee: number };
    jht: { employee: number };
  };
}

interface SelectedEmployeeSlip {
  id: number;
  name: string;
  role: string;
  ptkp: string;
  basic: number;
  allowance: number;
  unpaidLeave: number;
  netSalary: number;
  breakdown: SlipBreakdown;
}

interface Props {
  selectedPeriod: string;
  selectedEmployeeSlip: SelectedEmployeeSlip;
}

// --- STYLING ---
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  headerBanner: {
    backgroundColor: "#0f172a",
    padding: 24,
    borderRadius: 8,
    color: "#ffffff",
    marginBottom: 30,
  },
  confidentialTag: {
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#3b82f6",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "heavy",
    marginBottom: 4,
  },
  period: {
    fontSize: 10,
    color: "#94a3b8",
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 20,
  },
  employeeInfo: {
    flex: 1,
  },
  companyInfo: {
    flex: 1,
    textAlign: "right",
  },
  infoLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e293b",
  },
  gridContainer: {
    flexDirection: "row",
    gap: 40,
    marginBottom: 40,
  },
  column: {
    flex: 1,
  },
  columnTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 9,
  },
  rowLabel: {
    color: "#64748b",
  },
  rowValue: {
    color: "#0f172a",
    fontWeight: "medium",
  },
  deductionValue: {
    color: "#ef4444",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    fontSize: 10,
    fontWeight: "bold",
  },
  netSalaryCard: {
    backgroundColor: "#0f172a",
    padding: 24,
    borderRadius: 12,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  netLabel: {
    fontSize: 9,
    color: "#3b82f6",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  netValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  footer: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 8,
    color: "#94a3b8",
    lineHeight: 1.5,
  }
});

// --- DOCUMENT ---
export const PayslipPDFDocument = ({ selectedPeriod, selectedEmployeeSlip }: Props) => {
  const generationDate = new Date().toISOString().split('T')[0];
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBpjsEmployee =
    selectedEmployeeSlip.breakdown.bpjs.health.employee +
    selectedEmployeeSlip.breakdown.bpjs.jht.employee;

  const totalDeductions =
    selectedEmployeeSlip.breakdown.pph21Amount +
    totalBpjsEmployee +
    (selectedEmployeeSlip.unpaidLeave > 0
      ? selectedEmployeeSlip.breakdown.unpaidLeaveDeduction
      : 0);

  return (
    <Document title={`Payslip-${selectedEmployeeSlip.name}-${selectedPeriod}`}>
      <Page size="A4" style={styles.page}>
        
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <Text style={styles.confidentialTag}>Confidential Document</Text>
          <Text style={styles.title}>Salary Slip</Text>
          <Text style={styles.period}>Period: {selectedPeriod}</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.employeeInfo}>
            <Text style={styles.infoLabel}>Employee Name</Text>
            <Text style={styles.infoValue}>{selectedEmployeeSlip.name}</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.infoLabel}>Role / Position</Text>
              <Text style={styles.infoValue}>{selectedEmployeeSlip.role}</Text>
            </View>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.infoLabel}>Employer</Text>
            <Text style={styles.infoValue}>Attendance Pro</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.infoLabel}>Tax Status (PTKP)</Text>
              <Text style={styles.infoValue}>{selectedEmployeeSlip.ptkp}</Text>
            </View>
          </View>
        </View>

        {/* Content Grid */}
        <View style={styles.gridContainer}>
          {/* Earnings */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Earnings</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Basic Salary</Text>
              <Text style={styles.rowValue}>{formatCurrency(selectedEmployeeSlip.basic)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Fixed Allowances</Text>
              <Text style={styles.rowValue}>{formatCurrency(selectedEmployeeSlip.allowance)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Incentives</Text>
              <Text style={styles.rowValue}>{formatCurrency(0)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Gross Income</Text>
              <Text>{formatCurrency(selectedEmployeeSlip.breakdown.grossIncome)}</Text>
            </View>
          </View>

          {/* Deductions */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Deductions</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Income Tax (PPh 21)</Text>
              <Text style={[styles.rowValue, styles.deductionValue]}>-{formatCurrency(selectedEmployeeSlip.breakdown.pph21Amount)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>BPJS Social Security</Text>
              <Text style={[styles.rowValue, styles.deductionValue]}>-{formatCurrency(totalBpjsEmployee)}</Text>
            </View>
            {selectedEmployeeSlip.unpaidLeave > 0 && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Unpaid Leave ({selectedEmployeeSlip.unpaidLeave}d)</Text>
                <Text style={[styles.rowValue, styles.deductionValue]}>-{formatCurrency(selectedEmployeeSlip.breakdown.unpaidLeaveDeduction)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text>Total Deductions</Text>
              <Text style={styles.deductionValue}>-{formatCurrency(totalDeductions)}</Text>
            </View>
          </View>
        </View>

        {/* Net Salary Card */}
        <View style={styles.netSalaryCard}>
          <View>
            <Text style={styles.netLabel}>Total Take Home Pay</Text>
            <Text style={styles.netValue}>{formatCurrency(selectedEmployeeSlip.netSalary)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is an electronically generated document. No signature is required.</Text>
          <Text>Attendance Management System © 2026</Text>
          <Text style={{ marginTop: 10, color: "#cbd5e1" }}>Verification ID: {selectedEmployeeSlip.id}-{generationDate}</Text>
        </View>

      </Page>
    </Document>
  );
};
