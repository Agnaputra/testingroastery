export function getHydratedCartItemCount(hasHydrated: boolean, totalItems: number): number | null {
  return hasHydrated ? totalItems : null;
}
