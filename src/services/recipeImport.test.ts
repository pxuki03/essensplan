import { describe, expect, it } from 'vitest';
import { parseRecipeHtml } from './recipeImport';

describe('recipe import', () => {
  it('reads schema.org recipe data from a web page', () => {
    const recipe = parseRecipeHtml(
      `
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org",
                "@type": "Recipe",
                "name": "Tomaten Pasta",
                "recipeYield": "2 Portionen",
                "recipeIngredient": ["200 g Pasta", "1/2 kg Tomaten", "2 Stueck Knoblauch"],
                "recipeInstructions": [
                  { "@type": "HowToStep", "text": "Pasta kochen." },
                  { "@type": "HowToStep", "text": "Sauce mischen." }
                ]
              }
            </script>
          </head>
        </html>
      `,
      'https://example.test/rezept'
    );

    expect(recipe.title).toBe('Tomaten Pasta');
    expect(recipe.servings).toBe(2);
    expect(recipe.ingredients).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Pasta', quantity: 200, unit: 'g' }),
        expect.objectContaining({ name: 'Tomaten', quantity: 500, unit: 'g' }),
        expect.objectContaining({ name: 'Knoblauch', quantity: 2, unit: 'piece' })
      ])
    );
    expect(recipe.notes).toContain('Quelle: https://example.test/rezept');
    expect(recipe.notes).toContain('Pasta kochen.');
  });
});
