interface IconProps {
  active?: boolean;
  className?: string;
  size?: number;
}

export function Home({ active, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V16H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        fill={active ? 'var(--accent-500)' : 'none'}
        stroke={active ? 'var(--accent-500)' : 'currentColor'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Calendar({ active, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect
        x="3" y="4" width="18" height="18" rx="3"
        fill={active ? 'var(--accent-500)' : 'none'}
        stroke={active ? 'var(--accent-500)' : 'currentColor'}
        strokeWidth="1.8"
      />
      <path d="M3 9H21" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.8" />
      <path d="M8 2V6M16 2V6" stroke={active ? 'var(--accent-500)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1.2" fill={active ? 'white' : 'currentColor'} />
      <circle cx="12" cy="14" r="1.2" fill={active ? 'white' : 'currentColor'} />
      <circle cx="16" cy="14" r="1.2" fill={active ? 'white' : 'currentColor'} />
    </svg>
  );
}

export function Users({ active, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" fill={active ? 'var(--accent-500)' : 'none'} stroke={active ? 'var(--accent-500)' : 'currentColor'} strokeWidth="1.8" />
      <path d="M3 20C3 16.6863 5.68629 14 9 14C12.3137 14 15 16.6863 15 20" stroke={active ? 'var(--accent-500)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 4C17.6569 4 19 5.34315 19 7C19 8.65685 17.6569 10 16 10" stroke={active ? 'var(--accent-500)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 20C21 16.6863 19.3431 14 17 14" stroke={active ? 'var(--accent-500)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Focus({ active, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9"
        fill={active ? 'var(--accent-500)' : 'none'}
        stroke={active ? 'var(--accent-500)' : 'currentColor'}
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4"
        fill={active ? 'white' : 'none'}
        stroke={active ? 'white' : 'currentColor'}
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="1.5" fill={active ? 'var(--accent-500)' : 'currentColor'} />
      <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke={active ? 'var(--accent-500)' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Settings({ active, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3"
        fill={active ? 'var(--accent-500)' : 'none'}
        stroke={active ? 'var(--accent-500)' : 'currentColor'}
        strokeWidth="1.8"
      />
      <path
        d="M12 2C12.5523 2 13 2.44772 13 3V4.062C13.663 4.197 14.294 4.43 14.875 4.753L15.62 4.008C16.0105 3.6175 16.6437 3.6175 17.0342 4.008L18.992 5.9658C19.3825 6.35633 19.3825 6.98949 18.992 7.38L18.247 8.125C18.57 8.706 18.803 9.337 18.938 10H20C20.5523 10 21 10.4477 21 11V13C21 13.5523 20.5523 14 20 14H18.938C18.803 14.663 18.57 15.294 18.247 15.875L18.992 16.62C19.3825 17.0105 19.3825 17.6437 18.992 18.0342L17.0342 19.992C16.6437 20.3825 16.0105 20.3825 15.62 19.992L14.875 19.247C14.294 19.57 13.663 19.803 13 19.938V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V19.938C10.337 19.803 9.706 19.57 9.125 19.247L8.38 19.992C7.98947 20.3825 7.35631 20.3825 6.96578 19.992L5.00802 18.0342C4.61749 17.6437 4.61749 17.0105 5.00802 16.62L5.753 15.875C5.43 15.294 5.197 14.663 5.062 14H4C3.44772 14 3 13.5523 3 13V11C3 10.4477 3.44772 10 4 10H5.062C5.197 9.337 5.43 8.706 5.753 8.125L5.008 7.38C4.6175 6.98947 4.6175 6.35631 5.008 5.96578L6.96578 4.00802C7.35631 3.61749 7.98947 3.61749 8.38 4.00802L9.125 4.753C9.706 4.43 10.337 4.197 11 4.062V3C11 2.44772 11.4477 2 12 2Z"
        fill={active ? 'var(--accent-500)' : 'none'}
        stroke={active ? 'var(--accent-500)' : 'currentColor'}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
