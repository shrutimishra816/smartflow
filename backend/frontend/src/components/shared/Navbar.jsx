import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, ClipboardList, History, Settings,
  BookOpen, Stethoscope, Menu, X, LogOut, Leaf,
  Calendar, Dumbbell, Activity
} from 'lucide-react'
import { useState } from 'react'

// All nav items (desktop + hamburger)
const ALL_NAV = [
  { to:'/dashboard',    label:'Dashboard',  icon:LayoutDashboard },
  { to:'/log',          label:'Log Today',  icon:ClipboardList   },
  { to:'/calendar',     label:'Calendar',   icon:Calendar        },
  { to:'/history',      label:'History',    icon:History         },
  { to:'/education',    label:'Learn',      icon:BookOpen        },
  { to:'/remedies',     label:'Remedies',   icon:Leaf            },
  { to:'/symptom-check',label:'Checker',    icon:Activity        },
  { to:'/doctors',      label:'Doctors',    icon:Stethoscope     },
  { to:'/athlete',      label:'Athlete Hub',icon:Dumbbell        },
  { to:'/settings',     label:'Settings',   icon:Settings        },
]

// Bottom nav (5 most important for mobile)
const BOTTOM_NAV = [
  { to:'/dashboard', label:'Home',     icon:LayoutDashboard },
  { to:'/calendar',  label:'Calendar', icon:Calendar        },
  { to:'/log',       label:'Log',      icon:ClipboardList   },
  { to:'/remedies',  label:'Remedies', icon:Leaf            },
  { to:'/athlete',   label:'Athlete',  icon:Dumbbell        },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate  = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (to) => location.pathname === to

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {/* ── Desktop top navbar ─────────────────────────────────────── */}
      <nav className="hidden md:flex fixed top-0 inset-x-0 z-50
                      bg-white/90 backdrop-blur border-b border-blush-dark
                      items-center justify-between px-5 h-14">
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🌊</span>
          <span className="font-display text-lg text-ink">SmartFlow</span>
        </Link>

        {/* Scrollable nav links */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide mx-3">
          {ALL_NAV.map(({ to, label, icon:Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium
                          whitespace-nowrap transition-all
                ${isActive(to)
                  ? 'bg-blush text-rose'
                  : 'text-ink-soft hover:text-ink hover:bg-blush/50'}`}>
              <Icon size={12}/>{label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-ink-soft font-body hidden lg:block">
            Hi, {user?.username}
          </span>
          <button onClick={handleLogout}
            className="text-ink-soft hover:text-rose p-1.5 transition-colors"
            title="Sign out">
            <LogOut size={15}/>
          </button>
        </div>
      </nav>

      {/* ── Mobile top bar ──────────────────────────────────────────── */}
      <nav className="md:hidden fixed top-0 inset-x-0 z-50
                      bg-white/95 backdrop-blur border-b border-blush-dark
                      flex items-center justify-between px-4 h-12">
        <Link to="/dashboard" className="flex items-center gap-1.5">
          <span className="text-xl">🌊</span>
          <span className="font-display text-base text-ink">SmartFlow</span>
        </Link>
        <button onClick={() => setMenuOpen(o=>!o)}
          className="p-1.5 text-ink-soft hover:text-rose">
          {menuOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </nav>

      {/* ── Mobile hamburger dropdown ───────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden fixed top-12 inset-x-0 z-40
                        bg-white border-b border-blush-dark shadow-xl
                        max-h-[70vh] overflow-y-auto">
          {ALL_NAV.map(({ to, label, icon:Icon }) => (
            <Link key={to} to={to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium
                          border-b border-blush
                ${isActive(to) ? 'text-rose bg-blush' : 'text-ink-soft hover:bg-blush/40'}`}>
              <Icon size={16}/>{label}
            </Link>
          ))}
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3 w-full text-left
                       text-sm text-ink-soft hover:text-rose">
            <LogOut size={16}/>Sign Out
          </button>
        </div>
      )}

      {/* ── Mobile bottom nav ───────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50
                      bg-white/95 backdrop-blur border-t border-blush-dark
                      grid grid-cols-5"
           style={{ paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
        {BOTTOM_NAV.map(({ to, label, icon:Icon }) => (
          <Link key={to} to={to}
            className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors
              ${isActive(to) ? 'text-rose' : 'text-ink-soft'}`}>
            <Icon size={20} strokeWidth={isActive(to) ? 2.5 : 1.8}/>
            <span className="text-[10px] font-medium">{label}</span>
            {isActive(to) && <span className="w-1 h-1 rounded-full bg-rose"/>}
          </Link>
        ))}
      </nav>
    </>
  )
}
