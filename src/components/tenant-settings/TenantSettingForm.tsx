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
  Map,
  Search,
  CheckCircle2,
  Info
} from "lucide-react";
import Input from "@/components/ui/Input";
import Switch from "@/components/ui/Switch";
import CustomTimeSelector from "../ui/CustomTimeSelector";
import { Button } from "../ui/Button";
import { getDataCurrentTenat } from "@/service/tenantSettings";

interface TenantSettingsData {
  tenantId: number;
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
}

interface TenantApiData {
  id: number;
  tenant_id: number;
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
    ID: number;
    Name: string;
    Code: string;
    CreatedAt: string;
    UpdatedAt: string;
  };
}

interface ApiResponse {
  meta: {
    message: string;
    code: number;
    status: string;
  };
  data: TenantApiData;
}

const INITIAL_DATA: TenantSettingsData = {
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
  const [formData, setFormData] = useState<TenantSettingsData>(INITIAL_DATA);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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
        alert("Location not found. Please try a more specific address or paste a Google Maps URL.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to search location. Please check your connection.");
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
            tenantId: apiData.tenant_id,
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
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    getData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-4xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Settings size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-neutral-900 tracking-tight">Basic Configuration</h2>
                  <p className="text-xs font-medium text-neutral-500 mt-0.5">Core identity and basic rules</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                ID: {formData.tenantId}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group flex flex-col gap-1.5 rounded-2xl border border-neutral-100 bg-neutral-50/30 p-4 transition-all hover:bg-neutral-50">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Max Radius (Meters)</label>
                <div className="flex items-center gap-3">
                  <Zap size={16} className="text-amber-500" />
                  <Input
                    type="number"
                    value={formData.maxRadiusMeter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('maxRadiusMeter', e.target.value)}
                    className="bg-white border-neutral-200 h-10 rounded-xl font-bold w-full"
                  />
                </div>
              </div>

              <div className="group flex flex-col gap-1.5 rounded-2xl border border-neutral-100 bg-neutral-50/30 p-4 transition-all hover:bg-neutral-50">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Grace Period (Minutes)</label>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-rose-500" />
                  <Input
                    type="number"
                    value={formData.lateAfterMinute}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lateAfterMinute', e.target.value)}
                    className="bg-white border-neutral-200 h-10 rounded-xl font-bold w-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-neutral-100">
              <div className="flex items-center gap-2 mb-6">
                <MapPin size={20} className="text-blue-600" strokeWidth={2.5} />
                <h3 className="text-lg font-black text-neutral-900 tracking-tight">Office Coordinates</h3>
              </div>

              <div className="flex flex-col gap-6">
                <div className="w-full h-48 sm:h-64 bg-neutral-100 rounded-3xl overflow-hidden border border-neutral-200 relative">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${formData.officeLatitude},${formData.officeLongitude}&z=16&output=embed`}
                  ></iframe>
                  {showSuccessLocation && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-top-4 fade-in">
                      <CheckCircle2 size={14} /> Location Updated
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-7 flex flex-col gap-3">
                    <div className="flex items-start gap-2 bg-sky-50 border border-sky-100 p-3 rounded-2xl">
                      <Info className="text-sky-500 shrink-0 mt-0.5" size={16} />
                      <p className="text-[12px] text-sky-800 leading-relaxed">
                        Search an address, paste a <strong>Google Maps URL</strong>, or click Auto-Detect if you are currently at the office.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Search address or paste URL..."
                          value={searchQuery}
                          onChange={handleSmartInput}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
                          className="bg-white border-neutral-200 h-12 rounded-xl text-sm pl-11 w-full focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                        />
                        <Map className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      </div>
                      <Button
                        type="button"
                        onClick={handleSearchAddress}
                        disabled={isSearching || !searchQuery.trim()}
                        className="h-12 px-5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold transition-all"
                      >
                        {isSearching ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Search size={18} />}
                      </Button>
                    </div>

                    <Button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="w-full flex items-center justify-center gap-2 h-12 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-xl font-bold transition-all"
                    >
                      {isLocating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-700"></div>
                      ) : (
                        <Navigation size={16} className="text-blue-500" />
                      )}
                      <span className="text-blue-500">Auto-Detect My Location</span>
                    </Button>
                  </div>

                  <div className="md:col-span-5 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex flex-col gap-4 justify-center">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Latitude</label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.officeLatitude}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('officeLatitude', e.target.value)}
                        className="bg-white border-neutral-200 h-10 rounded-xl font-mono text-[13px] w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Longitude</label>
                      <Input
                        type="number"
                        step="any"
                        value={formData.officeLongitude}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('officeLongitude', e.target.value)}
                        className="bg-white border-neutral-200 h-10 rounded-xl font-mono text-[13px] w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-4xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Clock size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight">Working Hours</h2>
                <p className="text-xs font-medium text-neutral-500 mt-0.5">Define clock-in and clock-out availability</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/20 p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Zap size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Clock-In Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
                  <CustomTimeSelector
                    label="Start"
                    value={formData.clockInStartTime}
                    onChange={(val) => handleInputChange('clockInStartTime', val)}
                    hoverBorderClass="hover:border-emerald-300 focus-within:border-emerald-500 focus-within:ring-emerald-50"
                  />
                  <CustomTimeSelector
                    label="End"
                    value={formData.clockInEndTime}
                    onChange={(val) => handleInputChange('clockInEndTime', val)}
                    hoverBorderClass="hover:border-emerald-300 focus-within:border-emerald-500 focus-within:ring-emerald-50"
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-orange-100 bg-orange-50/20 p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Zap size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Clock-Out Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
                  <CustomTimeSelector
                    label="Start"
                    value={formData.clockOutStartTime}
                    onChange={(val) => handleInputChange('clockOutStartTime', val)}
                    hoverBorderClass="hover:border-orange-300 focus-within:border-orange-500 focus-within:ring-orange-50"
                  />
                  <CustomTimeSelector
                    label="End"
                    value={formData.clockOutEndTime}
                    onChange={(val) => handleInputChange('clockOutEndTime', val)}
                    hoverBorderClass="hover:border-orange-300 focus-within:border-orange-500 focus-within:ring-orange-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-4xl border border-neutral-200 p-6 sm:p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight">Security</h2>
                <p className="text-xs font-medium text-neutral-500 mt-0.5">Validation & access rules</p>
              </div>
            </div>

            <div className="flex flex-col gap-6 flex-1">
              <div className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 flex items-center justify-between group transition-all hover:bg-white hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-blue-500 transition-colors">
                    <Globe size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-800">Remote Work</span>
                    <span className="text-[10px] text-neutral-400">Allow WFA attendance</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.allowRemote}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('allowRemote', e.target.checked)}
                />
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 flex items-center justify-between group transition-all hover:bg-white hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-rose-500 transition-colors">
                    <Navigation size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-800">Geolocation</span>
                    <span className="text-[10px] text-neutral-400">Force GPS verification</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.requireLocation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('requireLocation', e.target.checked)}
                />
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 flex items-center justify-between group transition-all hover:bg-white hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-indigo-500 transition-colors">
                    <Camera size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-800">Face Photo</span>
                    <span className="text-[10px] text-neutral-400">Mandatory selfie proof</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.requireSelfie}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('requireSelfie', e.target.checked)}
                />
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 flex items-center justify-between group transition-all hover:bg-white hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-emerald-500 transition-colors">
                    <Layers size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-800">Multiple Logs</span>
                    <span className="text-[10px] text-neutral-400">Allow multiple checks</span>
                  </div>
                </div>
                <Switch
                  label=""
                  checked={formData.allowMultipleCheck}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSwitchChange('allowMultipleCheck', e.target.checked)}
                />
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3">
              <Button className="w-full flex items-center justify-center gap-2 h-14 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-black transition-all active:scale-[0.98] shadow-xl shadow-neutral-900/10">
                <Save size={20} strokeWidth={2.5} />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
