"use client";

import Image from "next/image";
import { useMemo } from "react";

interface AvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  alt?: string;
}

export default function Avatar({ 
  src, 
  name = "User",
  className = "w-10 h-10 rounded-2xl", 
  alt = "User avatar" 
}: AvatarProps) {
  
  const initials = useMemo(() => {
    if (!name || name === "Unknown User") return "U";
    return name
      .split(" ")
      .filter(part => part.length > 0)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [name]);

  // Generate a consistent color based on the name
  const bgColor = useMemo(() => {
    const colors = [
      "bg-blue-600",
      "bg-indigo-600",
      "bg-emerald-600",
      "bg-rose-600",
      "bg-amber-600",
      "bg-purple-600",
      "bg-cyan-600",
      "bg-slate-700",
    ];
    let hash = 0;
    const stringToHash = name || "User";
    for (let i = 0; i < stringToHash.length; i++) {
      hash = stringToHash.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [name]);

  // Ensure className has the necessary properties if they're missing
  const finalClassName = useMemo(() => {
    let classes = className;
    if (!classes.includes("overflow-hidden")) classes += " overflow-hidden";
    if (!classes.includes("relative")) classes += " relative";
    if (!classes.includes("shrink-0")) classes += " shrink-0";
    return classes;
  }, [className]);

  const isPlaceholder = !src || src.includes("pravatar.cc") || src === "";

  if (isPlaceholder) {
    return (
      <div 
        className={`${finalClassName} ${bgColor} flex items-center justify-center text-white font-black tracking-tighter border-2 border-white shadow-xs`}
        aria-label={name}
      >
        <span className="text-[1.2em] leading-none">{initials}</span>
      </div>
    );
  }

  return (
    <div className={finalClassName}>
      <Image
        src={src}
        fill
        alt={alt}
        className="object-cover"
        sizes="100px"
      />
    </div>
  );
}
