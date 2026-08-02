import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

export default function Profile() {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setLoading(false);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccess('Contraseña actualizada exitosamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex align-items-center gap-2 mb-5 text-color-secondary cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(-1)}>
        <i className="pi pi-arrow-left"></i> Volver
      </div>

      <div className="surface-card p-5 border-round shadow-2 mb-5">
        <h2 className="text-2xl font-bold mb-4 text-color">Perfil de Usuario</h2>
        
        <div className="grid">
          <div className="col-12 md:col-6 mb-3">
            <label className="block text-sm font-medium text-color-secondary mb-2">Nombre Completo</label>
            <IconField iconPosition="left" className="w-full">
              <InputIcon className="pi pi-user" />
              <InputText value={user?.name || ''} disabled className="w-full" />
            </IconField>
          </div>
          <div className="col-12 md:col-6 mb-3">
            <label className="block text-sm font-medium text-color-secondary mb-2">Correo Electrónico / Username</label>
            <IconField iconPosition="left" className="w-full">
              <InputIcon className="pi pi-envelope" />
              <InputText value={user?.username || ''} disabled className="w-full" />
            </IconField>
          </div>
        </div>
      </div>

      <div className="surface-card p-5 border-round shadow-2">
        <h3 className="text-xl font-bold mb-4 text-color border-bottom-1 surface-border pb-3">Cambiar Contraseña</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-column gap-4">
          {error && <Message severity="error" text={error} />}
          {success && <Message severity="success" text={success} />}

          <div className="flex flex-column gap-2">
            <label className="text-sm font-medium text-color-secondary">Contraseña Actual</label>
            <Password value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} feedback={false} toggleMask className="w-full" inputClassName="w-full" />
          </div>

          <div className="flex flex-column gap-2">
            <label className="text-sm font-medium text-color-secondary">Nueva Contraseña</label>
            <Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} feedback={true} toggleMask className="w-full" inputClassName="w-full" />
          </div>

          <div className="flex flex-column gap-2">
            <label className="text-sm font-medium text-color-secondary">Confirmar Nueva Contraseña</label>
            <Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} feedback={false} toggleMask className="w-full" inputClassName="w-full" />
          </div>

          <div className="flex justify-content-end mt-3">
            <Button label={loading ? 'Actualizando...' : 'Actualizar Contraseña'} type="submit" icon="pi pi-save" disabled={loading} />
          </div>
        </form>
      </div>
    </div>
  );
}
