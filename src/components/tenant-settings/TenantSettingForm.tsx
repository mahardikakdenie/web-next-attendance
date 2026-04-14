"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  MapPin,
  Clock,
  ShieldCheck,
  Globe,
  Save,
  Zap,
  Navigation,
  Camera,
  Layers,
  Search,
  CheckCircle2,
} from "lucide-react";
import Input from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import CustomTimeSelector from "../ui/CustomTimeSelector";
import { Button } from "../ui/Button";
import { getDataCurrentTenat, updateDataCurrentTenant } from "@/service/tenantSettings";
import Image from "next/image";
import { toast } from "sonner";

export interface TenantSettingsData {
  id: number;
  tenantId: number;
  tenantLogo?: string;
  officeLatitude: number | string;
  officeLongitude: number | string;
  maxRadiusMeter: number | string;
  allowRemote: boolean;
  requireLocation: boolean;
  clockInStartTime: string;
  clockInEndTime: string;
  lateAfterMinute: number | string;
  clockOutStartTime: string;
  clockOutEndTime: string;
  requireSelfie: boolean;
  allowMultipleCheck: boolean;
  created_at: string;
  updated_at: string;
  tenant: {
    code: string;
    createdAt: string;
    id: number;
    name: string;
    tenant_settings: string;
    updatedAt: string;
  };
}

interface TenantApiData {
  id: number;
  tenant_id: number;
  tenant_logo?: string;
  office_latitude: number;
  office_longitude: number;
  max_radius_meter: number;
  allow_remote: boolean;
  require_location: boolean;
  clock_in_start_time: string;
  clock_in_end_time: string;
  late_after_minute: number;
  clock_out_start_time: string;
  clock_out_end_time: string;
  require_selfie: boolean;
  allow_multiple_check: boolean;
  created_at: string;
  updated_at: string;
  tenant?: {
    ID?: number;
    id?: number;
    Name?: string;
    name?: string;
    Code?: string;
    code?: string;
    CreatedAt?: string;
    createdAt?: string;
    UpdatedAt?: string;
    updatedAt?: string;
    tenant_settings?: string;
  };
}

export interface ApiResponse {
  meta: {
    message: string;
    code: number;
    status: string;
  };
  data: TenantApiData;
}

const INITIAL_DATA: TenantSettingsData = {
  id: 1,
  tenantId: 1,
  tenantLogo: "",
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
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tenant: {
    code: "string",
    createdAt: new Date().toISOString(),
    id: 0,
    name: "string",
    tenant_settings: "string",
    updatedAt: new Date().toISOString()
  }
};

export default function TenantSettingForm() {
  const [formData, setFormData] = useState<TenantSettingsData>(INITIAL_DATA);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessLocation, setShowSuccessLocation] = useState(false);

  const handleSwitchChange = (name: keyof TenantSettingsData, checked: boolean): void => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (name: keyof TenantSettingsData, value: string | number): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const triggerSuccessFeedback = () => {
    setShowSuccessLocation(true);
    setTimeout(() => setShowSuccessLocation(false), 3000);
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleInputChange('officeLatitude', position.coords.latitude.toFixed(7));
          handleInputChange('officeLongitude', position.coords.longitude.toFixed(7));
          setIsLocating(false);
          triggerSuccessFeedback();
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSmartInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    const gmapsMatch = val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (gmapsMatch) {
      handleInputChange('officeLatitude', gmapsMatch[1]);
      handleInputChange('officeLongitude', gmapsMatch[2]);
      triggerSuccessFeedback();
      setSearchQuery("");
      return;
    }

    if (val.includes(",")) {
      const parts = val.split(",");
      const lat = parts[0].replace(/[^\d.-]/g, '').trim();
      const lng = parts[1].replace(/[^\d.-]/g, '').trim();

      if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
        handleInputChange('officeLatitude', lat);
        handleInputChange('officeLongitude', lng);
        triggerSuccessFeedback();
      }
    }
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        handleInputChange('officeLatitude', parseFloat(data[0].lat).toFixed(7));
        handleInputChange('officeLongitude', parseFloat(data[0].lon).toFixed(7));
        triggerSuccessFeedback();
        setSearchQuery("");
      } else {
        toast.error("Location not found. Please try a more specific address.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to search location. Please check your connection.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const resp = (await getDataCurrentTenat()) as ApiResponse;
        
        if (resp && resp.data) {
          const apiData = resp.data;
          setFormData({
            id: apiData.id,
            tenantId: apiData.tenant_id,
            tenantLogo: apiData.tenant_logo,
            officeLatitude: apiData.office_latitude,
            officeLongitude: apiData.office_longitude,
            maxRadiusMeter: apiData.max_radius_meter,
            allowRemote: apiData.allow_remote,
            requireLocation: apiData.require_location,
            clockInStartTime: apiData.clock_in_start_time,
            clockInEndTime: apiData.clock_in_end_time,
            lateAfterMinute: apiData.late_after_minute,
            clockOutStartTime: apiData.clock_out_start_time,
            clockOutEndTime: apiData.clock_out_end_time,
            requireSelfie: apiData.require_selfie,
            allowMultipleCheck: apiData.allow_multiple_check,
            created_at: apiData.created_at,
            updated_at: apiData.updated_at,
            tenant: {
              code: apiData.tenant?.Code || apiData.tenant?.code || "string",
              createdAt: apiData.tenant?.CreatedAt || apiData.tenant?.createdAt || new Date().toISOString(),
              id: apiData.tenant?.ID || apiData.tenant?.id || 0,
              name: apiData.tenant?.Name || apiData.tenant?.name || "string",
              tenant_settings: apiData.tenant?.tenant_settings || "string",
              updatedAt: apiData.tenant?.UpdatedAt || apiData.tenant?.updatedAt || new Date().toISOString()
            }
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    getData();
  }, []);

  const onHandleChange = async () => {
    setIsSaving(true);
    try {
      const payload = {
        allow_multiple_check: Boolean(formData.allowMultipleCheck),
        allow_remote: Boolean(formData.allowRemote),
        tenant_logo: formData.tenantLogo,
        clock_in_end_time: String(formData.clockInEndTime),
        clock_in_start_time: String(formData.clockInStartTime),
        clock_out_end_time: String(formData.clockOutEndTime),
        clock_out_start_time: String(formData.clockOutStartTime),
        created_at: String(formData.created_at),
        id: Number(formData.id),
        late_after_minute: Number(formData.lateAfterMinute),
        max_radius_meter: Number(formData.maxRadiusMeter),
        office_latitude: Number(formData.officeLatitude),
        office_longitude: Number(formData.officeLongitude),
        require_location: Boolean(formData.requireLocation),
        require_selfie: Boolean(formData.requireSelfie),
        tenant_id: Number(formData.tenantId),
        updated_at: new Date().toISOString()
      };

      await updateDataCurrentTenant(payload);
      toast.success("Configuration updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update configuration. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">System Settings</h1>
        <p className="text-sm font-medium text-neutral-500 mt-1">Configure your workspace attendance rules and parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-8">
          
          <div className="bg-white rounded-[28px] border border-neutral-200/60 p-7 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                  <Settings size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Basic Rules</h2>
                  <p className="text-xs font-medium text-neutral-500 mt-0.5">Tolerance & limits</p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-bold text-neutral-600 uppercase tracking-widest">
                ID: {formData.tenantId}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-500">Max Radius (Meters)</label>
                <div className="flex items-center gap-3">
                  <Zap size={18} className="text-amber-500 shrink-0" />
                  <Input
                    type="number"
                    value={formData.maxRadiusMeter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('maxRadiusMeter', e.target.value)}
                    className="bg-transparent border-none px-0 h-8 text-xl font-black text-neutral-800 w-full focus:ring-0 shadow-none"
                  />
                </div>
              </div>

              <div className="group flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-500">Grace Period (Mins)</label>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-rose-500 shrink-0" />
                  <Input
                    type="number"
                    value={formData.lateAfterMinute}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lateAfterMinute', e.target.value)}
                    className="bg-transparent border-none px-0 h-8 text-xl font-black text-neutral-800 w-full focus:ring-0 shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-neutral-200/60 p-7 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                <MapPin size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Office Coordinates</h2>
                <p className="text-xs font-medium text-neutral-500 mt-0.5">Center point for attendance</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="w-full h-60 bg-neutral-100 rounded-[20px] overflow-hidden border border-neutral-200 relative group">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${formData.officeLatitude},${formData.officeLongitude}&z=16&output=embed`}
                ></iframe>
                {showSuccessLocation && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl animate-in slide-in-from-top-4 fade-in duration-300">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Location Updated
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <Input
                    placeholder="Search address or paste maps URL..."
                    value={searchQuery}
                    onChange={handleSmartInput}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
                    className="bg-neutral-50/80 border-neutral-200 h-12 rounded-xl text-sm pl-11 w-full focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={2.5} />
                </div>
                <Button
                  type="button"
                  onClick={handleSearchAddress}
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-12 px-5 bg-neutral-900 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {isSearching ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : 'Find'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Latitude</label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.officeLatitude}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('officeLatitude', e.target.value)}
                    className="bg-white border-neutral-200 h-9 rounded-lg font-mono text-xs w-full shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Longitude</label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.officeLongitude}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('officeLongitude', e.target.value)}
                    className="bg-white border-neutral-200 h-9 rounded-lg font-mono text-xs w-full shadow-sm"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold transition-all"
              >
                {isLocating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-700"></div>
                ) : (
                  <Navigation size={18} />
                )}
                <span>Auto-Detect Current Location</span>
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-8">
          
          <div className="bg-white rounded-[28px] border border-neutral-200/60 p-7 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                <Clock size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Working Schedule</h2>
                <p className="text-xs font-medium text-neutral-500 mt-0.5">Define operational hours</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Clock size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest">Clock-In</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <CustomTimeSelector
                    label="Start"
                    value={formData.clockInStartTime}
                    onChange={(val) => handleInputChange('clockInStartTime', val)}
                    hoverBorderClass="hover:border-emerald-300 focus-within:border-emerald-400 bg-white shadow-sm rounded-lg"
                  />
                  <CustomTimeSelector
                    label="End"
                    value={formData.clockInEndTime}
                    onChange={(val) => handleInputChange('clockInEndTime', val)}
                    hoverBorderClass="hover:border-emerald-300 focus-within:border-emerald-400 bg-white shadow-sm rounded-lg"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Clock size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest">Clock-Out</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <CustomTimeSelector
                    label="Start"
                    value={formData.clockOutStartTime}
                    onChange={(val) => handleInputChange('clockOutStartTime', val)}
                    hoverBorderClass="hover:border-orange-300 focus-within:border-orange-400 bg-white shadow-sm rounded-lg"
                  />
                  <CustomTimeSelector
                    label="End"
                    value={formData.clockOutEndTime}
                    onChange={(val) => handleInputChange('clockOutEndTime', val)}
                    hoverBorderClass="hover:border-orange-300 focus-within:border-orange-400 bg-white shadow-sm rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-neutral-200/60 p-7 shadow-sm transition-all hover:shadow-md flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                <Globe size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Tenant Branding</h2>
                <p className="text-xs font-medium text-neutral-500 mt-0.5">Company identity settings</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-100">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Logo URL</label>
               <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm">
                    {formData.tenantLogo ? (
                      <Image src={formData.tenantLogo} fill alt="Tenant Logo" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Camera size={24} />
                      </div>
                    )}
                  </div>
                  <Input 
                    placeholder="https://example.com/logo.png"
                    value={formData.tenantLogo || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tenantLogo', e.target.value)}
                    className="flex-1 h-12 bg-white border-slate-200 rounded-xl text-sm"
                  />
               </div>
            </div>

            <div className="flex items-center gap-4 mb-6 pt-2 border-t border-slate-100">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner">
                <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Security & Rules</h2>
                <p className="text-xs font-medium text-neutral-500 mt-0.5">Toggle validation methods</p>
              </div>
            </div>

            <div className="flex flex-col border border-neutral-100 rounded-2xl overflow-hidden bg-neutral-50/50">
              <div className="p-4 flex items-center justify-between border-b border-neutral-100 hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Globe size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-800">Remote Work</span>
                    <span className="text-[11px] text-neutral-500 font-medium">Allow WFA attendance</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.allowRemote}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('allowRemote', e.target.checked)}
                />
              </div>

              <div className="p-4 flex items-center justify-between border-b border-neutral-100 hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Navigation size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-800">Geolocation</span>
                    <span className="text-[11px] text-neutral-500 font-medium">Force GPS verification</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.requireLocation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('requireLocation', e.target.checked)}
                />
              </div>

              <div className="p-4 flex items-center justify-between border-b border-neutral-100 hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Camera size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-800">Face Photo</span>
                    <span className="text-[11px] text-neutral-500 font-medium">Mandatory selfie proof</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.requireSelfie}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('requireSelfie', e.target.checked)}
                />
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Layers size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-800">Multiple Logs</span>
                    <span className="text-[11px] text-neutral-500 font-medium">Allow multiple checks</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.allowMultipleCheck}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('allowMultipleCheck', e.target.checked)}
                />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-100">
              <Button 
                onClick={onHandleChange} 
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 h-14 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-base font-bold transition-all disabled:opacity-70 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={20} strokeWidth={2.5} />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
