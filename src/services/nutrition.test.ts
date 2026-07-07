import { describe, expect, it } from 'vitest';
import type { Recipe, RecipeIngredient } from '../types';
import { caloriesFromMacros, dailyNutrition, recipeNutritionPerServing } from './nutrition';

describe('recipeNutritionPerServing', () => {
  it('berechnet Makros pro Portion', () => {
    const recipe: Recipe = { id: 1, title: 'Test', servings: 2, mealTypes: ['dinner'], notes: '', tags: [], createdAt: '', updatedAt: '' };
    const ingredients: RecipeIngredient[] = [{ recipeId: 1, name: 'Linsen', quantity: 200, unit: 'g', category: 'Trockenware', nutritionPer100: { calories: 350, protein: 24, carbohydrates: 52, fat: 2, source: 'manual' } }];
    expect(recipeNutritionPerServing(recipe, ingredients).calories).toBe(322);
    expect(recipeNutritionPerServing(recipe, ingredients).protein).toBe(24);
  });

  it('berechnet Kalorien automatisch aus Makros', () => {
    expect(caloriesFromMacros({ protein: 10, carbohydrates: 20, fat: 5 })).toBe(165);
  });

  it('zaehlt im Tagesbedarf nur die geplante Portionsanzahl', () => {
    const recipe: Recipe = {
      id: 1,
      title: 'Test',
      servings: 2,
      mealTypes: ['dinner'],
      notes: '',
      tags: [],
      createdAt: '',
      updatedAt: ''
    };
    const ingredients: RecipeIngredient[] = [
      {
        recipeId: 1,
        name: 'Linsen',
        quantity: 200,
        unit: 'g',
        category: 'Trockenware',
        nutritionPer100: {
          calories: 350,
          protein: 24,
          carbohydrates: 52,
          fat: 2,
          source: 'manual'
        }
      }
    ];

    expect(
      dailyNutrition([{ date: '2026-07-07', slot: 'dinner', recipeId: 1, servings: 1 }], [recipe], ingredients)
        .calories
    ).toBe(322);
  });
});
