import { db } from '../db/db';
import { dailyNutrition, roundNutrition } from '../services/nutrition';
import type { MealPlanEntry, Recipe, RecipeIngredient, UserSettings } from '../types';

interface NutritionViewProps {
  meals: MealPlanEntry[];
  recipes: Recipe[];
  ingredients: RecipeIngredient[];
  settings?: UserSettings;
}

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

async function updateSettings(settings: UserSettings | undefined, updates: Partial<UserSettings>) {
  await db.userSettings.put({
    id: 'default',
    dailyCalorieGoal: settings?.dailyCalorieGoal ?? 2100,
    dailyProteinGoal: settings?.dailyProteinGoal ?? 95,
    dailyCarbohydrateGoal: settings?.dailyCarbohydrateGoal ?? 260,
    dailyFatGoal: settings?.dailyFatGoal ?? 80,
    mealSlots: settings?.mealSlots,
    preferredUnit: settings?.preferredUnit ?? 'g',
    ...updates
  });
}

export function NutritionView({ meals, recipes, ingredients, settings }: NutritionViewProps) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(index));

  return (
    <section className="view-stack" aria-labelledby="nutrition-title">
      <div className="view-header">
        <p>Kalorien und Makros</p>
        <h1 id="nutrition-title">Ernaehrung</h1>
      </div>

      <article className="panel">
        <h2>Unterstuetzende Tagesziele</h2>
        <p className="muted">
          Passe die Werte so an, wie es fuer deine Recovery-Begleitung hilfreich ist.
        </p>
        <div className="settings-grid">
          <label>
            <span>Kalorien</span>
            <input
              min={0}
              type="number"
              value={settings?.dailyCalorieGoal ?? 2100}
              onChange={(event) =>
                void updateSettings(settings, { dailyCalorieGoal: Number(event.target.value) })
              }
            />
          </label>
          <label>
            <span>Protein g</span>
            <input
              min={0}
              type="number"
              value={settings?.dailyProteinGoal ?? 95}
              onChange={(event) =>
                void updateSettings(settings, { dailyProteinGoal: Number(event.target.value) })
              }
            />
          </label>
          <label>
            <span>Kohlenhydrate g</span>
            <input
              min={0}
              type="number"
              value={settings?.dailyCarbohydrateGoal ?? 260}
              onChange={(event) =>
                void updateSettings(settings, {
                  dailyCarbohydrateGoal: Number(event.target.value)
                })
              }
            />
          </label>
          <label>
            <span>Fett g</span>
            <input
              min={0}
              type="number"
              value={settings?.dailyFatGoal ?? 80}
              onChange={(event) =>
                void updateSettings(settings, { dailyFatGoal: Number(event.target.value) })
              }
            />
          </label>
        </div>
      </article>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Tag</th>
              <th>kcal</th>
              <th>Protein</th>
              <th>Kohlenhydrate</th>
              <th>Fett</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const nutrition = dailyNutrition(
                meals.filter((meal) => meal.date === day),
                recipes,
                ingredients
              );

              return (
                <tr key={day}>
                  <th>{new Intl.DateTimeFormat('de-DE', { weekday: 'long' }).format(new Date(day))}</th>
                  <td>
                    {Math.round(nutrition.calories)} / {settings?.dailyCalorieGoal ?? 2100}
                  </td>
                  <td>
                    {roundNutrition(nutrition.protein)} / {settings?.dailyProteinGoal ?? 95} g
                  </td>
                  <td>
                    {roundNutrition(nutrition.carbohydrates)} /{' '}
                    {settings?.dailyCarbohydrateGoal ?? 260} g
                  </td>
                  <td>
                    {roundNutrition(nutrition.fat)} / {settings?.dailyFatGoal ?? 80} g
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted">
        Naehrwerte werden aus deinen manuellen Angaben und importierten Produktdaten berechnet.
      </p>
    </section>
  );
}
