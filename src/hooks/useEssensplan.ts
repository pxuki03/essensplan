import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { seedDemoData } from '../data/seed';
import { db } from '../db/db';

export function useEssensplanData() {
  useEffect(() => {
    void seedDemoData();
  }, []);

  return {
    recipes: useLiveQuery(() => db.recipes.orderBy('title').toArray(), [], []),
    ingredients: useLiveQuery(() => db.recipeIngredients.toArray(), [], []),
    meals: useLiveQuery(() => db.mealPlanEntries.orderBy('date').toArray(), [], []),
    pantry: useLiveQuery(() => db.pantryItems.orderBy('expiresAt').toArray(), [], []),
    lists: useLiveQuery(() => db.shoppingLists.orderBy('createdAt').reverse().toArray(), [], []),
    listItems: useLiveQuery(() => db.shoppingListItems.toArray(), [], []),
    stores: useLiveQuery(() => db.stores.orderBy('name').toArray(), [], []),
    prices: useLiveQuery(() => db.priceObservations.orderBy('observedAt').reverse().toArray(), [], []),
    settings: useLiveQuery(() => db.userSettings.get('default'), [], undefined)
  };
}
