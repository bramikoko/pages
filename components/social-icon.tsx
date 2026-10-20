import { Mail } from "lucide-react";
import { techIcons } from "@/lib/tech-icons";

export default function SocialIcon({
  icon,
  className = "h-4 w-4",
}: {
  icon: "github" | "codeberg" | "instagram" | "reddit" | "whatsapp" | "mail";
  className?: string;
}) {
  if (icon === "mail") {
    return <Mail aria-hidden="true" className={className} strokeWidth={1.8} />;
  }

  const brand = techIcons[icon];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d={brand.path} />
    </svg>
  );
}
