import React from "react";
import {
  ArrowUpRight,
  Code2,
  Gamepad2,
  Link2,
  Music,
  Palette,
} from "lucide-react";
import type { PublicTeamLink } from "@/data/teamData";

function WebsiteWindowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="3.5"
        width="20"
        height="17"
        rx="2.75"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M2 8.75h20" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="5.75" cy="6.1" r="1.05" fill="currentColor" />
      <circle cx="9" cy="6.1" r="1.05" fill="currentColor" />
      <circle cx="12.25" cy="6.1" r="1.05" fill="currentColor" />
      <path
        d="M6 13.1h6.5M6 16.5h11.5"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SocialPlatformIcon({
  platform,
  className = "lunoris-social-chip-icon",
}: {
  platform?: string;
  className?: string;
}) {
  switch (platform) {
    case "github":
    case "github_pages":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.12 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
      );
    case "gitlab":
    case "gitlab_pages":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="m22.65 14.39-1.62-4.98-3.22-9.88a.48.48 0 0 0-.91 0L13.9 8.76H10.1L7.1.53a.48.48 0 0 0-.91 0L2.97 9.41 1.35 14.4a.97.97 0 0 0 .35 1.09L12 23l10.3-7.51a.97.97 0 0 0 .35-1.1Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14Zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75ZM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68Zm1.39 9.94v-8.37H5.5v8.37h2.77Z" />
        </svg>
      );
    case "x":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
        </svg>
      );
    case "bluesky":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 10.8c-1.09-2.11-4.05-6.05-6.8-8.02C2.56.9 1.56 1.22.9 1.52.13 1.87 0 3.05 0 3.76c0 .72.39 5.89.65 6.75.84 2.83 3.84 3.79 6.6 3.47-4.43.66-5.58 2.84-3.14 5.42 4.65 4.92 6.68-1.23 7.89-4.18 1.21 2.95 3.09 9.01 7.89 4.18 2.44-2.58 1.29-4.76-3.14-5.42 2.76.32 5.76-.64 6.6-3.47.26-.86.65-6.03.65-6.75 0-.71-.13-1.89-.9-2.24-.66-.3-1.66-.62-4.3 1.26-2.75 1.97-5.71 5.91-6.8 8.02Z" />
        </svg>
      );
    case "telegram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M21.94 4.66c.32-1.36-.5-1.9-1.44-1.55L2.55 10.04c-1.22.48-1.2 1.16-.22 1.46l4.6 1.44 10.67-6.73c.5-.31.96-.14.58.2l-8.65 7.8-.33 4.74c.48 0 .69-.22.96-.48l2.3-2.24 4.78 3.53c.88.49 1.51.24 1.73-.81l2.97-14.29Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.6 15.57V8.43L15.82 12 9.6 15.57Z" />
        </svg>
      );
    case "artstation":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M1.77 16.82 3.5 19.8a2.14 2.14 0 0 0 1.86 1.07h11.6l-2.4-4.05H1.77Zm20.46.03c0-.42-.13-.82-.36-1.17L14.87 3.5A2.14 2.14 0 0 0 13.02 2.4h-3.6l10.52 18.23 1.68-2.9c.34-.54.61-.81.61-.88ZM11.4 13.5 6.62 5.23 1.85 13.5h9.55Z" />
        </svg>
      );
    case "behance":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M8.84 10.84c1.38-.46 2.09-1.37 2.09-2.81 0-2.55-1.9-3.53-4.53-3.53H0v14.77h6.66c3 0 5.01-1.45 5.01-4.35 0-2.01-.97-3.48-2.83-4.08ZM3.24 7.05h2.77c1.14 0 1.94.45 1.94 1.54 0 1.12-.74 1.61-1.88 1.61H3.24V7.05Zm3.08 9.64H3.24v-3.6h3.16c1.34 0 2.18.56 2.18 1.83 0 1.29-.89 1.77-2.26 1.77Zm12.01-11.2h-6.01v1.61h6.01V5.49Zm.21 3c-3.44 0-5.66 2.46-5.66 5.69 0 3.45 2.17 5.62 5.79 5.62 2.57 0 4.46-1.18 5.14-3.57h-2.7c-.38.94-1.26 1.43-2.36 1.43-1.71 0-2.79-1.02-2.88-2.84h8.12c.07-.38.11-.81.11-1.25 0-3.13-2.09-5.08-5.56-5.08Zm-2.61 4.48c.21-1.47 1.15-2.37 2.57-2.37 1.45 0 2.34.91 2.5 2.37h-5.07Z" />
        </svg>
      );
    case "dribbble":
    case "cara":
    case "deviantart":
    case "sketchfab":
    case "figma":
      return <Palette className={className} aria-hidden="true" />;
    case "discord":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.07.04c-.21.37-.44.86-.61 1.25a18.27 18.27 0 0 0-5.5 0 12.6 12.6 0 0 0-.62-1.25.07.07 0 0 0-.07-.04c-1.68.29-3.32.8-4.89 1.52a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.05 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.22-2a.07.07 0 0 0-.04-.1 13.1 13.1 0 0 1-1.87-.9.07.07 0 0 1-.01-.12c.13-.09.25-.19.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01c.12.1.25.2.37.29a.07.07 0 0 1 0 .12c-.6.35-1.22.65-1.88.9a.07.07 0 0 0-.04.1c.36.7.77 1.37 1.22 2a.08.08 0 0 0 .08.03 19.84 19.84 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.68-3.55-13.66a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Z" />
        </svg>
      );
    case "twitch":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M11.57 4.71h1.71v5.14h-1.71V4.71Zm4.72 0H18v5.14h-1.71V4.71ZM6 0 1.71 4.29v15.42h5.15V24l4.28-4.29h3.43L22.29 12V0H6Zm14.57 11.14-3.43 3.43h-3.43l-3 3v-3H6.86V1.71h13.71v9.43Z" />
        </svg>
      );
    case "instagram":
    case "threads":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
        </svg>
      );
    case "tiktok":
    case "soundcloud":
    case "bandcamp":
    case "spotify":
      return <Music className={className} aria-hidden="true" />;
    case "steam":
    case "itchio":
      return <Gamepad2 className={className} aria-hidden="true" />;
    case "devto":
    case "medium":
      return <Code2 className={className} aria-hidden="true" />;
    case "reddit":
    case "facebook":
    case "vk":
    case "vimeo":
      return <WebsiteWindowIcon className={className} />;
    default:
      return <Link2 className={className} aria-hidden="true" />;
  }
}

export function TeamSocialLinks({
  links,
  memberName,
  variant = "roster",
}: {
  links?: PublicTeamLink[];
  memberName: string;
  variant?: "leader" | "roster";
}) {
  if (!links || links.length === 0) return null;

  return (
    <div
      className={`lunoris-roster-links${
        variant === "leader" ? " lunoris-leader-links" : ""
      }`}
    >
      {links.map((link) => {
        const displayLabel = link.label || "Portfolio";
        return (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="lunoris-roster-link-chip"
            aria-label={`${memberName} — ${displayLabel}`}
            title={displayLabel}
          >
            <SocialPlatformIcon platform={link.platform} />
            <span>{displayLabel}</span>
            <ArrowUpRight
              className="lunoris-social-chip-arrow"
              aria-hidden="true"
            />
          </a>
        );
      })}
    </div>
  );
}
