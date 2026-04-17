import Image from "next/image";

interface AvatarProps {
  src?: string; // src bisa berupa string, undefined, atau kosong
  className?: string;
  alt?: string;
}

export default function Avatar({ 
  src, 
  className = "w-8 h-8 rounded-full object-cover", 
  alt = "User avatar" 
}: AvatarProps) {
  
  // CEGAHAN ERROR: Jika src kosong ("") atau tidak ada, render fallback UI
  if (!src) {
    return (
      <div 
        className={`${className} bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden`}
        aria-label="Default user avatar"
      >
        {/* SVG Ikon User Default sebagai pengganti gambar kosong */}
        <svg className="w-3/5 h-3/5 mt-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
    );
  }

  // Jika src valid dan ada isinya, render Image dari Next.js
  return (
    <Image
      src={src}
      width={40}
      height={40}
      alt={alt}
      className={className}
    />
  );
}
