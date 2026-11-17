/**
 * In-game pictures of where to put the Ancient of War at a camp so the creeps can't kill it.
 * Files live in public/aow/<map id>/<camp id>.webp. Mirrored camps need their own picture.
 */
const AOW_SPOTS: Record<string, string[]> = {
  hammerfall: ['orange-camp-rock-golem-1'],
  last_refuge: ['orange-camp-shop-1'],
  springtime: ['orange-camp-sasquatch-1'],
}

export function aowSpot(mapId: string, campId: string | undefined): string | null {
  if (!campId || !AOW_SPOTS[mapId]?.includes(campId)) return null
  return `${import.meta.env.BASE_URL}aow/${mapId}/${campId}.webp`
}
