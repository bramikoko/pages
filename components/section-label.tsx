export default function SectionLabel({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <div className="label flex items-center gap-3">
      <span>{index}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      <span>{label}</span>
    </div>
  );
}
