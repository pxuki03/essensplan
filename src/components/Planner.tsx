import { Trash2 } from 'lucide-react';
import { db } from '../db/db';
import type { MealPlanEntry, MealSlot, Recipe } from '../types';

const slots: Array<{ id: MealSlot; label: string }> = [
  { id: 'breakfast', label: 'Fruehstueck' },
  { id: 'lunch', label: 'Mittag' },
  { id: 'dinner', label: 'Abend' },
  { id: 'snack', label: 'Snack' }
];

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const days = Array.from({ length: 7 }, (_, index) => addDays(index));

interface PlannerProps {
  meals: MealPlanEntry[];
  recipes: Recipe[];
}

async function saveMeal(date: string, slot: MealSlot, recipeIdValue: string, entry?: MealPlanEntry) {
  const recipeId = Number(recipeIdValue);
  if (!recipeIdValue || Number.isNaN(recipeId)) return;

  if (entry?.id) {
    await db.mealPlanEntries.update(entry.id, {
      recipeId,
      customTitle: undefined
    });
    return;
  }

  await db.mealPlanEntries.add({
    date,
    slot,
    recipeId,
    servings: 1
  });
}

async function removeMeal(entry?: MealPlanEntry) {
  if (entry?.id) {
    await db.mealPlanEntries.delete(entry.id);
  }
}

export function Planner({ meals, recipes }: PlannerProps) {
  const cells = [
    <div className="planner-head" key="head-slot">
      Mahlzeit
    </div>,
    ...days.map((day) => (
      <div className="planner-head" key={`head-${day}`}>
        {new Intl.DateTimeFormat('de-DE', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit'
        }).format(new Date(day))}
      </div>
    ))
  ];

  for (const slot of slots) {
    cells.push(
      <div className="planner-slot" key={`${slot.id}-label`}>
        {slot.label}
      </div>
    );

    for (const day of days) {
      const entry = meals.find((meal) => meal.date === day && meal.slot === slot.id);
      const selectedRecipeId = entry?.recipeId ? String(entry.recipeId) : '';

      cells.push(
        <div className="planner-cell" key={`${day}-${slot.id}`}>
          <label>
            <span className="sr-only">
              Gericht fuer {slot.label} am {day} auswaehlen
            </span>
            <select
              value={selectedRecipeId}
              onChange={(event) => void saveMeal(day, slot.id, event.target.value, entry)}
            >
              <option value="">Planen</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </option>
              ))}
            </select>
          </label>
          {entry ? (
            <button className="icon-button" type="button" onClick={() => void removeMeal(entry)}>
              <Trash2 size={15} aria-hidden="true" />
              <span>Entfernen</span>
            </button>
          ) : (
            <span className="muted">Noch frei</span>
          )}
        </div>
      );
    }
  }

  return (
    <section className="view-stack" aria-labelledby="planner-title">
      <div className="view-header">
        <p>7-Tage-Plan</p>
        <h1 id="planner-title">Essensplan</h1>
      </div>
      <div className="planner-grid" role="table" aria-label="Woechentlicher Essensplan">
        {cells}
      </div>
    </section>
  );
}
