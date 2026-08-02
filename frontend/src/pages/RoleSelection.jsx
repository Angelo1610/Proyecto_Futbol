import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import logoIcon from '../img/logo-icon.png';

export default function RoleSelection() {
  const { user, selectRole } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    selectRole(selected);
    if (selected === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const roles = [
    {
      id: 'client',
      title: 'Modo Cliente',
      description: 'Compra boletos y explora eventos.',
      icon: 'pi pi-shopping-bag',
      color: 'var(--teal-500, #14b8a6)',
    },
    {
      id: 'admin',
      title: 'Modo Administrador',
      description: 'Gestiona la plataforma y sus recursos.',
      icon: 'pi pi-server',
      color: 'var(--tg-ink, #334155)',
    }
  ];

  return (
    <div className="w-full min-h-screen animated-lines-bg flex align-items-center justify-content-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-26rem solid-bg-white p-5 md:p-6 shadow-8 border-round-3xl flex flex-column justify-content-center"
      >
        <div className="text-center mb-5">
          <img src={logoIcon} alt="TickGo" className="mx-auto mb-4" style={{ height: '38px', width: 'auto' }} />
          <h1 className="text-2xl font-bold text-color m-0 mb-1">¡Hola, {user?.name.split(' ')[0] || 'Usuario'}!</h1>
          <p className="text-color-secondary m-0 text-sm">Selecciona el entorno de trabajo</p>
        </div>

        <div className="flex flex-column gap-3 mb-5">
          {roles.map(role => {
            const isSelected = selected === role.id;
            return (
              <div 
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`p-3 border-round-2xl cursor-pointer transition-all border-2 flex align-items-center gap-4 ${isSelected ? 'border-primary surface-hover shadow-3' : 'border-300 surface-50 hover:surface-100 hover:border-400'}`}
              >
                <div 
                  className={`w-3rem h-3rem border-circle flex align-items-center justify-content-center text-white shadow-1 ${isSelected ? 'scale-110 transition-transform' : ''}`}
                  style={{ backgroundColor: role.color }}
                >
                  <i className={`${role.icon} text-xl`}></i>
                </div>
                <div className="flex-1">
                  <h3 className={`m-0 text-lg mb-1 ${isSelected ? 'font-bold text-color' : 'font-medium text-color-secondary'}`}>
                    {role.title}
                  </h3>
                  <p className="m-0 text-xs text-color-secondary line-height-2">{role.description}</p>
                </div>
                <div className="w-2rem flex justify-content-end align-items-center pointer-events-none">
                  <RadioButton 
                    inputId={role.id} 
                    name="role" 
                    value={role.id} 
                    onChange={(e) => setSelected(e.value)} 
                    checked={isSelected} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Button 
          label="Continuar" 
          icon="pi pi-arrow-right" 
          iconPos="right" 
          className="w-full p-button-lg shadow-3" 
          disabled={!selected}
          onClick={handleContinue}
        />
        
        <div className="mt-4 text-center">
          <Button 
            label="Cancelar y Volver" 
            className="p-button-text p-button-sm p-button-secondary" 
            onClick={() => navigate('/login')}
          />
        </div>
      </motion.div>
    </div>
  );
}
