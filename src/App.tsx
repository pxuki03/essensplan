import { useState } from 'react';
import { AppShell, type ViewId } from './components/AppShell';
import { Dashboard } from './components/Dashboard';
import { Groceries } from './components/Groceries';
import { NutritionView } from './components/NutritionView';
import { Pantry } from './components/Pantry';
import { Planner } from './components/Planner';
import { Recipes } from './components/Recipes';
import { useEssensplanData } from './hooks/useEssensplan';

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const data = useEssensplanData();
  const recipes = data.recipes ?? [];
  const ingredients = data.ingredients ?? [];
  const meals = data.meals ?? [];
  const pantry = data.pantry ?? [];
  const lists = data.lists ?? [];
  const listItems = data.listItems ?? [];
  const stores = data.stores ?? [];
  const prices = data.prices ?? [];

  if (data.error) {
    return (
      <AppShell activeView={activeView} onViewChange={setActiveView}>
        <section className="view-stack" aria-labelledby="error-title">
          <div className="view-header">
            <p>Lokale Datenbank</p>
            <h1 id="error-title">Essensplan konnte nicht geladen werden</h1>
          </div>
          <article className="panel">
            <p>
              Die lokale Browser-Datenbank hat einen Fehler gemeldet. Meist hilft es, die
              Website-Daten fuer <strong>127.0.0.1</strong> einmal zu loeschen und die Seite neu
              zu laden.
            </p>
            <p className="muted">{data.error}</p>
          </article>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeView={activeView} onViewChange={setActiveView}>
      {activeView === 'dashboard' && <Dashboard recipes={recipes} ingredients={ingredients} meals={meals} pantry={pantry} listItems={listItems} settings={data.settings} />}
      {activeView === 'recipes' && <Recipes recipes={recipes} ingredients={ingredients} />}
      {activeView === 'planner' && <Planner meals={meals} recipes={recipes} />}
      {activeView === 'nutrition' && <NutritionView meals={meals} recipes={recipes} ingredients={ingredients} settings={data.settings} />}
      {activeView === 'shopping' && <Groceries meals={meals} ingredients={ingredients} pantry={pantry} lists={lists} listItems={listItems} stores={stores} prices={prices} />}
      {activeView === 'pantry' && <Pantry pantry={pantry} />}
    </AppShell>
  );
}
