/*
  Íconos propios en SVG, sin librerías externas (así no dependemos
  de npm ni de un bundler para que funcione con Live Server).
  Todos comparten el mismo "wrapper" con stroke a 2px, estilo lineal.
*/

const IconBase = ({ size = 18, className = "", children, style, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
    {...rest}
  >
    {children}
  </svg>
);

const Mail = (props) => (
  <IconBase {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </IconBase>
);

const Lock = (props) => (
  <IconBase {...props}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </IconBase>
);

const Eye = (props) => (
  <IconBase {...props}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </IconBase>
);

const EyeOff = (props) => (
  <IconBase {...props}>
    <path d="M9.9 5.2A10.4 10.4 0 0 1 12 5c6 0 10 7 10 7a17.6 17.6 0 0 1-3.2 3.9" />
    <path d="M6.2 6.3C3.8 7.8 2 12 2 12s4 7 10 7c1.4 0 2.7-.3 3.9-.8" />
    <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
    <path d="M3 3l18 18" />
  </IconBase>
);

const User = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </IconBase>
);

const Building2 = (props) => (
  <IconBase {...props}>
    <rect x="4" y="3" width="10" height="18" />
    <rect x="14" y="9" width="6" height="12" />
    <path d="M8 7h2M8 11h2M8 15h2" />
  </IconBase>
);

const Phone = (props) => (
  <IconBase {...props}>
    <path d="M5 4h3.5l1.7 4.3-2.1 1.5a11.4 11.4 0 0 0 5.1 5.1l1.5-2.1L19 14.5V18a2 2 0 0 1-2 2C10.5 20 4 13.5 4 6a2 2 0 0 1 1-2Z" />
  </IconBase>
);

const MapPin = (props) => (
  <IconBase {...props}>
    <path d="M12 22s7-7.4 7-12a7 7 0 1 0-14 0c0 4.6 7 12 7 12Z" />
    <circle cx="12" cy="10" r="2.5" />
  </IconBase>
);

const MessageSquare = (props) => (
  <IconBase {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
  </IconBase>
);

const ArrowRight = (props) => (
  <IconBase {...props}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </IconBase>
);

const ArrowLeft = (props) => (
  <IconBase {...props}>
    <path d="M19 12H5" />
    <path d="m11 18-6-6 6-6" />
  </IconBase>
);

const CheckCircle2 = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m8 12 3 3 5-6" />
  </IconBase>
);

const Loader2 = (props) => (
  <IconBase {...props}>
    <path d="M12 2v4" />
    <path d="m16.9 7.1 2.8-2.8" />
    <path d="M18 12h4" />
    <path d="m16.9 16.9 2.8 2.8" />
    <path d="M12 18v4" />
    <path d="m4.3 19.7 2.8-2.8" />
    <path d="M2 12h4" />
    <path d="m4.3 4.3 2.8 2.8" />
  </IconBase>
);

const LogIn = (props) => (
  <IconBase {...props}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </IconBase>
);

const UserPlus = (props) => (
  <IconBase {...props}>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21c0-4 3-6 7-6s7 2 7 6" />
    <path d="M19 8v6" />
    <path d="M22 11h-6" />
  </IconBase>
);

const HelpCircle = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.1 9a3 3 0 1 1 4 2.8c-.9.4-1.6 1.1-1.6 2.2" />
    <path d="M12 17h.01" />
  </IconBase>
);

const ClipboardCheck = (props) => (
  <IconBase {...props}>
    <rect x="6" y="4" width="12" height="17" rx="2" />
    <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
    <path d="m9 13 2 2 4-4" />
  </IconBase>
);

const PackageSearch = (props) => (
  <IconBase {...props}>
    <path d="M21 8v8l-9 5-9-5V8l9-5 9 5Z" />
    <path d="M3.3 8.6 12 13l8.7-4.4" />
    <path d="M12 13v9" />
  </IconBase>
);

const Truck = (props) => (
  <IconBase {...props}>
    <rect x="1" y="7" width="14" height="10" />
    <path d="M15 10h4l3 3v4h-7z" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
  </IconBase>
);

const ShieldCheck = (props) => (
  <IconBase {...props}>
    <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5Z" />
    <path d="m9 12 2 2 4-4" />
  </IconBase>
);

const Paintbrush = (props) => (
  <IconBase {...props}>
    <path d="M18.4 3.6a2 2 0 0 1 2.8 2.8L15 12.6l-2.8-2.8Z" />
    <path d="M11 10.6 4.5 17c-1 1-1 2.6 0 3.6s2.6 1 3.6 0l6.4-6.5" />
  </IconBase>
);

const LogOut = (props) => (
  <IconBase {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </IconBase>
);

const RotateCcw = (props) => (
  <IconBase {...props}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 3v6h6" />
  </IconBase>
);
