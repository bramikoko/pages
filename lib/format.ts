import { profile } from "@/lib/data";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: profile.timeZone,
});

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: profile.timeZone,
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso)).toLowerCase();
}

export function formatDateTime(iso: string): string {
  return `${dateTimeFormat.format(new Date(iso)).toLowerCase()} ${profile.timeZoneLabel}`;
}
