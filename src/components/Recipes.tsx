import { Plus } from 'lucide-react';
import { db } from '../db/db';
import { recipeNutritionPerServing, roundNutrition } from '../services/nutrition';
import type { Recipe, RecipeIngredient } from '../types';

interface RecipesProps { recipes: Recipe[]; ingredients: RecipeIngredient[]; }

export function Recipes({ recipes, ingredients }: RecipesProps) {
  async function addRecipe() {
    const now = new Date().toISOString();
    const recipeId = Number(await db.recipes.add({ title: 'Neues Rezept', servings: 2, mealTypes: ['dinner'], notes: 'Zubereitung ergänzen.', tags: ['neu'], createdAt: now, updatedAt: now }));
    await db.recipeIngredients.add({ recipeId, name: 'Zutat', quantity: 100, unit: 'g', category: 'Allgemein', nutritionPer100: { calories: 100, protein: 5, carbohydrates: 10, fat: 3, source: 'manual' } });
  }
  return <section className="view-stack" aria-labelledby="recipes-title"><div className="view-header row-header"><div><p>Rezeptverwaltung</p><h1 id="recipes-title">Rezepte</h1></div><button className="primary-button" onClick={addRecipe}><Plus size={16} /> Rezept</button></div><div className="card-grid">{recipes.map((recipe) => { const recipeIngredients = ingredients.filter((item) => item.recipeId === recipe.id); const nutrition = recipeNutritionPerServing(recipe, recipeIngredients); return <article className="panel recipe-card" key={recipe.id}><div className="row-header"><h2>{recipe.title}</h2><span className="pill">{recipe.servings} Portionen</span></div><p className="muted">{recipe.notes}</p><div className="nutrition-strip"><span>{Math.round(nutrition.calories)} kcal</span><span>{roundNutrition(nutrition.protein)} g Protein</span><span>{recipeIngredients.length} Zutaten</span></div><ul className="compact-list">{recipeIngredients.map((ingredient) => <li key={ingredient.id}>{ingredient.name} · {ingredient.quantity} {ingredient.unit}</li>)}</ul></article>; })}</div></section>;
}
