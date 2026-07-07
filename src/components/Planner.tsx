import { Plus, Trash2 } from 'lucide-react';
import { db } from '../db/db';
import { defaultMealSlots, mealSlotsFromSettings } from '../services/mealSlots';
import type { MealPlanEntry, MealSlotConfig, Recipe, UserSettings } from '../types';

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const days = Array.from({ length: 7 }, (_, index) => addDays(index));

interface PlannerProps {
  meals: MealPlanEntry[];
  recipes: Recipe[];
  settings?: UserSettings;
}

async function ensureSettings(settings?: UserSettings) {
  const current = settings ?? (await db.userSettings.get('default'));
  const next: UserSettings = current ?? {
    id: 'default',
    dailyCalorieGoal: 2100,
    dailyProteinGoal: 95,
    dailyCarbohydrateGoal: 260,
    dailyFatGoal: 80,
    mealSlots: defaultMealSlots,
    preferredUnit: 'g'
  };

  return next;
}

async function updateMealSlots(settings: UserSettings | undefined, mealSlots: MealSlotConfig[]) {
  const current = await ensureSettings(settings);
  await db.userSettings.put({
    ...current,
    mealSlots
  });
}

async function saveMeal(date: string, slotId: string, recipeIdValue: string, entry?: MealPlanEntry) {
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
    slot: slotId,
    recipeId,
    servings: 1
  });
}

async function removeMeal(entry?: MealPlanEntry) {
  if (entry?.id) {
    await db.mealPlanEntries.delete(entry.id);
  }
}

async function updateMealServings(entry: MealPlanEntry | undefined, servings: number) {
  if (!entry?.id) return;
  await db.mealPlanEntries.update(entry.id, {
    servings: Math.max(servings, 0)
  });
}

export function Planner({ meals, recipes, settings }: PlannerProps) {
  const slots = mealSlotsFromSettings(settings);

  async function renameSlot(slotId: string, label: string) {
    const nextSlots = slots.map((slot) => (slot.id === slotId ? { ...slot, label } : slot));
    await updateMealSlots(settings, nextSlots);
  }

  async function addSlot() {
    const nextNumber = slots.length + 1;
    await updateMealSlots(settings, [
      ...slots,
      {
        id: `meal-${Date.now()}`,
        label: `Mahlzeit ${nextNumber}`
      }
    ]);
  }

  async function deleteSlot(slotId: string) {
    if (slots.length <= 1) return;
    await updateMealSlots(
      settings,
      slots.filter((slot) => slot.id !== slotId)
    );
    const ids = meals.filter((meal) => meal.slot === slotId).map((meal) => meal.id).filter(Boolean);
    await db.mealPlanEntries.bulkDelete(ids as number[]);
  }

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
      <div className="planner-slot planner-slot-edit" key={`${slot.id}-label`}>
        <label>
          <span className="sr-only">Name der Mahlzeit</span>
          <input value={slot.label} onChange={(event) => void renameSlot(slot.id, event.target.value)} />
        </label>
        <button
          className="icon-button danger"
          type="button"
          disabled={slots.length <= 1}
          onClick={() => void deleteSlot(slot.id)}
        >
          <Trash2 size={15} aria-hidden="true" />
          <span>Entfernen</span>
        </button>
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
            <>
              <label>
                <span>Portionen</span>
                <input
                  min={0}
                  step={0.5}
                  type="number"
                  value={entry.servings}
                  onChange={(event) =>
                    void updateMealServings(entry, Number(event.target.value))
                  }
                />
              </label>
              <button className="icon-button" type="button" onClick={() => void removeMeal(entry)}>
                <Trash2 size={15} aria-hidden="true" />
                <span>Entfernen</span>
              </button>
            </>
          ) : (
            <span className="muted">Noch frei</span>
          )}
        </div>
      );
    }
  }

  return (
    <section className="view-stack" aria-labelledby="planner-title">
      <div className="view-header row-header">
        <div>
          <p>7-Tage-Plan</p>
          <h1 id="planner-title">Essensplan</h1>
        </div>
        <button className="primary-button" type="button" onClick={() => void addSlot()}>
          <Plus size={16} aria-hidden="true" />
          Mahlzeit
        </button>
      </div>
      <p className="muted">
        Plane so viele Mahlzeiten ein, wie dich in deiner Recovery gerade unterstuetzen.
      </p>
      <div className="planner-grid" role="table" aria-label="Woechentlicher Essensplan">
        {cells}
      </div>
    </section>
  );
}
