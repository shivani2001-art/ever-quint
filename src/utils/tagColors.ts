const TAG_COLORS = [
  '#A855F7', // purple
  '#3B82F6', // blue
  '#14B8A6', // teal
  '#F59E0B', // amber
  '#EC4899', // pink
  '#22C55E', // green
  '#6366F1', // indigo
  '#EF4444', // red
];

export function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]!;
}
