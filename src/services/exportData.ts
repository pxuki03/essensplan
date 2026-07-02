import { db } from '../db/db';

export async function exportEssensplanData() {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    recipes: await db.recipes.toArray(),
    recipeIngredients: await db.recipeIngredients.toArray(),
    foodProducts: await db.foodProducts.toArray(),
    mealPlanEntries: await db.mealPlanEntries.toArray(),
    pantryItems: await db.pantryItems.toArray(),
    shoppingLists: await db.shoppingLists.toArray(),
    shoppingListItems: await db.shoppingListItems.toArray(),
    stores: await db.stores.toArray(),
    priceObservations: await db.priceObservations.toArray(),
    userSettings: await db.userSettings.toArray()
  };
}
