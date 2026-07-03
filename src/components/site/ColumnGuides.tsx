// Purely decorative: splits the content area into 5 equal columns, showing
// only the divider between the details column and the form column. Sits
// behind the actual content.
export function ColumnGuides() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 grid grid-cols-5">
      <div />
      <div />
      <div className="border-l border-divider" />
      <div />
      <div />
    </div>
  );
}
