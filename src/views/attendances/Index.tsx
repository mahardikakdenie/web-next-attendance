import AttendanceFilter from "@/components/attendance/AttendanceFilter";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import SummarySection from "@/components/attendance/SummarySection";

const AttendancesView: React.FC = () => {
    return <div>
      <h1 className="text-xl font-bold mb-4">Attendance</h1>

      <SummarySection />
      <AttendanceFilter />
      <AttendanceTable />
    </div>
};

export default AttendancesView;
