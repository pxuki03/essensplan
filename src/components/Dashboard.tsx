import { CalendarCheck, ShoppingBasket, Utensils } from 'lucide-react';
import type { MealPlanEntry, PantryItem, Recipe, RecipeIngredient, ShoppingListItem, UserSettings } from '../types';
import { dailyNutrition, roundNutrition } from '../services/nutrition';
import { remainingQuantity } from '../services/groceries';

interface DashboardProps { recipes: Recipe[]; ingredients: RecipeIngredient[]; meals: MealPlanEntry[]; pantry: PantryItem[]; listItems: ShoppingListItem[]; settings?: UserSettings; }

export function Dashboard({ recipes, ingredients, meals, pantry, listItems, settings }: DashboardProps) {
  const today = new Date().toISOString().slice(0, 10);
  const todaysMeals = meals.filter((meal) => meal.date === today);
  const nutrition = dailyNutrition(todaysMeals, recipes, ingredients);
  const openItems = listItems.filter((item) => !item.checked && remainingQuantity(item) > 0);
  const soon = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
  const expiring = pantry.filter((item) => item.expiresAt && item.expiresAt <= soon);
  return (
    <section className="view-stack" aria-labelledby="dashboard-title">
      <div className="view-header"><p>Heute</p><h1 id="dashboard-title">Übersicht</h1></div>
      <div className="metrics-grid">
        <article className="metric-card"><CalendarCheck /><span>Geplante Mahlzeiten</span><strong>{todaysMeals.length}</strong></article>
        <article className="metric-card"><Utensils /><span>Kalorien heute</span><strong>{Math.round(nutrition.calories)} / {settings?.dailyCalorieGoal ?? 2100}</strong></article>
        <article className="metric-card"><ShoppingBasket /><span>Offene Einkäufe</span><strong>{openItems.length}</strong></article>
      </div>
      <div className="two-column">
        <article className="panel"><h2>Nährwerte</h2><div className="progress-row"><span>Protein</span><progress value={nutrition.protein} max={settings?.dailyProteinGoal ?? 95} /><strong>{roundNutrition(nutrition.protein)} g</strong></div><div className="progress-row"><span>Kohlenhydrate</span><progress value={nutrition.carbohydrates} max={settings?.dailyCarbohydrateGoal ?? 260} /><strong>{roundNutrition(nutrition.carbohydrates)} g</strong></div><div className="progress-row"><span>Fett</span><progress value={nutrition.fat} max={settings?.dailyFatGoal ?? 80} /><strong>{roundNutrition(nutrition.fat)} g</strong></div></article>
        <article className="panel"><h2>Bald verbrauchen</h2>{expiring.length === 0 ? <p className="muted">Keine kritischen Vorräte.</p> : expiring.map((item) => <p key={item.id} className="list-row"><span>{item.name}</span><strong>{item.quantity} {item.unit}</strong></p>)}</article>
      </div>
    </section>
  );
}
