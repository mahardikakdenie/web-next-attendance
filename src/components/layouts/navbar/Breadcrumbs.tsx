"use client";

import React, { useMemo, Fragment } from "react";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { BreadcrumbSegment } from "@/types/layout";

export default function Breadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo((): BreadcrumbSegment[] => {
    if (!pathname || pathname === "/") {
      return [
        { label: "Dashboard", isLast: false },
        { label: "Overview", isLast: true }
      ];
    }
    
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, idx) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      isLast: idx === segments.length - 1
    }));
  }, [pathname]);

  return (
    <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 capitalize">
      <LayoutGrid size={16} className="text-slate-300" />
      {breadcrumbs.map((crumb, idx) => (
        <Fragment key={idx}>
          <span className={crumb.isLast ? "text-slate-800" : "text-slate-400"}>
            {crumb.label}
          </span>
          {!crumb.isLast && <span className="text-slate-300">/</span>}
        </Fragment>
      ))}
    </div>
  );
}
