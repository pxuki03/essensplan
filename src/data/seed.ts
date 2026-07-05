import { db } from '../db/db';
import { defaultMealSlots } from '../services/mealSlots';
import type { MealPlanEntry, PantryItem, PriceObservation, Recipe, RecipeIngredient, ShoppingList, ShoppingListItem, Store, UserSettings } from '../types';

const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export async function seedDemoData() {
  const recipeCount = await db.recipes.count();
  if (recipeCount > 0) return;

  const settings: UserSettings = {
    id: 'default',
    dailyCalorieGoal: 2100,
    dailyProteinGoal: 95,
    dailyCarbohydrateGoal: 260,
    dailyFatGoal: 80,
    mealSlots: defaultMealSlots,
    preferredUnit: 'g'
  };
  await db.userSettings.put(settings);

  const stores: Store[] = [{ name: 'REWE' }, { name: 'Wochenmarkt' }, { name: 'dm' }];
  const storeIds = await db.stores.bulkAdd(stores, { allKeys: true });

  const recipes: Recipe[] = [
    { title: 'Linsen-Bolognese', servings: 4, mealTypes: ['dinner', 'lunch'], notes: 'Mit Vollkornnudeln und Basilikum servieren.', tags: ['meal prep', 'protein'], createdAt: now(), updatedAt: now() },
    { title: 'Skyr-Beeren-Bowl', servings: 1, mealTypes: ['breakfast', 'snack'], notes: 'Optional mit Nuessen toppen.', tags: ['schnell'], createdAt: now(), updatedAt: now() },
    { title: 'Tofu-Gemuese-Pfanne', servings: 2, mealTypes: ['dinner'], notes: 'Sojasauce erst am Ende zugeben.', tags: ['vegan', 'schnell'], createdAt: now(), updatedAt: now() }
  ];
  const recipeIds = await db.recipes.bulkAdd(recipes, { allKeys: true });

  await db.recipeIngredients.bulkAdd([
    { recipeId: Number(recipeIds[0]), name: 'Rote Linsen', quantity: 240, unit: 'g', category: 'Trockenware', nutritionPer100: { calories: 352, protein: 24, carbohydrates: 52, fat: 2, fiber: 11, sugar: 2, source: 'manual' } },
    { recipeId: Number(recipeIds[0]), name: 'Tomaten passiert', quantity: 500, unit: 'g', category: 'Konserven', nutritionPer100: { calories: 32, protein: 1.5, carbohydrates: 5, fat: 0.2, source: 'manual' } },
    { recipeId: Number(recipeIds[1]), name: 'Skyr Natur', quantity: 250, unit: 'g', category: 'Kuehlregal', nutritionPer100: { calories: 65, protein: 11, carbohydrates: 4, fat: 0.2, source: 'manual' } },
    { recipeId: Number(recipeIds[1]), name: 'Beerenmix', quantity: 120, unit: 'g', category: 'Obst', nutritionPer100: { calories: 48, protein: 1, carbohydrates: 8, fat: 0.5, fiber: 4, source: 'manual' } },
    { recipeId: Number(recipeIds[2]), name: 'Tofu natur', quantity: 300, unit: 'g', category: 'Kuehlregal', nutritionPer100: { calories: 144, protein: 16, carbohydrates: 2, fat: 8, source: 'manual' } },
    { recipeId: Number(recipeIds[2]), name: 'Brokkoli', quantity: 400, unit: 'g', category: 'Gemuese', nutritionPer100: { calories: 34, protein: 2.8, carbohydrates: 3, fat: 0.4, fiber: 3, source: 'manual' } }
  ] as RecipeIngredient[]);

  await db.mealPlanEntries.bulkAdd([
    { date: today(), slot: 'breakfast', recipeId: Number(recipeIds[1]), servings: 1 },
    { date: today(), slot: 'dinner', recipeId: Number(recipeIds[0]), servings: 1 },
    { date: addDays(1), slot: 'dinner', recipeId: Number(recipeIds[2]), servings: 1 }
  ] as MealPlanEntry[]);

  await db.pantryItems.bulkAdd([
    { name: 'Rote Linsen', quantity: 100, unit: 'g', category: 'Trockenware', updatedAt: now() },
    { name: 'Brokkoli', quantity: 150, unit: 'g', category: 'Gemuese', expiresAt: addDays(2), updatedAt: now() }
  ] as PantryItem[]);

  const listId = Number(await db.shoppingLists.add({ title: 'Wocheneinkauf', status: 'active', fromDate: today(), toDate: addDays(6), createdAt: now() } as ShoppingList));
  await db.shoppingListItems.bulkAdd([
    { shoppingListId: listId, name: 'Rote Linsen', category: 'Trockenware', neededQuantity: 240, pantryDeduction: 100, unit: 'g', storeId: Number(storeIds[0]), checked: false },
    { shoppingListId: listId, name: 'Tofu natur', category: 'Kuehlregal', neededQuantity: 300, pantryDeduction: 0, unit: 'g', storeId: Number(storeIds[0]), checked: false }
  ] as ShoppingListItem[]);

  await db.priceObservations.add({ itemName: 'Tofu natur', storeId: Number(storeIds[0]), price: 2.49, packageQuantity: 200, unit: 'g', observedAt: today() } as PriceObservation);
}
