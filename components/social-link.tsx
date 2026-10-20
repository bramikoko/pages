import type { Social } from "@/lib/data";
import SocialIcon from "./social-icon";

export default function SocialLink({
  social,
  className = "",
  compact = false,
}: {
  social: Social;
  className?: string;
  compact?: boolean;
}) {
  const external = social.href.startsWith("http");

  return (
    <a
      href={social.href}
      {...(external
        ? { target: "_blank", rel: "noreferrer noopener" }
        : undefined)}
      aria-label={`${social.label}, ${social.handle}${external ? ", opens in a new tab" : ""}`}
      className={`group inline-flex min-h-11 items-center gap-2 border border-line px-4 py-2 transition-colors hover:bg-ink hover:text-paper ${className}`}
    >
      <SocialIcon icon={social.icon} className="h-4 w-4 shrink-0" />
      <span className="label">{compact ? social.label : social.handle}</span>
    </a>
  );
}
