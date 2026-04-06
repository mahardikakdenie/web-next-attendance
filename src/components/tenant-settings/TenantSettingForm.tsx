import FormField from "@/components/forms/FormField";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";

const mockTenantSetting = {
  tenantId: 1,
  officeLatitude: -6.1339179,
  officeLongitude: 106.8329504,
  maxRadiusMeter: 100,
  allowRemote: false,
  requireLocation: true,
  clockInStartTime: "07:00",
  clockInEndTime: "09:00",
  lateAfterMinute: 480,
  clockOutStartTime: "16:00",
  clockOutEndTime: "23:00",
  requireSelfie: true,
  allowMultipleCheck: false,
};

export default function TenantSettingForm() {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">Tenant Attendance Setting</h2>
        <p className="mt-1 text-sm text-slate-500">UI follows backend struct TenantSetting. All controls are read-only until API ready.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Tenant ID" name="tenant_id" type="number" value={mockTenantSetting.tenantId} disabled />
        <FormField label="Max Radius (meter)" name="max_radius_meter" type="number" value={mockTenantSetting.maxRadiusMeter} />
        <FormField label="Office Latitude" name="office_latitude" value={mockTenantSetting.officeLatitude} />
        <FormField label="Office Longitude" name="office_longitude" value={mockTenantSetting.officeLongitude} />
        <FormField label="Clock-in Start Time" name="clock_in_start_time" value={mockTenantSetting.clockInStartTime} />
        <FormField label="Clock-in End Time" name="clock_in_end_time" value={mockTenantSetting.clockInEndTime} />
        <FormField label="Late After Minute" name="late_after_minute" type="number" value={mockTenantSetting.lateAfterMinute} />
        <FormField label="Clock-out Start Time" name="clock_out_start_time" value={mockTenantSetting.clockOutStartTime} />
        <FormField label="Clock-out End Time" name="clock_out_end_time" value={mockTenantSetting.clockOutEndTime} />
      </div>

      <div className="mt-5 grid gap-3">
        <Switch checked={mockTenantSetting.allowRemote} label="Allow Remote" description="Enable attendance outside office location." />
        <Switch checked={mockTenantSetting.requireLocation} label="Require Location" description="User must send geolocation when check-in/out." />
        <Switch checked={mockTenantSetting.requireSelfie} label="Require Selfie" description="Selfie photo mandatory for attendance proof." />
        <Switch checked={mockTenantSetting.allowMultipleCheck} label="Allow Multiple Check" description="Allow multiple check-in/out records in one day." />
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="button" className="cursor-not-allowed opacity-80">
          Save Changes (Disabled - API Not Ready)
        </Button>
        <Button type="button" className="bg-slate-200 text-slate-700 hover:bg-slate-300">
          Reset
        </Button>
      </div>
    </Card>
  );
}
