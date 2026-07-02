import type { MealPlanEntry, PantryItem, RecipeIngredient, ShoppingListItem } from '../types';

export function generateShoppingItems(entries: MealPlanEntry[], ingredients: RecipeIngredient[], pantry: PantryItem[], shoppingListId: number): ShoppingListItem[] {
  const grouped = new Map<string, ShoppingListItem>();
  for (const entry of entries) {
    if (!entry.recipeId) continue;
    for (const ingredient of ingredients.filter((item) => item.recipeId === entry.recipeId)) {
      const key = ingredient.name.toLowerCase() + '|' + ingredient.unit;
      const existing = grouped.get(key);
      const quantity = ingredient.quantity * Math.max(entry.servings, 1);
      if (existing) existing.neededQuantity += quantity;
      else grouped.set(key, { shoppingListId, name: ingredient.name, category: ingredient.category, neededQuantity: quantity, pantryDeduction: 0, unit: ingredient.unit, checked: false, foodProductId: ingredient.foodProductId });
    }
  }
  return Array.from(grouped.values()).map((item) => {
    const available = pantry.filter((pantryItem) => pantryItem.name.toLowerCase() === item.name.toLowerCase() && pantryItem.unit === item.unit).reduce((sum, pantryItem) => sum + pantryItem.quantity, 0);
    return { ...item, pantryDeduction: Math.min(item.neededQuantity, available) };
  });
}

export const remainingQuantity = (item: ShoppingListItem) => Math.max(item.neededQuantity - item.pantryDeduction, 0);
