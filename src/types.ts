export type Unit = 'g' | 'ml' | 'piece' | 'serving';
export type MealSlot = string;
export type NutritionSource = 'manual' | 'open-food-facts' | 'calculated';

export interface MealSlotConfig {
  id: MealSlot;
  label: string;
}

export interface NutritionFacts {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  source: NutritionSource;
}

export interface Recipe {
  id?: number;
  title: string;
  servings: number;
  mealTypes: MealSlot[];
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id?: number;
  recipeId: number;
  name: string;
  quantity: number;
  unit: Unit;
  category: string;
  foodProductId?: number;
  nutritionPer100?: NutritionFacts;
}

export interface FoodProduct {
  id?: number;
  name: string;
  brand?: string;
  barcode?: string;
  source: 'manual' | 'open-food-facts';
  sourceId?: string;
  nutritionPer100: NutritionFacts;
  lastFetchedAt: string;
}

export interface MealPlanEntry {
  id?: number;
  date: string;
  slot: MealSlot;
  recipeId?: number;
  customTitle?: string;
  servings: number;
  notes?: string;
}

export interface PantryItem {
  id?: number;
  name: string;
  quantity: number;
  unit: Unit;
  category: string;
  foodProductId?: number;
  expiresAt?: string;
  updatedAt: string;
}

export interface ShoppingList {
  id?: number;
  title: string;
  status: 'draft' | 'active' | 'completed';
  fromDate: string;
  toDate: string;
  createdAt: string;
}

export interface ShoppingListItem {
  id?: number;
  shoppingListId: number;
  name: string;
  category: string;
  neededQuantity: number;
  pantryDeduction: number;
  unit: Unit;
  storeId?: number;
  checked: boolean;
  foodProductId?: number;
}

export interface Store {
  id?: number;
  name: string;
  notes?: string;
}

export interface PriceObservation {
  id?: number;
  itemName: string;
  storeId?: number;
  price: number;
  packageQuantity: number;
  unit: Unit;
  observedAt: string;
}

export interface UserSettings {
  id: 'default';
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbohydrateGoal?: number;
  dailyFatGoal?: number;
  mealSlots?: MealSlotConfig[];
  preferredUnit: Unit;
}
