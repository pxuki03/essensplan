import type { MealPlanEntry, NutritionFacts, Recipe, RecipeIngredient } from '../types';

export const emptyNutrition = (source: NutritionFacts['source'] = 'calculated'): NutritionFacts => ({ calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, source });

export function addNutrition(a: NutritionFacts, b: NutritionFacts): NutritionFacts {
  return { calories: a.calories + b.calories, protein: a.protein + b.protein, carbohydrates: a.carbohydrates + b.carbohydrates, fat: a.fat + b.fat, fiber: (a.fiber ?? 0) + (b.fiber ?? 0), sugar: (a.sugar ?? 0) + (b.sugar ?? 0), source: 'calculated' };
}

export function nutritionForIngredient(ingredient: RecipeIngredient): NutritionFacts {
  if (!ingredient.nutritionPer100) return emptyNutrition();
  const factor = ingredient.unit === 'g' || ingredient.unit === 'ml' ? ingredient.quantity / 100 : ingredient.quantity;
  return { calories: ingredient.nutritionPer100.calories * factor, protein: ingredient.nutritionPer100.protein * factor, carbohydrates: ingredient.nutritionPer100.carbohydrates * factor, fat: ingredient.nutritionPer100.fat * factor, fiber: (ingredient.nutritionPer100.fiber ?? 0) * factor, sugar: (ingredient.nutritionPer100.sugar ?? 0) * factor, source: 'calculated' };
}

export function recipeNutritionTotal(ingredients: RecipeIngredient[]): NutritionFacts {
  return ingredients.map(nutritionForIngredient).reduce(addNutrition, emptyNutrition());
}

export function recipeNutritionPerServing(recipe: Recipe, ingredients: RecipeIngredient[]): NutritionFacts {
  const total = recipeNutritionTotal(ingredients);
  const divisor = Math.max(recipe.servings, 1);
  return { calories: total.calories / divisor, protein: total.protein / divisor, carbohydrates: total.carbohydrates / divisor, fat: total.fat / divisor, fiber: (total.fiber ?? 0) / divisor, sugar: (total.sugar ?? 0) / divisor, source: 'calculated' };
}

export function dailyNutrition(entries: MealPlanEntry[], recipes: Recipe[], ingredients: RecipeIngredient[]) {
  return entries.reduce((sum, entry) => {
    const recipe = recipes.find((item) => item.id === entry.recipeId);
    if (!recipe?.id) return sum;
    const perServing = recipeNutritionPerServing(recipe, ingredients.filter((item) => item.recipeId === recipe.id));
    return addNutrition(sum, { ...perServing, calories: perServing.calories * entry.servings, protein: perServing.protein * entry.servings, carbohydrates: perServing.carbohydrates * entry.servings, fat: perServing.fat * entry.servings, fiber: (perServing.fiber ?? 0) * entry.servings, sugar: (perServing.sugar ?? 0) * entry.servings });
  }, emptyNutrition());
}

export const roundNutrition = (value: number) => Math.round(value * 10) / 10;
