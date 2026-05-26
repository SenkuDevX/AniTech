export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)\s*(min|mins|minutes|h|hr|hrs|hours|ep|eps|episode)?$/i);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = (match[2] || 'min').toLowerCase();
  if (['h', 'hr', 'hrs', 'hours'].includes(unit)) return value * 60;
  return value;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function paginate(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function mergeArrays<T>(...arrays: T[][]): T[] {
  const seen = new Set<string>();
  return arrays.flat().filter((item) => {
    const key = typeof item === 'object' ? JSON.stringify(item) : String(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
