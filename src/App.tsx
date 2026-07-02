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
