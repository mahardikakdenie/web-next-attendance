import { LucideIcon } from "lucide-react";
import type { ApexOptions } from "apexcharts";

/**
 * HR Performance Analytics Types
 */

export type PerformanceStatus = "Excellent" | "Good" | "At Risk";

export interface EmployeePerformance {
  id: number;
  name: string;
  avatar: string;
  department: string;
  score: number;
  totalLate: number;
  avgClockIn: string;
  status: PerformanceStatus;
  overtimeHours: number;
  leaveBalance: number;
}

export type AnalyticsMetric = "attendance" | "overtime" | "leave";

export interface ContextModalState {
  isOpen: boolean;
  title: string;
  description: string;
  employees: EmployeePerformance[];
}

/**
 * Helper interface for ApexCharts series objects
 */
export interface ApexSeriesObject {
  name?: string;
  data: number[] | { x: unknown; y: unknown }[] | [number, number][] | [number, number[]][];
}

/**
 * Custom types to access internal ApexCharts properties safely
 * while maintaining compatibility with official event signatures.
 */
export interface InternalChartState {
  globals: {
    labels: string[];
    series: number[][];
    seriesNames: string[];
  };
  config: ApexOptions;
}

export interface ChartTooltipContext {
  series: number[][];
  seriesIndex: number;
  dataPointIndex: number;
  w: InternalChartState;
}

export interface StatItem {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  shadow: string;
}
