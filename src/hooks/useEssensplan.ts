import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';
import { seedDemoData } from '../data/seed';
import { db } from '../db/db';
import type {
  MealPlanEntry,
  PantryItem,
  PriceObservation,
  Recipe,
  RecipeIngredient,
  ShoppingList,
  ShoppingListItem,
  Store,
  UserSettings
} from '../types';

interface EssensplanData {
  recipes: Recipe[];
  ingredients: RecipeIngredient[];
  meals: MealPlanEntry[];
  pantry: PantryItem[];
  lists: ShoppingList[];
  listItems: ShoppingListItem[];
  stores: Store[];
  prices: PriceObservation[];
  settings?: UserSettings;
  error?: string;
}

const emptyData: EssensplanData = {
  recipes: [],
  ingredients: [],
  meals: [],
  pantry: [],
  lists: [],
  listItems: [],
  stores: [],
  prices: []
};

async function loadData(): Promise<EssensplanData> {
  await seedDemoData();

  const [recipes, ingredients, meals, pantry, lists, listItems, stores, prices, settings] =
    await Promise.all([
      db.recipes.orderBy('title').toArray(),
      db.recipeIngredients.toArray(),
      db.mealPlanEntries.orderBy('date').toArray(),
      db.pantryItems.toArray(),
      db.shoppingLists.toArray(),
      db.shoppingListItems.toArray(),
      db.stores.orderBy('name').toArray(),
      db.priceObservations.toArray(),
      db.userSettings.get('default')
    ]);

  return {
    recipes,
    ingredients,
    meals,
    pantry: pantry.sort((a, b) => (a.expiresAt ?? '9999').localeCompare(b.expiresAt ?? '9999')),
    lists: lists.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    listItems,
    stores,
    prices: prices.sort((a, b) => b.observedAt.localeCompare(a.observedAt)),
    settings
  };
}

export function useEssensplanData() {
  const [data, setData] = useState<EssensplanData>(emptyData);

  useEffect(() => {
    const subscription = liveQuery(loadData).subscribe({
      next: setData,
      error: (error) => {
        console.error('Essensplan database error', error);
        setData({
          ...emptyData,
          error:
            error instanceof Error
              ? error.message
              : 'Die lokale Essensplan-Datenbank konnte nicht geladen werden.'
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return data;
}
