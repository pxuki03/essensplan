import { describe, expect, it } from 'vitest';
import { generateShoppingItems, remainingQuantity } from './groceries';

describe('generateShoppingItems', () => {
  it('aggregiert Zutaten und zieht Vorrat ab', () => {
    const items = generateShoppingItems(
      [{ date: '2026-06-27', slot: 'dinner', recipeId: 1, servings: 2 }],
      [{ recipeId: 1, name: 'Tofu', quantity: 200, unit: 'g', category: 'Kuehlregal' }],
      [{ name: 'Tofu', quantity: 150, unit: 'g', category: 'Kuehlregal', updatedAt: '' }],
      1
    );
    expect(items[0].neededQuantity).toBe(400);
    expect(items[0].pantryDeduction).toBe(150);
    expect(remainingQuantity(items[0])).toBe(250);
  });
});
