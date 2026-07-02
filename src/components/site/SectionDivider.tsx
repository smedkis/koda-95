// Full-bleed horizontal divider — breaks out to the full viewport width
// while staying nested inside the page's single Container, so the
// container's left/right border lines stay continuous.
export function SectionDivider() {
  return (
    <div className="w-screen border-b border-divider ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]" />
  );
}
