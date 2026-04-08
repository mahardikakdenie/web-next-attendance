"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Clock, Sun, Moon, Sunrise } from 'lucide-react';

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hoverBorderClass?: string; 
}

export default function CustomTimeSelector({ 
  label, 
  value, 
  onChange, 
  hoverBorderClass = "hover:border-blue-500" 
}: TimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedHour, selectedMinute] = value ? value.split(':') : ['00', '00'];

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeChange = (type: 'hour' | 'minute', val: string) => {
    const newHour = type === 'hour' ? val : selectedHour;
    const newMinute = type === 'minute' ? val : selectedMinute;
    onChange(`${newHour}:${newMinute}`);
  };

  const getTimeIndicator = () => {
    if (!value) return null;
    const hour = parseInt(selectedHour, 10);
    
    if (hour >= 5 && hour < 11) {
      return { icon: <Sunrise className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, text: 'Pagi', bg: 'bg-sky-50 text-sky-600' };
    } else if (hour >= 11 && hour < 15) {
      return { icon: <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, text: 'Siang', bg: 'bg-amber-50 text-amber-600' };
    } else if (hour >= 15 && hour < 18) {
      return { icon: <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, text: 'Sore', bg: 'bg-orange-50 text-orange-600' };
    } else {
      return { icon: <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />, text: 'Malam', bg: 'bg-indigo-50 text-indigo-600' };
    }
  };

  const indicator = getTimeIndicator();

  return (
    <div 
      ref={dropdownRef}
      className={`group relative flex flex-col gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border shadow-sm transition-all duration-300 ${isOpen ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-200 hover:shadow-md'} ${hoverBorderClass}`}
    >
      <div className="flex justify-between items-center w-full min-h-6 gap-2">
        <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate">
          {label}
        </span>
        {indicator && (
          <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shrink-0 ${indicator.bg} animate-in fade-in zoom-in duration-300`}>
            {indicator.icon}
            <span className="text-[9px] sm:text-[10px] font-bold tracking-wide">{indicator.text}</span>
          </div>
        )}
      </div>
      
      <div 
        className="relative flex items-center justify-between mt-0.5 sm:mt-1 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          {selectedHour}:{selectedMinute}
        </div>
        
        <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl transition-all duration-300 ${isOpen ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-50 text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50'}`}>
           <Clock className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 shadow-xl rounded-2xl z-50 p-2 flex gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">Jam</span>
            <div className="w-full h-48 overflow-y-auto flex flex-col gap-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {hours.map((h) => (
                <button
                  key={h}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTimeChange('hour', h);
                  }}
                  className={`w-full py-2 rounded-xl text-sm font-bold transition-colors ${selectedHour === h ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-px bg-gray-100 my-2"></div>

          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase mb-2">Menit</span>
            <div className="w-full h-48 overflow-y-auto flex flex-col gap-1 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {minutes.map((m) => (
                <button
                  key={m}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTimeChange('minute', m);
                  }}
                  className={`w-full py-2 rounded-xl text-sm font-bold transition-colors ${selectedMinute === m ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
