import { Plus, Trash2 } from 'lucide-react';
import { db } from '../db/db';
import { recipeNutritionPerServing, roundNutrition } from '../services/nutrition';
import type { Recipe, RecipeIngredient, Unit } from '../types';

interface RecipesProps {
  recipes: Recipe[];
  ingredients: RecipeIngredient[];
}

const units: Unit[] = ['g', 'ml', 'piece', 'serving'];

export function Recipes({ recipes, ingredients }: RecipesProps) {
  async function addRecipe() {
    const now = new Date().toISOString();
    const recipeId = Number(
      await db.recipes.add({
        title: 'Neues Rezept',
        servings: 2,
        mealTypes: ['dinner'],
        notes: 'Zubereitung ergaenzen.',
        tags: ['neu'],
        createdAt: now,
        updatedAt: now
      })
    );

    await db.recipeIngredients.add({
      recipeId,
      name: 'Zutat',
      quantity: 100,
      unit: 'g',
      category: 'Allgemein',
      nutritionPer100: {
        calories: 100,
        protein: 5,
        carbohydrates: 10,
        fat: 3,
        source: 'manual'
      }
    });
  }

  async function updateRecipe(id: number | undefined, updates: Partial<Recipe>) {
    if (!id) return;
    await db.recipes.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async function addIngredient(recipeId: number | undefined) {
    if (!recipeId) return;
    await db.recipeIngredients.add({
      recipeId,
      name: 'Neue Zutat',
      quantity: 100,
      unit: 'g',
      category: 'Allgemein',
      nutritionPer100: {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        source: 'manual'
      }
    });
  }

  async function updateIngredient(id: number | undefined, updates: Partial<RecipeIngredient>) {
    if (!id) return;
    await db.recipeIngredients.update(id, updates);
  }

  async function deleteIngredient(id: number | undefined) {
    if (!id) return;
    await db.recipeIngredients.delete(id);
  }

  return (
    <section className="view-stack" aria-labelledby="recipes-title">
      <div className="view-header row-header">
        <div>
          <p>Rezeptverwaltung</p>
          <h1 id="recipes-title">Rezepte</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => void addRecipe()}>
          <Plus size={16} aria-hidden="true" /> Rezept
        </button>
      </div>

      <div className="card-grid">
        {recipes.map((recipe) => {
          const recipeIngredients = ingredients.filter((item) => item.recipeId === recipe.id);
          const nutrition = recipeNutritionPerServing(recipe, recipeIngredients);

          return (
            <article className="panel recipe-card" key={recipe.id}>
              <div className="recipe-form-grid">
                <label>
                  <span>Titel</span>
                  <input
                    value={recipe.title}
                    onChange={(event) => void updateRecipe(recipe.id, { title: event.target.value })}
                  />
                </label>
                <label>
                  <span>Portionen</span>
                  <input
                    min={1}
                    type="number"
                    value={recipe.servings}
                    onChange={(event) =>
                      void updateRecipe(recipe.id, {
                        servings: Math.max(Number(event.target.value), 1)
                      })
                    }
                  />
                </label>
              </div>

              <label>
                <span>Notizen</span>
                <textarea
                  rows={3}
                  value={recipe.notes}
                  onChange={(event) => void updateRecipe(recipe.id, { notes: event.target.value })}
                />
              </label>

              <div className="nutrition-strip">
                <span>{Math.round(nutrition.calories)} kcal</span>
                <span>{roundNutrition(nutrition.protein)} g Protein</span>
                <span>{recipeIngredients.length} Zutaten</span>
              </div>

              <div className="row-header">
                <h2>Zutaten</h2>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => void addIngredient(recipe.id)}
                >
                  <Plus size={15} aria-hidden="true" /> Zutat
                </button>
              </div>

              <div className="ingredient-list">
                {recipeIngredients.map((ingredient) => (
                  <div className="ingredient-row" key={ingredient.id}>
                    <label>
                      <span>Name</span>
                      <input
                        value={ingredient.name}
                        onChange={(event) =>
                          void updateIngredient(ingredient.id, { name: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Menge</span>
                      <input
                        min={0}
                        type="number"
                        value={ingredient.quantity}
                        onChange={(event) =>
                          void updateIngredient(ingredient.id, {
                            quantity: Math.max(Number(event.target.value), 0)
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Einheit</span>
                      <select
                        value={ingredient.unit}
                        onChange={(event) =>
                          void updateIngredient(ingredient.id, {
                            unit: event.target.value as Unit
                          })
                        }
                      >
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Kategorie</span>
                      <input
                        value={ingredient.category}
                        onChange={(event) =>
                          void updateIngredient(ingredient.id, { category: event.target.value })
                        }
                      />
                    </label>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => void deleteIngredient(ingredient.id)}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      <span>Loeschen</span>
                    </button>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
