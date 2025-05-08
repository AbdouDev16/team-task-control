
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  ClipboardList, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  FileText, 
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const NavItem = ({ to, icon, label, allowed = true }: { 
    to: string; 
    icon: React.ReactNode; 
    label: string;
    allowed?: boolean;
  }) => {
    if (!allowed) return null;
    
    return (
      <NavLink 
        to={to} 
        className={({ isActive }) => cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
          isActive 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        {icon}
        <span>{label}</span>
      </NavLink>
    );
  };

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Gérant';
  const isProjectManager = user?.role === 'Chef_Projet';

  return (
    <aside className="bg-sidebar w-64 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">GestionPro</h1>
      </div>
      
      <nav className="space-y-2 flex-1">
        <NavItem to="/dashboard" icon={<Home size={18} />} label="Tableau de bord" />
        <NavItem to="/projects" icon={<ClipboardList size={18} />} label="Projets" />
        <NavItem to="/tasks" icon={<FileText size={18} />} label="Tâches" />
        <NavItem to="/calendar" icon={<Calendar size={18} />} label="Calendrier" />
        <NavItem 
          to="/users" 
          icon={<Users size={18} />} 
          label="Utilisateurs" 
          allowed={isAdmin || isManager} 
        />
        <NavItem 
          to="/reports" 
          icon={<FileText size={18} />} 
          label="Rapports" 
          allowed={isProjectManager || isManager || isAdmin} 
        />
      </nav>
      
      {user && (
        <div className="border-t border-sidebar-border pt-4 mt-auto">
          <div className="flex items-center mb-4 gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <NavItem to="/settings" icon={<Settings size={18} />} label="Paramètres" />
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left text-destructive hover:bg-destructive/10"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
