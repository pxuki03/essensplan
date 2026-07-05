import type { MealSlotConfig, UserSettings } from '../types';

export const defaultMealSlots: MealSlotConfig[] = [
  { id: 'breakfast', label: 'Fruehstueck' },
  { id: 'lunch', label: 'Mittag' },
  { id: 'dinner', label: 'Abend' },
  { id: 'snack', label: 'Snack' }
];

export function mealSlotsFromSettings(settings?: UserSettings): MealSlotConfig[] {
  const slots = settings?.mealSlots?.filter((slot) => slot.id && slot.label.trim());
  return slots && slots.length > 0 ? slots : defaultMealSlots;
}
