export const MEMBER_COLORS = [
  '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#22c55e', '#f97316',
  '#64748b', '#a855f7',
]

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const
export const WORKOUT_TYPES = ['Strength', 'Running', 'Walking', 'Cycling', 'Sports', 'HYROX', 'Custom'] as const
export const WORKOUT_ICONS: Record<string, string> = {
  Strength: '🏋️', Running: '🏃', Walking: '🚶',
  Cycling: '🚴', Sports: '⚽', HYROX: '💪', Custom: '⭐',
}
export const MEAL_EMOJIS: Record<string, string> = {
  Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snacks: '🍎',
}

export const DEFAULT_MEMBERS = [
  { name: 'Sebas', color: MEMBER_COLORS[0] },
  { name: 'Maria', color: MEMBER_COLORS[1] },
  { name: 'Maria Cris', color: MEMBER_COLORS[2] },
  { name: 'Beto', color: MEMBER_COLORS[3] },
  { name: 'Cristi', color: MEMBER_COLORS[4] },
  { name: 'Dean', color: MEMBER_COLORS[5] },
  { name: 'Savannah', color: MEMBER_COLORS[6] },
]

export function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function getMemberColor(name: string, members: { name: string; color: string }[]): string {
  const member = members.find(m => m.name === name)
  if (member) return member.color
  const idx = name.charCodeAt(0) % MEMBER_COLORS.length
  return MEMBER_COLORS[idx]
}

export function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export async function uploadImage(
  file: File,
  bucket: string,
  path: string
): Promise<string | null> {
  const { supabase } = await import('./supabase')
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })
  if (error) { console.error('Upload error:', error); return null }
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}
