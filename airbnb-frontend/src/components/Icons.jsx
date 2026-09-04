/**
 * components/Icons.jsx
 * Centralised SVG icon library matching Airbnb's design system.
 * All icons are inline SVGs — no emoji, no external deps.
 * Usage: <Icons.Wifi size={20} />
 */

const Icon = ({ children, size = 24, className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

// ── Navigation & UI ───────────────────────────────────────────────────────────
export const Search = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </Icon>
);

export const Menu = (p) => (
  <Icon {...p}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </Icon>
);

export const User = (p) => (
  <Icon {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const Globe = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Icon>
);

export const ChevronDown = (p) => (
  <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>
);

export const ChevronLeft = (p) => (
  <Icon {...p}><path d="m15 18-6-6 6-6" /></Icon>
);

export const ChevronRight = (p) => (
  <Icon {...p}><path d="m9 18 6-6-6-6" /></Icon>
);

export const X = (p) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);

export const Share = (p) => (
  <Icon {...p}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </Icon>
);

// ── Heart / Save ──────────────────────────────────────────────────────────────
export const Heart = ({ filled = false, ...p }) => (
  <Icon {...p} fill={filled ? '#FF385C' : 'none'} stroke={filled ? '#FF385C' : 'currentColor'}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Icon>
);

// ── Location ──────────────────────────────────────────────────────────────────
export const MapPin = (p) => (
  <Icon {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

// ── Star ──────────────────────────────────────────────────────────────────────
export const Star = ({ filled = true, ...p }) => (
  <Icon {...p} fill={filled ? '#FF385C' : 'none'} stroke={filled ? '#FF385C' : 'currentColor'}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Icon>
);

// ── Amenity Icons ─────────────────────────────────────────────────────────────
export const Wifi = (p) => (
  <Icon {...p}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2" />
  </Icon>
);

export const Kitchen = (p) => (
  <Icon {...p}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </Icon>
);

export const Parking = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
  </Icon>
);

export const AirCon = (p) => (
  <Icon {...p}>
    <path d="M8 2v20M16 2v20M2 12h20M12 2a10 10 0 0 1 0 20" strokeWidth="1.2" />
  </Icon>
);

export const Tv = (p) => (
  <Icon {...p}>
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </Icon>
);

export const Washer = (p) => (
  <Icon {...p}>
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <circle cx="12" cy="13" r="5" />
    <path d="M7 7h.01M12 7h.01M17 7h.01" strokeWidth="2" />
  </Icon>
);

export const Pool = (p) => (
  <Icon {...p}>
    <path d="M2 12h20" />
    <path d="M2 16c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2" />
    <path d="M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" stroke="none" />
    <path d="M10 8l2-4 3 4" />
  </Icon>
);

export const Garden = (p) => (
  <Icon {...p}>
    <path d="M12 22V12" />
    <path d="M12 12C12 12 7 10 5 6c3 0 5.5 1 7 6z" />
    <path d="M12 12c0 0 5-2 7-6-3 0-5.5 1-7 6z" />
    <path d="M5 22h14" />
  </Icon>
);

export const Breakfast = (p) => (
  <Icon {...p}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </Icon>
);

export const Heating = (p) => (
  <Icon {...p}>
    <path d="M3 6h18v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6V6z" />
    <path d="M6 20v-8" />
    <path d="M12 20v-8" />
    <path d="M18 20v-8" />
  </Icon>
);

export const Elevator = (p) => (
  <Icon {...p}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="m9 10 3-3 3 3" />
    <path d="m9 14 3 3 3-3" />
  </Icon>
);

export const Gym = (p) => (
  <Icon {...p}>
    <path d="M6.5 6.5h11" />
    <path d="M17.5 6.5V18" />
    <path d="M6.5 18V6.5" />
    <path d="M3 9.5h3" />
    <path d="M18 9.5h3" />
    <path d="M3 14.5h3" />
    <path d="M18 14.5h3" />
  </Icon>
);

export const BeachAccess = (p) => (
  <Icon {...p}>
    <path d="M17.5 7.5A7.5 7.5 0 0 0 3 13" />
    <path d="M17.5 7.5A7.5 7.5 0 0 1 22 13" />
    <path d="M3 13h19" />
    <path d="M5 21l7-8 7 8" />
  </Icon>
);

export const Fireplace = (p) => (
  <Icon {...p}>
    <path d="M12 2C6.5 2 2 6.5 2 12c0 3 1.5 5.5 3.5 7.2" />
    <path d="M12 22c5.5 0 10-4.5 10-10 0-3-1.5-5.5-3.5-7.2" />
    <path d="M12 8c-2 2-3 4-2 7 1 2 3 3 4 3s3-1 4-3c1-3 0-5-2-7-1 3-2 4-4 0z" />
  </Icon>
);

export const BBQ = (p) => (
  <Icon {...p}>
    <path d="M4 4h16" />
    <path d="M4 4a8 8 0 0 0 16 0" />
    <path d="M12 12v8" />
    <path d="M9 20h6" />
  </Icon>
);

// ── Property features ─────────────────────────────────────────────────────────
export const Key = (p) => (
  <Icon {...p}>
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </Icon>
);

export const Sparkles = (p) => (
  <Icon {...p}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
    <path d="M5 3v4" />
    <path d="M3 5h4" />
    <path d="M19 17v4" />
    <path d="M17 19h4" />
  </Icon>
);

export const Calendar = (p) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

export const Shield = (p) => (
  <Icon {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Icon>
);

export const Home = (p) => (
  <Icon {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Icon>
);

export const Bed = (p) => (
  <Icon {...p}>
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v9" />
  </Icon>
);

export const Bath = (p) => (
  <Icon {...p}>
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
    <line x1="10" y1="5" x2="8" y2="7" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </Icon>
);

export const Users = (p) => (
  <Icon {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

export const Award = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </Icon>
);

export const MessageCircle = (p) => (
  <Icon {...p}>
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
  </Icon>
);

export const Clock = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);

export const Minus = (p) => (
  <Icon {...p}><line x1="5" y1="12" x2="19" y2="12" /></Icon>
);

export const Plus = (p) => (
  <Icon {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
);

export const Camera = (p) => (
  <Icon {...p}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </Icon>
);

export const SlidersHorizontal = (p) => (
  <Icon {...p}>
    <line x1="21" y1="4" x2="14" y2="4" />
    <line x1="10" y1="4" x2="3" y2="4" />
    <line x1="21" y1="12" x2="12" y2="12" />
    <line x1="8" y1="12" x2="3" y2="12" />
    <line x1="21" y1="20" x2="16" y2="20" />
    <line x1="12" y1="20" x2="3" y2="20" />
    <line x1="14" y1="2" x2="14" y2="6" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="16" y1="18" x2="16" y2="22" />
  </Icon>
);

export const CheckCircle = (p) => (
  <Icon {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);

export const Info = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
  </Icon>
);

// Map amenity name → icon component
export const AMENITY_ICONS = {
  'WiFi'         : Wifi,
  'Kitchen'      : Kitchen,
  'Free parking' : Parking,
  'Air conditioning': AirCon,
  'TV'           : Tv,
  'Washer'       : Washer,
  'Pool'         : Pool,
  'BBQ'          : BBQ,
  'Garden'       : Garden,
  'Breakfast'    : Breakfast,
  'Heating'      : Heating,
  'Elevator'     : Elevator,
  'Gym'          : Gym,
  'Beach access' : BeachAccess,
  'Fireplace'    : Fireplace,
};

export const getAmenityIcon = (name) => AMENITY_ICONS[name] || CheckCircle;
