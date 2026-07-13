// Builds a compact page list (first page, a window around the current
// page, last page, with "…" markers for the gaps) instead of rendering
// every page number — a table with 160 rows at 10/page would otherwise
// show 16 page buttons in a row.
export type PaginationItem = number | "dots";

export function getPaginationRange(
  current: number,
  total: number,
  siblingCount = 1,
): PaginationItem[] {
  const totalVisible = siblingCount * 2 + 5; // first + last + current + 2 siblings + 2 dots
  if (totalVisible >= total) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: 3 + siblingCount * 2 }, (_, index) => index + 1);
    return [...leftRange, "dots", total];
  }

  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + siblingCount * 2;
    const rightRange = Array.from({ length: rightCount }, (_, index) => total - rightCount + 1 + index);
    return [1, "dots", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, index) => leftSibling + index,
  );
  return [1, "dots", ...middleRange, "dots", total];
}
