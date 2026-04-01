import Avatar from "../ui/Avatar";

export default function AttendanceRow() {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3 flex items-center gap-2">
        <Avatar src="https://i.pravatar.cc/40" />
        <span>Bagus Fikri</span>
      </td>

      <td>10:02 AM</td>
      <td>07:00 PM</td>
      <td>2h 12m</td>
    </tr>
  );
}
