/**
 * Safe date and time formatting utilities.
 * Anchors timestamps to Asia/Manila (PHT) timezone to ensure identical output
 * during SSR and client hydration, eliminating hydration mismatch errors.
 */

export function formatBatchTime(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila',
    }).format(date);
  } catch {
    return '';
  }
}
