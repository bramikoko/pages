export default function SectionMark({
  index,
  className = "",
}: {
  index: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`section-mark display pointer-events-none absolute select-none ${className}`}
    >
      {index}
    </span>
  );
}
