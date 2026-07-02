import type { MealPlanEntry, Recipe, RecipeIngredient, UserSettings } from '../types';
import { dailyNutrition, roundNutrition } from '../services/nutrition';

interface NutritionViewProps { meals: MealPlanEntry[]; recipes: Recipe[]; ingredients: RecipeIngredient[]; settings?: UserSettings; }
const addDays = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };

export function NutritionView({ meals, recipes, ingredients, settings }: NutritionViewProps) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(index));
  return <section className="view-stack" aria-labelledby="nutrition-title"><div className="view-header"><p>Kalorien und Makros</p><h1 id="nutrition-title">Ernährung</h1></div><div className="table-card"><table><thead><tr><th>Tag</th><th>kcal</th><th>Protein</th><th>Kohlenhydrate</th><th>Fett</th></tr></thead><tbody>{days.map((day) => { const nutrition = dailyNutrition(meals.filter((meal) => meal.date === day), recipes, ingredients); return <tr key={day}><th>{new Intl.DateTimeFormat('de-DE', { weekday: 'long' }).format(new Date(day))}</th><td>{Math.round(nutrition.calories)} / {settings?.dailyCalorieGoal ?? 2100}</td><td>{roundNutrition(nutrition.protein)} g</td><td>{roundNutrition(nutrition.carbohydrates)} g</td><td>{roundNutrition(nutrition.fat)} g</td></tr>; })}</tbody></table></div><p className="muted">Nährwerte werden aus manuellen Angaben und gecachten Open-Food-Facts-Daten berechnet.</p></section>;
}
