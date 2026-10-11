import type { DietaryTag } from '@sweet-hand/components';

/** The words for the fixed dietary list (L2-017.3), from the resource files. */
export const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegetarian: $localize`:@@dietary.vegetarian:Vegetarian`,
  vegan: $localize`:@@dietary.vegan:Vegan`,
  'gluten-free': $localize`:@@dietary.glutenFree:Gluten-free`,
  'dairy-free': $localize`:@@dietary.dairyFree:Dairy-free`,
  halal: $localize`:@@dietary.halal:Halal`,
  'contains-nuts': $localize`:@@dietary.containsNuts:Contains nuts`,
  'contains-shellfish': $localize`:@@dietary.containsShellfish:Contains shellfish`,
  spicy: $localize`:@@dietary.spicy:Spicy`,
};
