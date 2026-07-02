import type { ReactNode } from 'react';
import { BarChart3, CalendarDays, ChefHat, Home, Package, ShoppingCart } from 'lucide-react';

export type ViewId = 'dashboard' | 'recipes' | 'planner' | 'nutrition' | 'shopping' | 'pantry';

const navItems = [
  { id: 'dashboard' as const, label: 'Übersicht', icon: Home },
  { id: 'planner' as const, label: 'Essensplan', icon: CalendarDays },
  { id: 'recipes' as const, label: 'Rezepte', icon: ChefHat },
  { id: 'nutrition' as const, label: 'Ernährung', icon: BarChart3 },
  { id: 'shopping' as const, label: 'Einkauf', icon: ShoppingCart },
  { id: 'pantry' as const, label: 'Vorrat', icon: Package }
];

interface AppShellProps { activeView: ViewId; onViewChange: (view: ViewId) => void; children: ReactNode; }

export function AppShell({ activeView, onViewChange, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Hauptnavigation">
        <div className="brand"><span className="brand-mark">E</span><div><strong>Essensplan</strong><span>Lokal. Klar. Planbar.</span></div></div>
        <nav className="nav-list">
          {navItems.map((item) => { const Icon = item.icon; return <button key={item.id} className={activeView === item.id ? 'nav-item active' : 'nav-item'} onClick={() => onViewChange(item.id)} aria-current={activeView === item.id ? 'page' : undefined}><Icon size={18} aria-hidden="true" /><span>{item.label}</span></button>; })}
        </nav>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
