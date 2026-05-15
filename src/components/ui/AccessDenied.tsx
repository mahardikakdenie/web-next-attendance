import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { Button } from './Button';
import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
  title?: string;
  message?: string;
}

export function AccessDenied({ 
  title = "Access Denied", 
  message = "You don't have the required permissions to view this page. Please contact your administrator if you believe this is an error." 
}: AccessDeniedProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-rose-50 rounded-[32px] flex items-center justify-center text-rose-500 shadow-inner">
          <ShieldAlert size={48} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-400">
          <Lock size={20} />
        </div>
      </div>

      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 uppercase italic">
        {title}
      </h2>
      
      <p className="max-w-md text-slate-500 font-medium leading-relaxed mb-10">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => router.back()}
          variant="secondary"
          className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200"
        >
          <ArrowLeft size={16} className="mr-2" />
          Go Back
        </Button>
        <Button 
          onClick={() => router.push('/')}
          className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-900 text-white"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}
