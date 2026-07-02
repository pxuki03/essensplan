import { RefreshCw } from 'lucide-react';
import { db } from '../db/db';
import { generateShoppingItems, remainingQuantity } from '../services/groceries';
import type { MealPlanEntry, PantryItem, PriceObservation, RecipeIngredient, ShoppingList, ShoppingListItem, Store } from '../types';

interface GroceriesProps { meals: MealPlanEntry[]; ingredients: RecipeIngredient[]; pantry: PantryItem[]; lists: ShoppingList[]; listItems: ShoppingListItem[]; stores: Store[]; prices: PriceObservation[]; }

export function Groceries({ meals, ingredients, pantry, lists, listItems, stores, prices }: GroceriesProps) {
  const activeList = lists.find((list) => list.status === 'active') ?? lists[0];
  const visibleItems = activeList ? listItems.filter((item) => item.shoppingListId === activeList.id) : [];
  async function regenerateList() {
    const today = new Date().toISOString().slice(0, 10);
    const id = Number(await db.shoppingLists.add({ title: 'Generierter Einkauf', status: 'active', fromDate: today, toDate: today, createdAt: new Date().toISOString() }));
    await db.shoppingListItems.bulkAdd(generateShoppingItems(meals, ingredients, pantry, id));
  }
  async function toggleItem(item: ShoppingListItem) { if (item.id) await db.shoppingListItems.update(item.id, { checked: !item.checked }); }
  return <section className="view-stack" aria-labelledby="shopping-title"><div className="view-header row-header"><div><p>Vorratsbewusst</p><h1 id="shopping-title">Einkauf</h1></div><button className="primary-button" onClick={regenerateList}><RefreshCw size={16} /> Liste erzeugen</button></div><div className="two-column"><article className="panel"><h2>{activeList?.title ?? 'Keine Liste'}</h2>{visibleItems.map((item) => <label className="check-row" key={item.id}><input type="checkbox" checked={item.checked} onChange={() => toggleItem(item)} /><span><strong>{item.name}</strong><small>{remainingQuantity(item)} {item.unit} kaufen · {item.pantryDeduction} {item.unit} aus Vorrat</small></span></label>)}</article><article className="panel"><h2>Preisverlauf</h2>{prices.map((price) => <p className="list-row" key={price.id}><span>{price.itemName}<small>{stores.find((store) => store.id === price.storeId)?.name ?? 'Ohne Laden'}</small></span><strong>{price.price.toFixed(2)} €</strong></p>)}</article></div></section>;
}
