import * as React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
}

export type Icon = React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
export type LucideIcon = React.ComponentType<IconProps>;
export type LucideProps = IconProps;

function createIcon(
  displayName: string,
  paths: (props: IconProps) => React.ReactNode,
  defaultViewBox = "0 0 24 24",
  defaultFill = "none"
) {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, strokeWidth = 1.6, className, ...props }, ref) => (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={defaultViewBox}
        fill={props.fill ?? defaultFill}
        stroke={props.stroke ?? "currentColor"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {paths(props)}
      </svg>
    )
  );
  Component.displayName = displayName;
  return Component;
}

// ---------------------------------------------------------------------------
// SVG Repo — Solar / Modern Tech Vector Collection
// Refined, high-end icons with rounded geometries & distinct electronics appeal
// ---------------------------------------------------------------------------

// 1. Navigation & E-Commerce Essentials
export const ShoppingCart = createIcon("ShoppingCart", () => (
  <>
    <path d="M2.5 3h2.2l2.3 11.2a1.8 1.8 0 0 0 1.8 1.4h9.8a1.8 1.8 0 0 0 1.8-1.4l1.6-7.7H6" />
    <circle cx="9.2" cy="19.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="16.8" cy="19.5" r="1.5" fill="currentColor" stroke="none" />
  </>
));

export const ShoppingBag = createIcon("ShoppingBag", () => (
  <>
    <path d="M4.5 8.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2l1 11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2l1-11Z" />
    <path d="M8.5 7.5V6a3.5 3.5 0 0 1 7 0v1.5" />
    <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
  </>
));

export const Search = createIcon("Search", () => (
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4.2-4.2" />
    <path d="M8 10a3 3 0 0 1 3-3" strokeWidth={1.2} opacity={0.6} />
  </>
));

export const Heart = createIcon("Heart", () => (
  <path d="M12 20.8S3.5 15.5 3.5 9.5a5 5 0 0 1 8.5-3.5 5 5 0 0 1 8.5 3.5c0 6-8.5 11.3-8.5 11.3Z" />
));

export const Star = createIcon("Star", () => (
  <path d="m12 2.5 2.9 6.2 6.8.9-5 4.8 1.2 6.8-5.9-3.2-5.9 3.2 1.2-6.8-5-4.8 6.8-.9L12 2.5Z" />
));

export const Menu = createIcon("Menu", () => (
  <>
    <path d="M3.5 7h17" />
    <path d="M3.5 12h12" />
    <path d="M3.5 17h17" />
  </>
));

export const X = createIcon("X", () => (
  <>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </>
));

// 2. Arrows & Directionals
export const ChevronDown = createIcon("ChevronDown", () => (
  <path d="m6 9 6 6 6-6" />
));

export const ChevronLeft = createIcon("ChevronLeft", () => (
  <path d="m15 18-6-6 6-6" />
));

export const ChevronRight = createIcon("ChevronRight", () => (
  <path d="m9 18 6-6-6-6" />
));

export const ArrowRight = createIcon("ArrowRight", () => (
  <>
    <path d="M4 12h16" />
    <path d="m14 6 6 6-6 6" />
  </>
));

export const ArrowLeft = createIcon("ArrowLeft", () => (
  <>
    <path d="M20 12H4" />
    <path d="m10 6-6 6 6 6" />
  </>
));

// 3. User & Identity
export const User = createIcon("User", () => (
  <>
    <circle cx="12" cy="7.2" r="4.2" />
    <path d="M4.5 20.2a7.5 7.5 0 0 1 15 0" />
  </>
));

export const Users = createIcon("Users", () => (
  <>
    <circle cx="9" cy="7" r="3.5" />
    <path d="M2.5 19.5a6.5 6.5 0 0 1 13 0" />
    <circle cx="17.5" cy="8" r="2.8" />
    <path d="M16 14.5a5.5 5.5 0 0 1 5.5 5" />
  </>
));

export const LogOut = createIcon("LogOut", () => (
  <>
    <path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>
));

// 4. Logistics, Badges & Trust
export const Truck = createIcon("Truck", () => (
  <>
    <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h9A1.5 1.5 0 0 1 14 5.5V17H2V5.5Z" />
    <path d="M14 8h4.2a2 2 0 0 1 1.6.8l2.2 3.2v5H14V8Z" />
    <circle cx="6.5" cy="18" r="2" />
    <circle cx="17.5" cy="18" r="2" />
  </>
));

export const Shield = createIcon("Shield", () => (
  <path d="M12 2.5s7 2.2 8.5 4.5c0 6-3.8 11.8-8.5 14.5-4.7-2.7-8.5-8.5-8.5-14.5C5 4.7 12 2.5 12 2.5Z" />
));

export const ShieldCheck = createIcon("ShieldCheck", () => (
  <>
    <path d="M12 2.5s7 2.2 8.5 4.5c0 6-3.8 11.8-8.5 14.5-4.7-2.7-8.5-8.5-8.5-14.5C5 4.7 12 2.5 12 2.5Z" />
    <path d="m9 12 2 2 4-4" />
  </>
));

export const BadgeCheck = createIcon("BadgeCheck", () => (
  <>
    <path d="M10.2 2.7a2.5 2.5 0 0 1 3.6 0l.8.8a2.5 2.5 0 0 0 2.5.7l1.1-.3a2.5 2.5 0 0 1 3 2.1l.2 1.1a2.5 2.5 0 0 0 1.6 2.1l1 .4a2.5 2.5 0 0 1 1.4 3.3l-.4 1a2.5 2.5 0 0 0 .3 2.6l.7.9a2.5 2.5 0 0 1-1.1 3.5l-1 .5a2.5 2.5 0 0 0-1.4 2.3v1.1a2.5 2.5 0 0 1-2.7 2.5h-1.1a2.5 2.5 0 0 0-2.2 1.3l-.6 1a2.5 2.5 0 0 1-3.5.7l-.9-.6a2.5 2.5 0 0 0-2.6 0l-.9.6a2.5 2.5 0 0 1-3.5-.7l-.6-1A2.5 2.5 0 0 0 7.8 21H6.7a2.5 2.5 0 0 1-2.7-2.5v-1.1a2.5 2.5 0 0 0-1.4-2.3l-1-.5a2.5 2.5 0 0 1-1.1-3.5l.7-.9a2.5 2.5 0 0 0 .3-2.6l-.4-1a2.5 2.5 0 0 1 1.4-3.3l1-.4a2.5 2.5 0 0 0 1.6-2.1l.2-1.1a2.5 2.5 0 0 1 3-2.1l1.1.3a2.5 2.5 0 0 0 2.5-.7l.8-.8Z" />
    <path d="m9 12 2 2 4-4" />
  </>
));

export const Package = createIcon("Package", () => (
  <>
    <path d="m12 2.5 8.5 4.8v9.4L12 21.5 3.5 16.7V7.3L12 2.5Z" />
    <path d="M12 21.5V12" />
    <path d="m12 12-8.5-4.7" />
    <path d="M12 12l8.5-4.7" />
  </>
));

export const PackageSearch = createIcon("PackageSearch", () => (
  <>
    <path d="m11 2.8 7.5 4.2v4M3.5 7.3 11 11.5m0 9V11.5M3.5 7.3v9.4L11 20.5" />
    <circle cx="16.5" cy="16.5" r="3.5" />
    <path d="m19 19 3 3" />
  </>
));

export const MapPin = createIcon("MapPin", () => (
  <>
    <path d="M12 21.5s-7-6.2-7-11.5a7 7 0 1 1 14 0c0 5.3-7 11.5-7 11.5Z" />
    <circle cx="12" cy="10" r="2.8" />
  </>
));

// 5. Validation, Checks & Status
export const Check = createIcon("Check", () => (
  <path d="m4.5 12.5 5 5 10-10" />
));

export const CheckCircle2 = createIcon("CheckCircle2", () => (
  <>
    <circle cx="12" cy="12" r="9.5" />
    <path d="m8 12 2.7 2.7 5.3-5.4" />
  </>
));

export const Circle = createIcon("Circle", () => (
  <circle cx="12" cy="12" r="9.5" />
));

export const AlertCircle = createIcon("AlertCircle", () => (
  <>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 7.5v5.5" />
    <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
  </>
));

export const AlertTriangle = createIcon("AlertTriangle", () => (
  <>
    <path d="m12 2.8 9.2 16.2A1.8 1.8 0 0 1 19.6 22H4.4a1.8 1.8 0 0 1-1.6-3L12 2.8Z" />
    <path d="M12 9v5" />
    <circle cx="12" cy="17.5" r="0.75" fill="currentColor" stroke="none" />
  </>
));

export const HelpCircle = createIcon("HelpCircle", () => (
  <>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2.2-2.5 3v1" />
    <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
  </>
));

export const Loader2 = createIcon("Loader2", () => (
  <path d="M21 12a9 9 0 1 1-6.2-8.6" />
));

// 6. Technology & Hardware
export const Headphones = createIcon("Headphones", () => (
  <>
    <path d="M3.5 13.5A8.5 8.5 0 0 1 20.5 13.5v4a2.5 2.5 0 0 1-2.5 2.5h-1a2.5 2.5 0 0 1-2.5-2.5v-3a2.5 2.5 0 0 1 2.5-2.5h2.5" />
    <path d="M3.5 12h2.5A2.5 2.5 0 0 1 8.5 14.5v3A2.5 2.5 0 0 1 6 20h-1A2.5 2.5 0 0 1 2.5 17.5v-4a8.5 8.5 0 0 1 1-1.5" />
  </>
));

export const Monitor = createIcon("Monitor", () => (
  <>
    <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
    <path d="M8 20.5h8" />
    <path d="M12 16.5v4" />
  </>
));

export const Phone = createIcon("Phone", () => (
  <path d="M21.5 16.7v3a2 2 0 0 1-2.2 2 19.5 19.5 0 0 1-8.5-3 19 19 0 0 1-5.9-5.9 19.5 19.5 0 0 1-3-8.6A2 2 0 0 1 3.9 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6.3 6.3l1.2-1.2a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.7 2Z" />
));

export const Mail = createIcon("Mail", () => (
  <>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <path d="m3.5 6.5 8 5.5 8-5.5" />
  </>
));

export const Zap = createIcon("Zap", () => (
  <path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12l1-8Z" />
));

export const Sparkles = createIcon("Sparkles", () => (
  <>
    <path d="m12 2.5 1.8 5.7 5.7 1.8-5.7 1.8L12 17.5l-1.8-5.7L4.5 10l5.7-1.8L12 2.5Z" />
    <path d="m19 16 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
  </>
));

// 7. Security & Passwords
export const Lock = createIcon("Lock", () => (
  <>
    <rect x="4.5" y="10.5" width="15" height="11" rx="2.5" />
    <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
  </>
));

export const Eye = createIcon("Eye", () => (
  <>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3.2" />
  </>
));

export const EyeOff = createIcon("EyeOff", () => (
  <>
    <path d="M3 3l18 18" />
    <path d="M10.6 10.7a3 3 0 0 0 4.2 4.2" />
    <path d="M9.4 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a18.2 18.2 0 0 1-4 4.8" />
    <path d="M6.2 6.3A17.9 17.9 0 0 0 2 12s3.6 7 10 7c2 0 3.8-.5 5.3-1.4" />
  </>
));

// 8. Refresh & Cycles
export const RefreshCw = createIcon("RefreshCw", () => (
  <>
    <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" />
    <path d="M3 21v-5h5" />
    <path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" />
    <path d="M21 3v5h-5" />
  </>
));

export const RefreshCcw = createIcon("RefreshCcw", () => (
  <>
    <path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" />
    <path d="M3 21v-5h5" />
  </>
));

export const RotateCcw = createIcon("RotateCcw", () => (
  <>
    <path d="M3 12a9 9 0 1 0 2.7-6.4L3 8" />
    <path d="M3 3v5h5" />
  </>
));

// 9. Themes & Controls
export const Sun = createIcon("Sun", () => (
  <>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2.5v2.5m0 14v2.5M2.5 12h2.5m14 0h2.5m-14.4-7.1 1.8 1.8m9.8 9.8 1.8 1.8m-13.4 0 1.8-1.8m9.8-9.8 1.8-1.8" />
  </>
));

export const Moon = createIcon("Moon", () => (
  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
));

export const SlidersHorizontal = createIcon("SlidersHorizontal", () => (
  <>
    <path d="M3 6h7m4 0h7M3 18h11m4 0h3M3 12h3m4 0h11" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="16" cy="18" r="2" />
  </>
));

// 10. Dashboard, Commerce & Admin
export const LayoutDashboard = createIcon("LayoutDashboard", () => (
  <>
    <rect x="3" y="3" width="7.5" height="9.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5" />
    <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.5" />
    <rect x="3" y="15.5" width="7.5" height="5.5" rx="1.5" />
  </>
));

export const CreditCard = createIcon("CreditCard", () => (
  <>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19" />
    <path d="M6.5 15h4" />
  </>
));

export const Ticket = createIcon("Ticket", () => (
  <>
    <path d="M2.5 8.5a2.5 2.5 0 0 1 2.5-2.5h14a2.5 2.5 0 0 1 2.5 2.5v1.8a2.5 2.5 0 0 0 0 4.4v1.8a2.5 2.5 0 0 1-2.5 2.5H5a2.5 2.5 0 0 1-2.5-2.5v-1.8a2.5 2.5 0 0 0 0-4.4V8.5Z" />
    <path d="M9.5 6v12m5-12v12" strokeDasharray="2 2" />
  </>
));

export const TrendingUp = createIcon("TrendingUp", () => (
  <>
    <path d="m22 7-8.5 8.5-5-5L2 17" />
    <path d="M16 7h6v6" />
  </>
));

export const Building = createIcon("Building", () => (
  <>
    <rect x="4" y="2.5" width="16" height="19" rx="1.5" />
    <path d="M8 6.5h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2M10 21.5v-4h4v4" />
  </>
));

export const Clock = createIcon("Clock", () => (
  <>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 6.5v5.5l3.5 2" />
  </>
));

export const Calendar = createIcon("Calendar", () => (
  <>
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
    <path d="M16 2.5v4M8 2.5v4M3 9.5h18" />
  </>
));

export const Home = createIcon("Home", () => (
  <>
    <path d="m3 10.5 8.2-6.6a1.3 1.3 0 0 1 1.6 0L21 10.5" />
    <path d="M5.5 9v11a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V9" />
    <path d="M10 21.5v-5a2 2 0 0 1 4 0v5" />
  </>
));

export const Compass = createIcon("Compass", () => (
  <>
    <circle cx="12" cy="12" r="9.5" />
    <path d="m15.8 8.2-2.2 6-5.8 1.6 2.2-6 5.8-1.6Z" />
  </>
));

export const Pencil = createIcon("Pencil", () => (
  <>
    <path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L7.5 19.5 3 21l1.5-4.5L17.5 3.5Z" />
    <path d="m15 6 3 3" />
  </>
));

export const Trash2 = createIcon("Trash2", () => (
  <>
    <path d="M3.5 6.5h17m-3.5 0v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-12" />
    <path d="M8.5 6.5V4.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v2" />
    <path d="M10 11v5m4-5v5" />
  </>
));

export const Plus = createIcon("Plus", () => (
  <path d="M12 5v14m-7-7h14" />
));

export const Minus = createIcon("Minus", () => (
  <path d="M5 12h14" />
));

export const Play = createIcon("Play", () => (
  <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" />
));

export const Pause = createIcon("Pause", () => (
  <path d="M7 5h3v14H7Zm7 0h3v14h-3Z" fill="currentColor" />
));

export const ExternalLink = createIcon("ExternalLink", () => (
  <>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="m15 3 6 0 0 6m-11 11L21 3" />
  </>
));

export const Link = createIcon("Link", () => (
  <>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>
));

export const UploadCloud = createIcon("UploadCloud", () => (
  <>
    <path d="M4 16.2A5.5 5.5 0 0 1 8.5 11 6.5 6.5 0 0 1 20 13.5a4.5 4.5 0 0 1-1.5 8.5H5a4.5 4.5 0 0 1-1-5.8Z" />
    <path d="m12 9 4 4m-4-4-4 4m4-4v9" />
  </>
));

export const Image = createIcon("Image", () => (
  <>
    <rect x="3" y="3.5" width="18" height="17" rx="2.5" />
    <circle cx="8.5" cy="8.5" r="2" />
    <path d="m21 15.5-5.5-5.5-9 9M21 18.5l-3.5-3.5-3.5 3.5" />
  </>
));

export const Send = createIcon("Send", () => (
  <>
    <path d="m21.5 2.5-19 9 7.5 2.5 2.5 7.5 9-19Z" />
    <path d="m10 14 5.5-5.5" />
  </>
));

export const MessageSquare = createIcon("MessageSquare", () => (
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
));

// 11. Category Hardware & Accessories (SVG Repo — Solar / Modern Tech)
export const Smartphone = createIcon("Smartphone", () => (
  <>
    <rect x="5" y="2.5" width="14" height="19" rx="3" />
    <path d="M11 5.5h2" />
    <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
  </>
));

export const Laptop = createIcon("Laptop", () => (
  <>
    <rect x="3.5" y="4.5" width="17" height="11.5" rx="2" />
    <path d="M1.5 19.5h21a1.5 1.5 0 0 1-1.5 1.5H3a1.5 1.5 0 0 1-1.5-1.5Z" />
    <path d="M10 16h4" />
  </>
));

export const Gamepad = createIcon("Gamepad", () => (
  <>
    <path d="M6 12h4m-2-2v4m7-2h.01m3 0h.01" />
    <path d="M6.5 6h11A4.5 4.5 0 0 1 22 10.5v3a4.5 4.5 0 0 1-7.5 3.3L12 15l-2.5 1.8A4.5 4.5 0 0 1 2 13.5v-3A4.5 4.5 0 0 1 6.5 6Z" />
  </>
));

export const SmartHome = createIcon("SmartHome", () => (
  <>
    <path d="m3 10 9-7 9 7v9.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 19.5V10Z" />
    <path d="M9 22v-5a3 3 0 0 1 6 0v5" />
    <path d="M12 9v2m-2-1h4" />
  </>
));

export const Plug = createIcon("Plug", () => (
  <>
    <path d="M8 2v4m8-4v4M5 6h14a1 1 0 0 1 1 1v3a6 6 0 0 1-6 6v3a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-3a6 6 0 0 1-6-6V7a1 1 0 0 1 1-1Z" />
  </>
));

export const Tablet = createIcon("Tablet", () => (
  <>
    <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
    <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
  </>
));

export const Camera = createIcon("Camera", () => (
  <>
    <path d="M14.5 4h-5L7.5 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.5L14.5 4Z" />
    <circle cx="12" cy="13" r="3.5" />
  </>
));

export const Watch = createIcon("Watch", () => (
  <>
    <rect x="6" y="5.5" width="12" height="13" rx="3.5" />
    <path d="M9 2.5h6v3H9zm0 16h6v3H9z" />
    <path d="M12 9v3l2 1" />
  </>
));

export const Wifi = createIcon("Wifi", () => (
  <>
    <path d="M5 8.5a10 10 0 0 1 14 0m-11.5 3.5a6 6 0 0 1 9 0m-6.5 3.5a2.5 2.5 0 0 1 4 0" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </>
));

export const Cpu = createIcon("Cpu", () => (
  <>
    <rect x="5.5" y="5.5" width="13" height="13" rx="2" />
    <rect x="8.5" y="8.5" width="7" height="7" rx="1" />
    <path d="M9 2v3.5m6-3.5v3.5M9 18.5V22m6-3.5V22M2 9h3.5m-3.5 6h3.5m13-6H22m-3.5 6H22" />
  </>
));

export const Settings = createIcon("Settings", () => (
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </>
));

