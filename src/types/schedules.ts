export type ShiftType = "Morning" | "Afternoon" | "Night" | "Office" | "Flexible";

export interface WorkShift {
  id: string;
  name: string;
  startTime: string; // Format: HH:mm
  endTime: string;   // Format: HH:mm
  type: ShiftType;
  color: string;     // CSS Class like "bg-emerald-500"
  isDefault: boolean;
}

export interface EmployeeSchedule {
  id: number;
  name: string;
  avatar: string;
  department: string;
  weeklyRoster: {
    monday: string; // Shift ID or "off"
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}
