import { Plus } from 'lucide-react';
import { db } from '../db/db';
import type { PantryItem } from '../types';

interface PantryProps { pantry: PantryItem[]; }

export function Pantry({ pantry }: PantryProps) {
  async function addPantryItem() { await db.pantryItems.add({ name: 'Neuer Vorrat', quantity: 1, unit: 'piece', category: 'Allgemein', updatedAt: new Date().toISOString() }); }
  return <section className="view-stack" aria-labelledby="pantry-title"><div className="view-header row-header"><div><p>Bestand und Ablaufdaten</p><h1 id="pantry-title">Vorrat</h1></div><button className="primary-button" onClick={addPantryItem}><Plus size={16} /> Vorrat</button></div><div className="table-card"><table><thead><tr><th>Artikel</th><th>Kategorie</th><th>Menge</th><th>Ablauf</th></tr></thead><tbody>{pantry.map((item) => <tr key={item.id}><th>{item.name}</th><td>{item.category}</td><td>{item.quantity} {item.unit}</td><td>{item.expiresAt ?? 'Nicht gesetzt'}</td></tr>)}</tbody></table></div></section>;
}
