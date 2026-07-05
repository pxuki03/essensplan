import { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { db } from '../db/db';
import { recipeNutritionPerServing, roundNutrition } from '../services/nutrition';
import { importRecipeFromUrl } from '../services/recipeImport';
import type { Recipe, RecipeIngredient, Unit } from '../types';

interface RecipesProps {
  recipes: Recipe[];
  ingredients: RecipeIngredient[];
}

const units: Unit[] = ['g', 'ml', 'piece', 'serving'];

export function Recipes({ recipes, ingredients }: RecipesProps) {
  const [importUrl, setImportUrl] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);

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

  async function importRecipe() {
    setIsImporting(true);
    setImportStatus('Rezept wird geladen...');

    try {
      const imported = await importRecipeFromUrl(importUrl);
      const now = new Date().toISOString();
      const recipeId = Number(
        await db.recipes.add({
          title: imported.title,
          servings: imported.servings,
          mealTypes: ['dinner'],
          notes: imported.notes,
          tags: ['importiert'],
          createdAt: now,
          updatedAt: now
        })
      );

      if (imported.ingredients.length > 0) {
        await db.recipeIngredients.bulkAdd(
          imported.ingredients.map((ingredient) => ({
            ...ingredient,
            recipeId
          }))
        );
      }

      setImportUrl('');
      setImportStatus('Rezept wurde importiert und kann jetzt angepasst werden.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Der Import ist fehlgeschlagen.';
      setImportStatus(
        `${message} Manche Webseiten blockieren den direkten Import. Probiere dann eine andere Rezeptseite.`
      );
    } finally {
      setIsImporting(false);
    }
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

  async function updateIngredientNutrition(
    ingredient: RecipeIngredient,
    field: 'calories' | 'protein' | 'carbohydrates' | 'fat',
    value: number
  ) {
    await updateIngredient(ingredient.id, {
      nutritionPer100: {
        calories: ingredient.nutritionPer100?.calories ?? 0,
        protein: ingredient.nutritionPer100?.protein ?? 0,
        carbohydrates: ingredient.nutritionPer100?.carbohydrates ?? 0,
        fat: ingredient.nutritionPer100?.fat ?? 0,
        source: 'manual',
        [field]: Math.max(value, 0)
      }
    });
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

      <section className="panel import-panel" aria-labelledby="recipe-import-title">
        <div>
          <h2 id="recipe-import-title">Internet-Rezept importieren</h2>
          <p className="muted">
            Fuege einen Rezept-Link ein. Danach erscheint das Rezept unten und du kannst Titel,
            Portionen, Notizen und Zutaten frei bearbeiten.
          </p>
        </div>
        <div className="import-form">
          <label>
            <span>Rezept-Link</span>
            <input
              inputMode="url"
              placeholder="https://..."
              value={importUrl}
              onChange={(event) => setImportUrl(event.target.value)}
            />
          </label>
          <button
            className="primary-button"
            type="button"
            disabled={isImporting}
            onClick={() => void importRecipe()}
          >
            <Download size={16} aria-hidden="true" />
            {isImporting ? 'Importiert...' : 'Importieren'}
          </button>
        </div>
        {importStatus ? (
          <p className="status-message" role="status">
            {importStatus}
          </p>
        ) : null}
      </section>

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
                    <label>
                      <span>kcal/100g</span>
                      <input
                        min={0}
                        type="number"
                        value={ingredient.nutritionPer100?.calories ?? 0}
                        onChange={(event) =>
                          void updateIngredientNutrition(
                            ingredient,
                            'calories',
                            Number(event.target.value)
                          )
                        }
                      />
                    </label>
                    <label>
                      <span>Protein</span>
                      <input
                        min={0}
                        type="number"
                        value={ingredient.nutritionPer100?.protein ?? 0}
                        onChange={(event) =>
                          void updateIngredientNutrition(
                            ingredient,
                            'protein',
                            Number(event.target.value)
                          )
                        }
                      />
                    </label>
                    <label>
                      <span>Kohlenh.</span>
                      <input
                        min={0}
                        type="number"
                        value={ingredient.nutritionPer100?.carbohydrates ?? 0}
                        onChange={(event) =>
                          void updateIngredientNutrition(
                            ingredient,
                            'carbohydrates',
                            Number(event.target.value)
                          )
                        }
                      />
                    </label>
                    <label>
                      <span>Fett</span>
                      <input
                        min={0}
                        type="number"
                        value={ingredient.nutritionPer100?.fat ?? 0}
                        onChange={(event) =>
                          void updateIngredientNutrition(ingredient, 'fat', Number(event.target.value))
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
