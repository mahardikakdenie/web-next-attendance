/* eslint-disable jsx-a11y/alt-text */
"use client";

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { PayrollCalculationResult } from '@/types/api';

const styles = StyleSheet.create({
  page: {
    padding: 40, 
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#0f172a', // slate-900
    backgroundColor: '#ffffff',
  },
  // LIGHT HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: 'column',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  logoContainer: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 40,
    objectFit: 'contain',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 8,
    color: '#64748b', // slate-500
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rightLabel: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rightValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statusBadge: {
    marginTop: 4,
    backgroundColor: '#eef2ff', // indigo-50
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#4f46e5', // indigo-600
    textTransform: 'uppercase',
  },

  // TWO COLUMN SPLIT
  columns: {
    flexDirection: 'row',
    gap: 40,
    position: 'relative',
  },
  verticalDivider: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
    borderLeftStyle: 'dashed',
    transform: 'translateX(-0.5px)',
  },
  column: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowLabelContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  rowLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#334155', // slate-700
  },
  rowLabelSub: {
    fontSize: 7,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  rowValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  deductionValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#e11d48', // rose-600
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    borderBottomStyle: 'dashed',
    marginVertical: 10,
  },

  // TOTAL BOX (Light Theme)
  totalBox: {
    marginTop: 30,
    backgroundColor: '#f8fafc', // slate-50
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  totalLabelArea: {
    flexDirection: 'column',
    gap: 4,
  },
  totalLabel: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  totalSublabel: {
    color: '#64748b',
    fontSize: 8,
    fontStyle: 'italic',
  },
  totalValue: {
    color: '#4f46e5', // indigo-600
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },

  footer: {
    marginTop: 40,
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
});

interface Props {
  data: PayrollCalculationResult;
  companyName: string;
  logo?: string;
  ptkp: string;
  period: string;
  employeeName?: string;
  employeeRole?: string;
}

export const PayslipPDFDocument = ({ data, companyName, logo, ptkp, period, employeeName, employeeRole }: Props) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBpjs = (data?.breakdown?.bpjs?.health?.employee || 0) + 
                    (data?.breakdown?.bpjs?.jht?.employee || 0) + 
                    (data?.breakdown?.bpjs?.jp?.employee || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
             <View style={styles.logoContainer}>
              {logo && <Image src={logo} style={styles.logo} />}
              <Text style={styles.companyName}>{companyName}</Text>
             </View>
             <Text style={styles.headerSubtitle}>Official Monthly Earnings Statement</Text>
          </View>
          
          <View style={styles.headerRight}>
             <Text style={styles.rightLabel}>Employee Info</Text>
             <Text style={styles.rightValue}>{employeeName || 'N/A'}</Text>
             <Text style={[styles.rightValue, { fontSize: 8, color: '#64748b' }]}>{employeeRole || 'Personnel'}</Text>
             <View style={styles.statusBadge}>
                <Text style={styles.statusText}>STATUS: {ptkp} • PERIOD: {period}</Text>
             </View>
          </View>
        </View>

        {/* Two Column Breakdown */}
        <View style={styles.columns}>
          <View style={styles.verticalDivider} />

          {/* Left: Earnings */}
          <View style={styles.column}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Earnings</Text>
            </View>
            
            <View style={styles.row}>
              <View style={styles.rowLabelContainer}>
                <Text style={styles.rowLabel}>Basic Salary</Text>
                <Text style={styles.rowLabelSub}>Prorated for attendance</Text>
              </View>
              <Text style={styles.rowValue}>{formatCurrency(data?.breakdown?.proratedBasic || 0)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Allowances (Fixed)</Text>
              <Text style={styles.rowValue}>{formatCurrency(data?.breakdown?.fixedAllowances || 0)}</Text>
            </View>

            {data?.breakdown?.variableAllowances > 0 && (
              <View style={styles.row}>
                <View style={styles.rowLabelContainer}>
                  <Text style={styles.rowLabel}>Allowances (Daily)</Text>
                  <Text style={styles.rowLabelSub}>Meal & Transport</Text>
                </View>
                <Text style={styles.rowValue}>{formatCurrency(data?.breakdown?.variableAllowances)}</Text>
              </View>
            )}

            {data?.breakdown?.overtimePay > 0 && (
               <View style={styles.row}>
                <View style={styles.rowLabelContainer}>
                  <Text style={styles.rowLabel}>Overtime Pay</Text>
                  <Text style={styles.rowLabelSub}>Calculated from OT hours</Text>
                </View>
                <Text style={styles.rowValue}>{formatCurrency(data?.breakdown?.overtimePay)}</Text>
              </View>
            )}

            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={[styles.rowValue, { color: '#64748b' }]}>Gross Income</Text>
              <Text style={styles.rowValue}>{formatCurrency(data?.grossIncome || 0)}</Text>
            </View>
          </View>

          {/* Right: Deductions */}
          <View style={styles.column}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Deductions</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.rowLabelContainer}>
                <Text style={styles.rowLabel}>Income Tax (PPh 21)</Text>
                <Text style={styles.rowLabelSub}>TER Scheme {data?.breakdown?.terRate?.toFixed(2) || "0.00"}%</Text>
              </View>
              <Text style={styles.deductionValue}>-{formatCurrency(data?.pph21Amount || 0)}</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.rowLabelContainer}>
                <Text style={styles.rowLabel}>BPJS Social Security</Text>
                <Text style={styles.rowLabelSub}>JHT, JP & Health Share</Text>
              </View>
              <Text style={styles.deductionValue}>-{formatCurrency(totalBpjs)}</Text>
            </View>

            {data?.breakdown?.unpaidLeaveDeduction > 0 && (
              <View style={styles.row}>
                <View style={styles.rowLabelContainer}>
                  <Text style={styles.rowLabel}>Unpaid Leave</Text>
                  <Text style={styles.rowLabelSub}>Attendance adjustment</Text>
                </View>
                <Text style={styles.deductionValue}>-{formatCurrency(data?.breakdown?.unpaidLeaveDeduction)}</Text>
              </View>
            )}

            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={[styles.rowValue, { color: '#64748b' }]}>Total Deductions</Text>
              <Text style={styles.deductionValue}>-{formatCurrency(data?.totalDeductions || 0)}</Text>
            </View>
          </View>
        </View>

        {/* Take Home Pay Box */}
        <View style={styles.totalBox}>
          <View style={styles.totalLabelArea}>
            <Text style={styles.totalLabel}>Net Take Home Pay</Text>
            <Text style={styles.totalSublabel}>Transferred to registered account</Text>
          </View>
          <Text style={styles.totalValue}>{formatCurrency(data?.netSalary || 0)}</Text>
        </View>

        <Text style={styles.footer}>Computer Generated Document • Confidential</Text>
      </Page>
    </Document>
  );
};
