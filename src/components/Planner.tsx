import { CopyPlus } from 'lucide-react';
import { db } from '../db/db';
import type { MealPlanEntry, MealSlot, Recipe } from '../types';

const slots: Array<{ id: MealSlot; label: string }> = [{ id: 'breakfast', label: 'Frühstück' }, { id: 'lunch', label: 'Mittag' }, { id: 'dinner', label: 'Abend' }, { id: 'snack', label: 'Snack' }];
const addDays = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return date.toISOString().slice(0, 10); };
const days = Array.from({ length: 7 }, (_, index) => addDays(index));

interface PlannerProps { meals: MealPlanEntry[]; recipes: Recipe[]; }

export function Planner({ meals, recipes }: PlannerProps) {
  async function addMeal(date: string, slot: MealSlot) {
    const firstRecipe = recipes[0];
    await db.mealPlanEntries.add({ date, slot, recipeId: firstRecipe?.id, customTitle: firstRecipe ? undefined : 'Freie Mahlzeit', servings: 1 });
  }
  const cells = [<div className="planner-head" key="head-slot">Mahlzeit</div>, ...days.map((day) => <div className="planner-head" key={'head-' + day}>{new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(new Date(day))}</div>)];
  for (const slot of slots) {
    cells.push(<div className="planner-slot" key={slot.id + '-label'}>{slot.label}</div>);
    for (const day of days) {
      const entry = meals.find((meal) => meal.date === day && meal.slot === slot.id);
      const recipe = recipes.find((item) => item.id === entry?.recipeId);
      cells.push(<button className="planner-cell" key={day + '-' + slot.id} onClick={() => addMeal(day, slot.id)}>{entry ? <><strong>{recipe?.title ?? entry.customTitle}</strong><span>{entry.servings} Portion</span></> : <><CopyPlus size={16} /><span>Planen</span></>}</button>);
    }
  }
  return <section className="view-stack" aria-labelledby="planner-title"><div className="view-header"><p>7-Tage-Plan</p><h1 id="planner-title">Essensplan</h1></div><div className="planner-grid" role="table" aria-label="Wöchentlicher Essensplan">{cells}</div></section>;
}
