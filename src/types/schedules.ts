export type ShiftType = "Office" | "Morning" | "Afternoon" | "Night" | "Flexible";

export interface WorkShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  color: string;
  isDefault: boolean;
}

export interface EmployeeSchedule {
  id: number;
  name: string;
  avatar: string;
  department: string;
  weeklyRoster: {
    monday: string; // Shift ID
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}
