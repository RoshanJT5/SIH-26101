import type { SVGProps } from "react";

function SvgIcon(props: SVGProps<SVGSVGElement>) {
  const { children, className, ...rest } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="M16 16L21 21" />
    </SvgIcon>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M15 17H9" />
      <path d="M18 17H6l1.2-1.3V11a4.8 4.8 0 1 1 9.6 0v4.7L18 17Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </SvgIcon>
  );
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
    </SvgIcon>
  );
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M20 14.8A7.9 7.9 0 0 1 9.2 4a8 8 0 1 0 10.8 10.8Z" />
    </SvgIcon>
  );
}

export function GovernmentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M4 10.5 12 5l8 5.5" />
      <path d="M6 10.5V18h12v-7.5" />
      <path d="M9 18v-5h6v5" />
      <path d="M12 5v3" />
    </SvgIcon>
  );
}

export function RobotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="6" width="16" height="12" rx="3" />
      <path d="M9 10h6" />
      <path d="M8 6V3.5M16 6V3.5" />
      <circle cx="9" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M10 15.5h4" />
      <path d="M12 18v2" />
    </SvgIcon>
  );
}

export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
      <circle cx="10" cy="8" r="3.2" />
      <path d="M20 19v-1a4 4 0 0 0-3-3.8" />
      <path d="M16.5 4.5a3 3 0 0 1 0 5.7" />
    </SvgIcon>
  );
}

export function BookOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v14H6.5A2.5 2.5 0 0 0 4 20.5v-14Z" />
      <path d="M4 6.5V19" />
      <path d="M20 4v14" />
    </SvgIcon>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M5 12.5 9.5 17 19 7.5" />
    </SvgIcon>
  );
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.5 11 15l5-5.5" />
    </SvgIcon>
  );
}

export function TrendingUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M4 16.5 10 10.5l4 4 6-8" />
      <path d="M15 6.5h5v5" />
    </SvgIcon>
  );
}

export function FileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M14 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V8.5L14 3.5Z" />
      <path d="M14 3.5V8.5h5" />
      <path d="M8.5 12.5h7M8.5 16h7" />
    </SvgIcon>
  );
}

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="m18 15 1 2.5L21.5 19 19 20l-1 2.5L17 20l-2.5-1 2.5-1 1-2.5Z" />
    </SvgIcon>
  );
}

export function MapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M9 18 3.5 20V6L9 4l6 2 5.5-2v14L15 18l-6 2Z" />
      <path d="M9 4v14M15 6v14" />
    </SvgIcon>
  );
}

export function ClipboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M9 4.5h6a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z" />
      <path d="M9 5.5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4v1.5" />
      <path d="M9 11.5h6M9 15.5h6" />
    </SvgIcon>
  );
}

export function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 10.5v5" />
      <path d="M12 7.8h.01" />
    </SvgIcon>
  );
}

export function ArrowUpRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </SvgIcon>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </SvgIcon>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </SvgIcon>
  );
}

export function DotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <SvgIcon {...props}>
      <path d="M4 16.5V20h3.5L17.5 9l-3.5-3.5L4 16.5Z" />
      <path d="m13.5 5.5 3.5 3.5" />
    </SvgIcon>
  );
}
