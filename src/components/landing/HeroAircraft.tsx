/**
 * Decorative top-down aircraft for the landing hero.
 *
 * Hand-authored SVG rather than a raster render so it stays crisp at any size
 * and themes itself: every fill references a design token, so the aircraft
 * re-colours with the rest of the app when `.dark` is set. A generated PNG
 * would have needed a second dark-mode asset and a blend-mode cutout.
 */
export function HeroAircraft({className}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 800 620"
      className={className}
      role="presentation"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="aloft-fuselage" x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="var(--surface)" />
          <stop offset="55%" stopColor="var(--surface-2)" />
          <stop offset="100%" stopColor="var(--surface-sunken)" />
        </linearGradient>

        <linearGradient id="aloft-wing" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor="var(--surface-2)" />
          <stop offset="100%" stopColor="var(--accent-100)" />
        </linearGradient>

        <linearGradient id="aloft-stripe" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="var(--grad-from)" />
          <stop offset="55%" stopColor="var(--grad-mid)" />
          <stop offset="100%" stopColor="var(--grad-to)" />
        </linearGradient>

        <linearGradient id="aloft-engine" x1="0" y1="0" x2="1" y2="0.8">
          <stop offset="0%" stopColor="var(--accent-200)" />
          <stop offset="100%" stopColor="var(--accent-300)" />
        </linearGradient>

        <filter id="aloft-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="22"
            floodColor="var(--grad-from)"
            floodOpacity="0.18"
          />
        </filter>
      </defs>

      <g filter="url(#aloft-shadow)">
        {/* horizontal stabilisers */}
        <path
          d="M352 498 L250 556 C245 559 244 565 249 568 L282 576 L354 546 Z"
          fill="url(#aloft-wing)"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M448 498 L550 556 C555 559 556 565 551 568 L518 576 L446 546 Z"
          fill="url(#aloft-wing)"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* main wings */}
        <path
          d="M352 280 L96 424 C88 429 86 438 92 443 L142 456 L354 402 Z"
          fill="url(#aloft-wing)"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M448 280 L704 424 C712 429 714 438 708 443 L658 456 L446 402 Z"
          fill="url(#aloft-wing)"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* winglets */}
        <path
          d="M96 424 L74 402 C70 398 63 400 62 406 L60 428 C59 435 66 440 72 437 Z"
          fill="url(#aloft-stripe)"
          opacity="0.9"
        />
        <path
          d="M704 424 L726 402 C730 398 737 400 738 406 L740 428 C741 435 734 440 728 437 Z"
          fill="url(#aloft-stripe)"
          opacity="0.9"
        />

        {/* engines */}
        <rect
          x="222"
          y="352"
          width="54"
          height="116"
          rx="27"
          fill="url(#aloft-engine)"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
        />
        <rect
          x="236"
          y="366"
          width="26"
          height="26"
          rx="13"
          fill="var(--accent-600)"
          opacity="0.45"
        />
        <rect
          x="524"
          y="352"
          width="54"
          height="116"
          rx="27"
          fill="url(#aloft-engine)"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
        />
        <rect
          x="538"
          y="366"
          width="26"
          height="26"
          rx="13"
          fill="var(--accent-600)"
          opacity="0.45"
        />

        {/* fuselage */}
        <path
          d="M400 42 C428 42 446 90 450 150 L456 300 L456 420 C456 480 448 540 440 572 C434 584 418 590 400 590 C382 590 366 584 360 572 C352 540 344 480 344 420 L344 300 L350 150 C354 90 372 42 400 42 Z"
          fill="url(#aloft-fuselage)"
          stroke="var(--border-strong)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* livery spine stripe */}
        <path
          d="M388 128 L412 128 L417 566 C412 572 388 572 383 566 Z"
          fill="url(#aloft-stripe)"
          opacity="0.85"
        />

        {/* cockpit glazing */}
        <path
          d="M400 62 C414 62 424 84 426 108 C418 100 410 96 400 96 C390 96 382 100 374 108 C376 84 386 62 400 62 Z"
          fill="var(--accent-600)"
          opacity="0.75"
        />

        {/* cabin window lines */}
        <g fill="var(--accent-400)" opacity="0.5">
          <rect x="356" y="200" width="5" height="150" rx="2.5" />
          <rect x="439" y="200" width="5" height="150" rx="2.5" />
        </g>

        {/* tail fin */}
        <path
          d="M400 470 C412 486 420 528 420 566 C420 578 412 584 400 584 C388 584 380 578 380 566 C380 528 388 486 400 470 Z"
          fill="var(--surface)"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
