import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  ScanSearch,
  Network,
  Leaf,
  BookMarked,
  Landmark,
  History,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Logo from '../common/Logo';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/assistant', label: 'Ask IP-SAKTI', icon: MessageSquareText },
  { to: '/classify', label: 'Classify', icon: ScanSearch },
  { to: '/ip-explorer', label: 'IP Explorer', icon: Network },
  { to: '/abs-advisor', label: 'ABS Advisor', icon: Leaf },
  { to: '/knowledge', label: 'Knowledge', icon: BookMarked },
  { to: '/sources', label: 'Sources', icon: Landmark },
  { to: '/history', label: 'Query History', icon: History },
];

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {/* mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed lg:sticky top-0 z-40 h-screen shrink-0 flex flex-col border-r transition-all duration-200',
          collapsed ? 'w-[76px]' : 'w-[248px]',
          mobileOpen ? 'left-0' : '-left-full lg:left-0'
        )}
        style={{
          borderColor: 'color-mix(in srgb, var(--color-herbal-400) 18%, transparent)',
          backgroundColor: 'var(--color-forest-950)',
        }}
      >
        <div className="flex items-center justify-between px-4 h-16 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {!collapsed && (
            <div className="[&_div]:text-[var(--color-sandal-100)]">
              <Logo />
            </div>
          )}
          {collapsed && (
            <div className="mx-auto">
              <Logo collapsed />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors group',
                  isActive
                    ? 'text-white'
                    : 'text-[color-mix(in_srgb,var(--color-sandal-100)_65%,transparent)] hover:text-white'
                )
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'color-mix(in srgb, var(--color-herbal-500) 35%, transparent)' : 'transparent',
              })}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium mb-1',
                isActive ? 'text-white' : 'text-[color-mix(in_srgb,var(--color-sandal-100)_65%,transparent)] hover:text-white'
              )
            }
          >
            <Settings className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium w-full text-[color-mix(in_srgb,var(--color-sandal-100)_50%,transparent)] hover:text-white"
          >
            {collapsed ? <ChevronsRight className="w-[18px] h-[18px]" /> : <ChevronsLeft className="w-[18px] h-[18px]" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
