// Minimal line-icon set, hand-authored from primitives (no icon library
// dependency). One consistent stroke weight/cap style throughout.
import { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconDashboard = () => (
  <svg {...base}>
    <rect x="3.5" y="12" width="4" height="8.5" rx="1" />
    <rect x="10" y="7" width="4" height="13.5" rx="1" />
    <rect x="16.5" y="3.5" width="4" height="17" rx="1" />
  </svg>
);

export const IconHr = () => (
  <svg {...base}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" />
    <circle cx="17.5" cy="7.5" r="2.3" />
    <path d="M15.7 12.2c2.6.3 4.3 2.3 4.8 5" />
  </svg>
);

export const IconPayroll = () => (
  <svg {...base}>
    <rect x="3" y="6.5" width="18" height="12.5" rx="2" />
    <path d="M3 10h18" />
    <circle cx="17" cy="14.5" r="1.6" />
  </svg>
);

export const IconFinance = () => (
  <svg {...base}>
    <path d="M4 19V9M10 19V5M16 19v-7M21 19H3" />
    <path d="M15 6.5l4.5-2.5.5 3" />
  </svg>
);

export const IconInventory = () => (
  <svg {...base}>
    <path d="M3.5 8.2 12 4l8.5 4.2v8L12 20.5l-8.5-4.3z" />
    <path d="M3.5 8.2 12 12l8.5-3.8M12 12v8.5" />
  </svg>
);

export const IconProjects = () => (
  <svg {...base}>
    <rect x="3.5" y="4" width="17" height="16" rx="2" />
    <path d="M8 4v3M16 4v3" />
    <path d="M7.5 12.5l2 2 4-4.2" />
  </svg>
);

export const IconNotifications = () => (
  <svg {...base}>
    <path d="M6 9.5a6 6 0 0 1 12 0c0 4.2 1.3 5.7 1.9 6.3H4.1c.6-.6 1.9-2.1 1.9-6.3Z" />
    <path d="M9.5 18.5a2.6 2.6 0 0 0 5 0" />
  </svg>
);

export const IconAnomalies = () => (
  <svg {...base}>
    <path d="M12 3.5 21.5 20h-19z" />
    <path d="M12 9.5v4.2" />
    <circle cx="12" cy="17" r="0.15" fill="currentColor" stroke="none" />
  </svg>
);

export const IconApprovals = () => (
  <svg {...base}>
    <path d="M12 3.2 4.5 6v6c0 4.6 3.2 7.7 7.5 9 4.3-1.3 7.5-4.4 7.5-9V6z" />
    <path d="M8.7 12.2l2.2 2.2 4.4-4.6" />
  </svg>
);

export const IconAudit = () => (
  <svg {...base}>
    <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
    <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
  </svg>
);

export const IconLogout = () => (
  <svg {...base} width={16} height={16}>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="M16 16l4-4-4-4M20 12H9" />
  </svg>
);

export const IconSun = () => (
  <svg {...base} width={15} height={15}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.3M12 19.2v2.3M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6" />
  </svg>
);

export const IconMoon = () => (
  <svg {...base} width={15} height={15}>
    <path d="M20 13.2A8.2 8.2 0 1 1 10.8 4 6.4 6.4 0 0 0 20 13.2Z" />
  </svg>
);

export const IconSystem = () => (
  <svg {...base} width={15} height={15}>
    <rect x="3.5" y="4.5" width="17" height="11.5" rx="1.5" />
    <path d="M8.5 20h7M12 16v4" />
  </svg>
);
