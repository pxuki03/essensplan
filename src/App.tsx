import { useMemo, useState } from 'react';
import { BarChart3, CalendarDays, ChefHat, Home, Package, ShoppingCart } from 'lucide-react';

type View = 'dashboard' | 'planner' | 'recipes' | 'nutrition' | 'shopping' | 'pantry';
type MealSlot = 'Frühstück' | 'Mittag' | 'Abend' | 'Snack';

interface Recipe {
  title: string;
  servings: number;
  calories: number;
  protein: number;
  ingredients: Array<{ name: string; amount: number; unit: string; category: string }>;
}

const recipes: Recipe[] = [
  {
    title: 'Linsen-Bolognese',
    servings: 4,
    calories: 425,
    protein: 28,
    ingredients: [
      { name: 'Rote Linsen', amount: 240, unit: 'g', category: 'Trockenware' },
      { name: 'Tomaten passiert', amount: 500, unit: 'g', category: 'Konserven' }
    ]
  },
  {
    title: 'Skyr-Beeren-Bowl',
    servings: 1,
    calories: 220,
    protein: 30,
    ingredients: [
      { name: 'Skyr Natur', amount: 250, unit: 'g', category: 'Kühlregal' },
      { name: 'Beerenmix', amount: 120, unit: 'g', category: 'Obst' }
    ]
  },
  {
    title: 'Tofu-Gemüse-Pfanne',
    servings: 2,
    calories: 510,
    protein: 34,
    ingredients: [
      { name: 'Tofu natur', amount: 300, unit: 'g', category: 'Kühlregal' },
      { name: 'Brokkoli', amount: 400, unit: 'g', category: 'Gemüse' }
    ]
  }
];

const pantry = [
  { name: 'Rote Linsen', amount: 100, unit: 'g', expires: 'lagerfähig' },
  { name: 'Brokkoli', amount: 150, unit: 'g', expires: 'bald verbrauchen' }
];

const nav = [
  { id: 'dashboard' as const, label: 'Übersicht', icon: Home },
  { id: 'planner' as const, label: 'Essensplan', icon: CalendarDays },
  { id: 'recipes' as const, label: 'Rezepte', icon: ChefHat },
  { id: 'nutrition' as const, label: 'Ernährung', icon: BarChart3 },
  { id: 'shopping' as const, label: 'Einkauf', icon: ShoppingCart },
  { id: 'pantry' as const, label: 'Vorrat', icon: Package }
];

const slots: MealSlot[] = ['Frühstück', 'Mittag', 'Abend', 'Snack'];
const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function buildShoppingList() {
  const totals = new Map<string, { name: string; amount: number; unit: string; category: string; pantry: number }>();
  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = `${ingredient.name}-${ingredient.unit}`;
      const item = totals.get(key) ?? { ...ingredient, pantry: 0 };
      item.amount += totals.has(key) ? ingredient.amount : 0;
      totals.set(key, item);
    }
  }
  return Array.from(totals.values()).map((item) => {
    const stock = pantry.find((entry) => entry.name === item.name && entry.unit === item.unit)?.amount ?? 0;
    return { ...item, pantry: stock, buy: Math.max(item.amount - stock, 0) };
  });
}

export default function App() {
  const [active, setActive] = useState<View>('dashboard');
  const shopping = useMemo(buildShoppingList, []);
  const totalCalories = recipes.reduce((sum, recipe) => sum + recipe.calories, 0);
  const totalProtein = recipes.reduce((sum, recipe) => sum + recipe.protein, 0);

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Hauptnavigation">
        <div className="brand"><span>E</span><div><strong>Essensplan</strong><small>Lokal. Klar. Planbar.</small></div></div>
        <nav>
          {nav.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => setActive(item.id)}><Icon size={18} />{item.label}</button>;
          })}
        </nav>
      </aside>
      <main>
        {active === 'dashboard' && <section><p className="eyebrow">Heute</p><h1>Übersicht</h1><div className="metrics"><article><strong>3</strong><span>Rezepte</span></article><article><strong>{totalCalories}</strong><span>kcal geplant</span></article><article><strong>{shopping.filter((item) => item.buy > 0).length}</strong><span>Einkäufe offen</span></article></div><div className="grid"><Panel title="Nährwerte"><Progress label="Protein" value={totalProtein} max={95} suffix="g" /><Progress label="Kalorien" value={totalCalories} max={2100} suffix="kcal" /></Panel><Panel title="Bald verbrauchen">{pantry.map((item) => <p className="row" key={item.name}><span>{item.name}</span><strong>{item.amount} {item.unit}</strong></p>)}</Panel></div></section>}
        {active === 'planner' && <section><p className="eyebrow">7-Tage-Plan</p><h1>Essensplan</h1><div className="planner"><b>Mahlzeit</b>{days.map((day) => <b key={day}>{day}</b>)}{slots.map((slot) => <><b key={slot}>{slot}</b>{days.map((day, index) => <button key={`${slot}-${day}`}>{index % 3 === 0 ? recipes[index % recipes.length].title : 'Planen'}</button>)}</>)}</div></section>}
        {active === 'recipes' && <section><p className="eyebrow">Rezeptverwaltung</p><h1>Rezepte</h1><div className="cards">{recipes.map((recipe) => <article className="panel" key={recipe.title}><h2>{recipe.title}</h2><p>{recipe.servings} Portionen · {recipe.calories} kcal · {recipe.protein} g Protein</p><ul>{recipe.ingredients.map((item) => <li key={item.name}>{item.name}: {item.amount} {item.unit}</li>)}</ul></article>)}</div></section>}
        {active === 'nutrition' && <section><p className="eyebrow">Kalorien und Makros</p><h1>Ernährung</h1><div className="panel"><table><thead><tr><th>Rezept</th><th>kcal</th><th>Protein</th></tr></thead><tbody>{recipes.map((recipe) => <tr key={recipe.title}><td>{recipe.title}</td><td>{recipe.calories}</td><td>{recipe.protein} g</td></tr>)}</tbody></table></div></section>}
        {active === 'shopping' && <section><p className="eyebrow">Vorratsbewusst</p><h1>Einkauf</h1><div className="panel">{shopping.map((item) => <label className="check" key={item.name}><input type="checkbox" /><span><strong>{item.name}</strong><small>{item.buy} {item.unit} kaufen · {item.pantry} {item.unit} aus Vorrat</small></span></label>)}</div></section>}
        {active === 'pantry' && <section><p className="eyebrow">Bestand</p><h1>Vorrat</h1><div className="panel">{pantry.map((item) => <p className="row" key={item.name}><span>{item.name}<small>{item.expires}</small></span><strong>{item.amount} {item.unit}</strong></p>)}</div></section>}
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <article className="panel"><h2>{title}</h2>{children}</article>;
}

function Progress({ label, value, max, suffix }: { label: string; value: number; max: number; suffix: string }) {
  return <div className="progress"><span>{label}</span><progress value={value} max={max} /><strong>{value} {suffix}</strong></div>;
}
