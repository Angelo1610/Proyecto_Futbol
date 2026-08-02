import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import logoIcon from '../../img/logo-icon.png';

export default function Navbar() {
  const { user, currentRole, logout, selectRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuLeft = useRef(null);

  const getMenuItems = () => {
    if (currentRole === 'client') {
      return [
        { label: 'Explorar Eventos', icon: 'pi pi-compass', path: '/' },
        { label: 'Mis Reservas', icon: 'pi pi-book', path: '/tickets' },
      ];
    }
    if (currentRole === 'admin') {
      return [
        { label: 'Partidos', icon: 'pi pi-calendar-plus', path: '/admin/matches' },
        { label: 'Estadios', icon: 'pi pi-building', path: '/admin/stadiums' },
        { label: 'Usuarios', icon: 'pi pi-users', path: '/admin/users' },
        { label: 'Reportes', icon: 'pi pi-chart-bar', path: '/admin/reports' },
      ];
    }
    return [];
  };

  function getUserMenuModel() {
    return [
      { label: 'Editar Perfil', icon: 'pi pi-user-edit', command: () => navigate('/profile') },
      { separator: true },
      { label: 'Cerrar Sesión', icon: 'pi pi-power-off', className: 'text-red-400', command: () => logout() },
    ];
  }

  const navItems = getMenuItems();

  return (
    <div
      className="sticky top-0 z-5 flex align-items-center justify-content-between gap-3 px-4 md:px-5"
      style={{ height: '68px', backgroundColor: 'var(--tg-ink)', borderBottom: '1px solid var(--tg-ink-border)' }}
    >
      {/* Marca */}
      <Link to="/" className="flex align-items-center gap-2 flex-shrink-0" style={{ textDecoration: 'none' }}>
        <img src={logoIcon} alt="TickGo" style={{ height: '30px', width: 'auto' }} />
        <span className="text-xl font-bold" style={{ color: '#f5f7f5', letterSpacing: '-0.02em' }}>
          Tick<span style={{ color: 'var(--tg-green)' }}>Go</span>
        </span>
      </Link>

      {/* Navegación central */}
      {navItems.length > 0 && (
        <div className="hidden md:flex align-items-center gap-1 flex-1 justify-content-center">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                label={item.label}
                icon={item.icon}
                text
                onClick={() => navigate(item.path)}
                className="p-button-sm"
                style={{
                  color: active ? 'var(--tg-green)' : 'rgba(255,255,255,0.75)',
                  backgroundColor: active ? 'rgba(106,197,47,0.12)' : 'transparent',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Acciones */}
      <div className="flex align-items-center gap-3 flex-shrink-0">
        {user?.roles?.length > 1 && (
          <div className="hidden lg:flex align-items-center gap-1 border-right-1 pr-3 mr-1" style={{ borderColor: 'var(--tg-ink-border)' }}>
            {user.roles.map((r) => (
              <Button
                key={r}
                label={r === 'admin' ? 'Admin' : 'Cliente'}
                icon={r === 'admin' ? 'pi pi-server' : 'pi pi-shopping-bag'}
                text
                className="p-button-sm"
                onClick={() => {
                  selectRole(r);
                  navigate(r === 'admin' ? '/admin' : '/');
                }}
                style={{
                  color: currentRole === r ? 'var(--tg-green)' : 'rgba(255,255,255,0.6)',
                  backgroundColor: currentRole === r ? 'rgba(106,197,47,0.12)' : 'transparent',
                }}
              />
            ))}
          </div>
        )}

        {!user ? (
          <Button
            label="Ingresar"
            icon="pi pi-user"
            onClick={() => navigate('/login')}
            className="p-button-sm"
            style={{ backgroundColor: 'var(--tg-green)', border: 'none', color: 'var(--tg-ink)', fontWeight: 700 }}
          />
        ) : (
          <>
            <div
              className="flex align-items-center gap-2 cursor-pointer p-2 border-round transition-colors transition-duration-150"
              onClick={(e) => menuLeft.current.toggle(e)}
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Avatar icon="pi pi-user" shape="circle" style={{ backgroundColor: 'var(--tg-green)', color: 'var(--tg-ink)' }} />
              <div className="hidden md:flex flex-column align-items-start">
                <span className="text-sm font-bold" style={{ color: '#f5f7f5' }}>{user?.name}</span>
                <span className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.55)' }}>{currentRole || 'usuario'}</span>
              </div>
            </div>
            <Menu model={getUserMenuModel()} popup ref={menuLeft} id="popup_menu_left" />
          </>
        )}
      </div>
    </div>
  );
}
