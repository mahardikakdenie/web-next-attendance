"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Upload,
  Link as LinkIcon,
  Loader2,
  HelpCircle,
} from "lucide-react";
import Input from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import CustomTimeSelector from "../ui/CustomTimeSelector";
import { Button } from "../ui/Button";
import { getDataCurrentTenat, updateDataCurrentTenant } from "@/service/tenantSettings";
import { uploadMedia } from "@/service/media";
import Image from "next/image";
import { toast } from "sonner";
import { UserData } from "@/types/api";
import { Tooltip } from "@/components/ui/Tooltip";

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

export default function TenantSettingForm({ user }: { user: UserData | null }) {
  // Map user data to form structure if available
  const userMappedData: TenantSettingsData | null = useMemo(() => {
    if (!user || !user.tenant_setting) return null;
    const ts = user.tenant_setting;
    return {
      id: ts.id,
      tenantId: ts.tenant_id,
      tenantLogo: ts.tenant_logo || "",
      officeLatitude: ts.office_latitude,
      officeLongitude: ts.office_longitude,
      maxRadiusMeter: ts.max_radius_meter,
      allowRemote: ts.allow_remote,
      requireLocation: ts.require_location,
      clockInStartTime: ts.clock_in_start_time,
      clockInEndTime: ts.clock_in_end_time,
      lateAfterMinute: ts.late_after_minute,
      clockOutStartTime: ts.clock_out_start_time,
      clockOutEndTime: ts.clock_out_end_time,
      requireSelfie: ts.require_selfie,
      allowMultipleCheck: ts.allow_multiple_check,
      created_at: ts.created_at,
      updated_at: ts.updated_at,
      tenant: {
        code: ts.tenant?.code || "string",
        createdAt: ts.tenant?.createdAt || ts.created_at,
        id: ts.tenant?.id || user.tenant_id,
        name: ts.tenant?.name || user.tenant?.name || "string",
        tenant_settings: ts.tenant?.tenant_settings || "string",
        updatedAt: ts.tenant?.updatedAt || ts.updated_at
      }
    };
  }, [user]);

  const [initialData, setInitialData] = useState<TenantSettingsData>(userMappedData || INITIAL_DATA);
  const [formData, setFormData] = useState<TenantSettingsData>(userMappedData || INITIAL_DATA);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoMode, setLogoMode] = useState<"link" | "upload">("link");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessLocation, setShowSuccessLocation] = useState(false);

  // Adjust state when user data changes (React official recommendation for prop-to-state sync)
  const [prevUserMappedData, setPrevUserMappedData] = useState(userMappedData);
  if (userMappedData !== prevUserMappedData) {
    setPrevUserMappedData(userMappedData);
    if (userMappedData) {
      setInitialData(userMappedData);
      setFormData(userMappedData);
    }
  }

  const isDirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(initialData), [formData, initialData]);

  const handleSwitchChange = useCallback((name: keyof TenantSettingsData, checked: boolean): void => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  }, []);

  const handleInputChange = useCallback((name: keyof TenantSettingsData, value: string | number): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const url = await uploadMedia(file);
      handleInputChange("tenantLogo", url);
      toast.success("Logo uploaded successfully!");
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload logo.";
      toast.error(errorMessage);
    } finally {
      setIsUploadingLogo(false);
    }
  }, [handleInputChange]);

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
          const mappedData = {
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
          };
          setFormData(mappedData);
          setInitialData(mappedData);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getData();
  }, []);

  const onHandleChange = useCallback(async () => {
    if (!isDirty && !isSaving) {
      toast.info("No changes to save.");
      return;
    }
    
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
      setInitialData(formData);
      toast.success("Configuration updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update configuration. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [formData, isDirty, isSaving]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onHandleChange();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onHandleChange]);


  const handleReset = () => {
    setFormData(initialData);
    toast.info("Changes discarded.");
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-32 relative">
      {/* MAIN HEADER INTEGRATED */}
      <header className="flex flex-col gap-6 mb-12 lg:flex-row lg:items-end lg:justify-between animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Settings size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">ADMINISTRATION SYSTEM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight uppercase">
            TENANT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">SETTINGS</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 font-medium max-w-2xl leading-relaxed uppercase tracking-tighter opacity-70">
            Configure attendance rules, operational hours, and organizational security policies.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 self-start lg:self-end">
          {/* Access Level Badge */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <ShieldCheck size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-neutral-400 uppercase leading-none tracking-tight">ACCESS LEVEL</span>
              <span className="text-sm font-bold text-neutral-900 uppercase tracking-tighter">{user?.role?.name.toLowerCase() || 'ADMIN'}</span>
            </div>
          </div>

          {/* Header Save Action */}
          <Button 
            onClick={onHandleChange} 
            disabled={isSaving || !isDirty}
            className={`h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-2 active:scale-95 ${
              isDirty 
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200" 
              : "bg-neutral-100 text-neutral-400 shadow-none cursor-default"
            }`}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isSaving ? "SYNCING..." : isDirty ? "SAVE CONFIGURATION" : "UP TO DATE"}</span>
          </Button>
        </div>
      </header>

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
                  <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">BASIC RULES</h2>
                  <p className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-widest">TOLERANCE & LIMITS</p>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-black text-neutral-600 uppercase tracking-widest">
                ID: {formData.tenantId}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group flex flex-col gap-2 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
                <div className="flex items-center gap-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-500">MAX RADIUS</label>
                   <Tooltip content="MAXIMUM DISTANCE (METERS) ALLOWED FROM OFFICE CENTER.">
                      <HelpCircle size={10} className="text-neutral-300" />
                   </Tooltip>
                </div>
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
                <div className="flex items-center gap-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-focus-within:text-blue-500">GRACE PERIOD</label>
                   <Tooltip content="MINUTES ALLOWED AFTER START TIME BEFORE MARKED AS LATE.">
                      <HelpCircle size={10} className="text-neutral-300" />
                   </Tooltip>
                </div>
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
                <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">OFFICE GEOLOCATION</h2>
                <p className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-widest">CENTER POINT FOR ATTENDANCE</p>
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
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-xl animate-in slide-in-from-top-4 fade-in duration-300 uppercase tracking-widest">
                    <CheckCircle2 size={14} className="text-emerald-400" /> COORDINATES UPDATED
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <Input
                    placeholder="SEARCH ADDRESS OR PASTE GOOGLE MAPS URL..."
                    value={searchQuery}
                    onChange={handleSmartInput}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
                    className="bg-neutral-50/80 border-neutral-200 h-12 rounded-xl text-xs pl-11 w-full focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all font-black uppercase placeholder:text-neutral-300"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={2.5} />
                </div>
                <Button
                  type="button"
                  onClick={handleSearchAddress}
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-12 px-5 bg-neutral-900 hover:bg-indigo-600 text-white rounded-xl font-black transition-all disabled:opacity-50 uppercase text-[10px] tracking-widest"
                >
                  {isSearching ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : 'FIND'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">LATITUDE</label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.officeLatitude}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('officeLatitude', e.target.value)}
                    className="bg-white border-neutral-200 h-9 rounded-lg font-mono text-[10px] font-bold w-full shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">LONGITUDE</label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.officeLongitude}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('officeLongitude', e.target.value)}
                    className="bg-white border-neutral-200 h-9 rounded-lg font-mono text-[10px] font-bold w-full shadow-sm"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 h-12 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-black transition-all uppercase text-[10px] tracking-widest"
              >
                {isLocating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-700"></div>
                ) : (
                  <Navigation size={18} />
                )}
                <span>AUTO-DETECT CURRENT POSITION</span>
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
                <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">OPERATIONAL HOURS</h2>
                <p className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-widest">DEFINE WORK SCHEDULE</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Clock size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">CLOCK-IN WINDOW</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <CustomTimeSelector
                    label="START"
                    value={formData.clockInStartTime}
                    onChange={(val) => handleInputChange('clockInStartTime', val)}
                    hoverBorderClass="hover:border-emerald-300 focus-within:border-emerald-400 bg-white shadow-sm rounded-lg"
                  />
                  <CustomTimeSelector
                    label="END"
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
                  <span className="text-[11px] font-black uppercase tracking-widest">CLOCK-OUT WINDOW</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <CustomTimeSelector
                    label="START"
                    value={formData.clockOutStartTime}
                    onChange={(val) => handleInputChange('clockOutStartTime', val)}
                    hoverBorderClass="hover:border-orange-300 focus-within:border-orange-400 bg-white shadow-sm rounded-lg"
                  />
                  <CustomTimeSelector
                    label="END"
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
                <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">TENANT IDENTITY</h2>
                <p className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-widest">BRANDING & VISUALS</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-100">
               <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">CORPORATE LOGO</label>
                  <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-xs">
                    <button 
                      onClick={() => setLogoMode("link")}
                      className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all flex items-center gap-1.5 ${logoMode === 'link' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <LinkIcon size={10} /> LINK
                    </button>
                    <button 
                      onClick={() => setLogoMode("upload")}
                      className={`px-3 py-1 text-[9px] font-black uppercase rounded-md transition-all flex items-center gap-1.5 ${logoMode === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Upload size={10} /> UPLOAD
                    </button>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-sm flex items-center justify-center group/logo">
                    {formData.tenantLogo ? (
                      <>
                        <Image 
                          src={formData.tenantLogo} 
                          fill 
                          alt="Tenant Logo" 
                          className="object-cover transition-opacity group-hover/logo:opacity-40" 
                          sizes="80px"
                        />
                        {isUploadingLogo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                            <Loader2 className="animate-spin text-indigo-600" size={24} />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                        {isUploadingLogo ? <Loader2 className="animate-spin text-indigo-600" size={24} /> : <Camera size={28} />}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    {logoMode === "link" ? (
                      <div className="space-y-1">
                        <Input 
                          placeholder="HTTPS://EXAMPLE.COM/LOGO.PNG"
                          value={formData.tenantLogo || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tenantLogo', e.target.value)}
                          className="h-12 bg-white border-slate-200 rounded-xl text-xs font-black uppercase placeholder:text-slate-300"
                        />
                        <p className="text-[9px] font-black text-slate-400 ml-1 uppercase">PROVIDE A DIRECT ASSET URL</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <input 
                          type="file" 
                          id="logo-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                        />
                        <label 
                          htmlFor="logo-upload"
                          className="flex flex-col items-center justify-center h-12 w-full bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group/upload"
                        >
                          <div className="flex items-center gap-2">
                            <Upload size={16} className="text-slate-400 group-hover/upload:text-indigo-600 transition-colors" />
                            <span className="text-[10px] font-black text-slate-500 group-hover/upload:text-indigo-700 transition-colors uppercase">CHOOSE LOCAL ASSET...</span>
                          </div>
                        </label>
                        <p className="text-[9px] font-black text-slate-400 mt-1 ml-1 uppercase tracking-tighter">MAX SIZE 5MB (JPG, PNG, SVG)</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4 mb-6 pt-2 border-t border-slate-100">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner">
                <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">SECURITY POLICIES</h2>
                <p className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-widest">VALIDATION & COMPLIANCE</p>
              </div>
            </div>

            <div className="flex flex-col border border-neutral-100 rounded-2xl overflow-hidden bg-neutral-50/50">
              <div className="p-4 flex items-center justify-between border-b border-neutral-100 hover:bg-white transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Globe size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                       <span className="text-sm font-black text-neutral-800 uppercase tracking-tight">REMOTE WORK</span>
                       <Tooltip content="ALLOW EMPLOYEES TO CLOCK-IN FROM ANY LOCATION (WFA).">
                          <HelpCircle size={12} className="text-neutral-300" />
                       </Tooltip>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">DISABLE RADIUS RESTRICTIONS</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.allowRemote}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('allowRemote', e.target.checked)}
                />
              </div>

              <div className="p-4 flex items-center justify-between border-b border-neutral-100 hover:bg-white transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Navigation size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                       <span className="text-sm font-black text-neutral-800 uppercase tracking-tight">GEOLOCATION</span>
                       <Tooltip content="MANDATORY GPS COORDINATES FOR ALL ATTENDANCE LOGS.">
                          <HelpCircle size={12} className="text-neutral-300" />
                       </Tooltip>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">FORCE COORDINATE CAPTURE</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.requireLocation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('requireLocation', e.target.checked)}
                />
              </div>

              <div className="p-4 flex items-center justify-between border-b border-neutral-100 hover:bg-white transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Camera size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                       <span className="text-sm font-black text-neutral-800 uppercase tracking-tight">FACE PHOTO</span>
                       <Tooltip content="EMPLOYEES MUST SUBMIT A SELFIE DURING CLOCK-IN/OUT.">
                          <HelpCircle size={12} className="text-neutral-300" />
                       </Tooltip>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">BIOMETRIC PROOF OF PRESENCE</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.requireSelfie}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('requireSelfie', e.target.checked)}
                />
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-white transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Layers size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                       <span className="text-sm font-black text-neutral-800 uppercase tracking-tight">MULTIPLE LOGS</span>
                       <Tooltip content="ALLOW USERS TO SUBMIT MULTIPLE ATTENDANCE ENTRIES PER DAY.">
                          <HelpCircle size={12} className="text-neutral-300" />
                       </Tooltip>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">PERMIT CONSECUTIVE CHECK-INS</span>
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
                disabled={isSaving || !isDirty}
                className={`w-full flex items-center justify-center gap-2 h-14 rounded-xl text-base font-black transition-all shadow-md active:translate-y-0 uppercase tracking-widest ${
                  isDirty 
                  ? "bg-neutral-900 hover:bg-neutral-800 text-white hover:shadow-xl hover:-translate-y-0.5" 
                  : "bg-neutral-100 text-neutral-400 cursor-default shadow-none"
                }`}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={20} strokeWidth={2.5} />
                    {isDirty ? "SAVE CONFIGURATION" : "UP TO DATE"}
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* STICKY SAVE BAR */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4 transition-all duration-500 ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4 ring-1 ring-neutral-950/5">
          <div className="flex items-center gap-3 pl-2">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-neutral-900 uppercase tracking-tight">UNSAVED CHANGES</span>
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">WORKSPACE MODIFIED</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleReset}
              disabled={isSaving}
              className="px-6 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all"
            >
              DISCARD
            </button>
            <Button
              onClick={onHandleChange}
              disabled={isSaving}
              className="px-8 h-12 bg-neutral-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-neutral-200 transition-all flex items-center gap-2 active:scale-95"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              PUSH CHANGES
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
