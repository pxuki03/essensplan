import Dexie, { type Table } from 'dexie';
import type { FoodProduct, MealPlanEntry, PantryItem, PriceObservation, Recipe, RecipeIngredient, ShoppingList, ShoppingListItem, Store, UserSettings } from '../types';

export class EssensplanDatabase extends Dexie {
  recipes!: Table<Recipe, number>;
  recipeIngredients!: Table<RecipeIngredient, number>;
  foodProducts!: Table<FoodProduct, number>;
  mealPlanEntries!: Table<MealPlanEntry, number>;
  pantryItems!: Table<PantryItem, number>;
  shoppingLists!: Table<ShoppingList, number>;
  shoppingListItems!: Table<ShoppingListItem, number>;
  stores!: Table<Store, number>;
  priceObservations!: Table<PriceObservation, number>;
  userSettings!: Table<UserSettings, string>;

  constructor() {
    super('essensplan-local');
    this.version(1).stores({
      recipes: '++id, title, updatedAt',
      recipeIngredients: '++id, recipeId, name, category, foodProductId',
      foodProducts: '++id, name, barcode, sourceId, source',
      mealPlanEntries: '++id, date, slot, recipeId',
      pantryItems: '++id, name, category, expiresAt, foodProductId',
      shoppingLists: '++id, status, fromDate, toDate',
      shoppingListItems: '++id, shoppingListId, name, category, storeId, checked',
      stores: '++id, name',
      priceObservations: '++id, itemName, storeId, observedAt',
      userSettings: 'id'
    });
  }
}

export const db = new EssensplanDatabase();
