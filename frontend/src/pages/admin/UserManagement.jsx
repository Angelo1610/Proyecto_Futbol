import React, { useState, useRef, useEffect } from 'react';
import { getUsers, getRoles, createUser, updateUser, deleteUser, assignRole, removeRole as removeRoleApi } from '../../api/users';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Menu } from 'primereact/menu';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const menuRef = useRef(null);
  const [selectedUserForMenu, setSelectedUserForMenu] = useState(null);

  useEffect(() => {
    Promise.all([getUsers(), getRoles()])
      .then(([usersData, rolesData]) => {
        setUsers(usersData);
        setRoles(rolesData);
      })
      .catch((err) => setError(err.message || 'No se pudo cargar la información'))
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (id) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    try {
      const updated = await updateUser(id, { active: target.status === 'INACTIVO' });
      setUsers(users.map(u => u.id === id ? updated : u));
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el estado del usuario');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setRegisterError('');
    const formData = new FormData(e.target);
    const payload = {
      firstName: formData.get('firstName'),
      middleName: formData.get('middleName'),
      lastName: formData.get('lastName'),
      dni: formData.get('dni'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      nationality: formData.get('nationality'),
    };
    const role = formData.get('role');

    setRegistering(true);
    try {
      let newUser = await createUser(payload);
      if (role === 'admin') {
        const adminRole = roles.find(r => r.name === 'admin');
        if (adminRole) newUser = await assignRole(newUser.id, adminRole.id);
      }
      setUsers([newUser, ...users]);
      setIsRegisterOpen(false);
      e.target.reset();
    } catch (err) {
      setRegisterError(err.message || 'No se pudo crear el usuario');
    } finally {
      setRegistering(false);
    }
  };

  const removeRole = async (userId, roleName) => {
    const role = roles.find(r => r.name === roleName);
    const user = users.find(u => u.id === userId);
    if (!role || !user) return;
    if (user.roles.length === 1) {
      alert('El usuario debe tener al menos un rol.');
      return;
    }
    try {
      await removeRoleApi(userId, role.id);
      const updatedRoles = user.roles.filter(r => r !== roleName);
      setUsers(users.map(u => u.id === userId ? { ...u, roles: updatedRoles } : u));
      setRoleModalUser(prev => prev && ({ ...prev, roles: updatedRoles }));
    } catch (err) {
      setError(err.message || 'No se pudo remover el rol');
    }
  };

  const addRole = async (userId, roleName) => {
    const role = roles.find(r => r.name === roleName);
    const user = users.find(u => u.id === userId);
    if (!role || !user || user.roles.includes(roleName)) return;
    try {
      await assignRole(userId, role.id);
      const updatedRoles = [...user.roles, roleName];
      setUsers(users.map(u => u.id === userId ? { ...u, roles: updatedRoles } : u));
      setRoleModalUser(prev => prev && ({ ...prev, roles: updatedRoles }));
    } catch (err) {
      setError(err.message || 'No se pudo asignar el rol');
    }
  };

  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete);
      setUsers(users.filter(u => u.id !== userToDelete));
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el usuario');
    } finally {
      setUserToDelete(null);
    }
  };

  const userTemplate = (rowData) => {
    return (
      <div className="flex align-items-center gap-4 py-2">
        <div className="w-3rem h-3rem border-circle flex align-items-center justify-content-center font-bold text-xl shadow-2 bg-primary text-primary-reverse">
          {rowData.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-column">
          <span className="font-bold text-color text-lg">{rowData.name}</span>
          <span className="text-sm text-color-secondary mt-1">{rowData.username}</span>
        </div>
      </div>
    );
  };

  const rolesTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        {rowData.roles.map(r => (
          <span key={r} className={`px-3 py-1 border-round-3xl text-xs font-bold flex align-items-center gap-2 shadow-1 ${r === 'admin' ? 'bg-primary text-primary-reverse' : 'surface-100 text-color-secondary border-1 surface-border'}`}>
            <i className={r === 'admin' ? 'pi pi-shield' : 'pi pi-user'} style={{fontSize: '12px'}}></i>
            <span className="uppercase tracking-widest">{r === 'admin' ? 'Admin' : 'Cliente'}</span>
          </span>
        ))}
      </div>
    );
  };

  const statusTemplate = (rowData) => {
    return (
      <Button
        label={rowData.status || 'ACTIVO'}
        className={`p-button-sm p-button-rounded font-bold tracking-widest text-xs px-3 shadow-1 ${rowData.status === 'INACTIVO' ? 'bg-gray-200 text-gray-600 border-none' : 'bg-green-100 text-green-700 border-none'}`}
        onClick={() => toggleStatus(rowData.id)}
      />
    );
  };

  const menuItems = [
    {
      label: 'Gestionar Roles',
      icon: 'pi pi-shield',
      command: () => {
        if (selectedUserForMenu) setRoleModalUser(selectedUserForMenu);
      }
    },
    {
      separator: true
    },
    {
      label: 'Eliminar Usuario',
      icon: 'pi pi-trash',
      className: 'text-red-500',
      command: () => {
        if (selectedUserForMenu) confirmDeleteUser(selectedUserForMenu.id);
      }
    }
  ];

  const actionTemplate = (rowData) => {
    return (
      <div className="flex align-items-center justify-content-end gap-3 pr-4">
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-rounded p-button-secondary p-button-text hover:bg-gray-200 transition-colors"
          onClick={(e) => {
            setSelectedUserForMenu(rowData);
            menuRef.current.toggle(e);
          }}
          aria-controls="popup_menu"
          aria-haspopup
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-content-center p-8">
        <ProgressSpinner style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-column gap-5">
      <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-color m-0">Gestión de Usuarios</h1>
          <p className="text-color-secondary mt-1">Administra los accesos y roles del sistema.</p>
        </div>
        <Button label="Nuevo Usuario" icon="pi pi-plus" className="p-button-primary" onClick={() => { setRegisterError(''); setIsRegisterOpen(true); }} />
      </div>

      {error && <Message severity="error" text={error} />}

      <div className="solid-bg-white border-round-3xl shadow-4 overflow-hidden border-1 border-200">
        <Menu model={menuItems} popup ref={menuRef} id="popup_menu" className="border-round-2xl shadow-4 p-2" />
        <DataTable value={users} paginator rows={10} className="p-datatable-lg border-none" rowHover stripedRows={false}>
          <Column field="name" header="Usuario" body={userTemplate} sortable style={{ minWidth: '300px' }} className="pl-4"></Column>
          <Column field="roles" header="Roles Asignados" body={rolesTemplate} style={{ minWidth: '200px' }}></Column>
          <Column field="status" header="Estado de Cuenta" body={statusTemplate} sortable style={{ minWidth: '150px' }}></Column>
          <Column body={actionTemplate} align="right" className="pr-4"></Column>
        </DataTable>
      </div>

      <Dialog header="Registrar Usuario" visible={isRegisterOpen} onHide={() => setIsRegisterOpen(false)} style={{ width: '450px' }}>
        <form onSubmit={handleCreateUser} className="flex flex-column gap-4 pt-3">
          {registerError && <Message severity="error" text={registerError} />}
          <div className="grid formgrid">
            <div className="field col-4">
              <label htmlFor="firstName">Primer Nombre</label>
              <InputText id="firstName" name="firstName" required className="w-full" placeholder="Ana" />
            </div>
            <div className="field col-4">
              <label htmlFor="middleName">Segundo Nombre</label>
              <InputText id="middleName" name="middleName" className="w-full" placeholder="María" />
            </div>
            <div className="field col-4">
              <label htmlFor="lastName">Apellidos</label>
              <InputText id="lastName" name="lastName" required className="w-full" placeholder="Pérez" />
            </div>
          </div>
          <div className="flex flex-column gap-2">
            <label htmlFor="email">Correo Electrónico</label>
            <IconField iconPosition="left" className="w-full">
              <InputIcon className="pi pi-envelope" />
              <InputText id="email" name="email" type="email" required className="w-full" placeholder="ana@ejemplo.com" />
            </IconField>
          </div>
          <div className="grid formgrid">
            <div className="field col-6">
              <label htmlFor="dni">Cédula</label>
              <InputText id="dni" name="dni" required className="w-full" placeholder="1000000000" />
            </div>
            <div className="field col-6">
              <label htmlFor="phone">Celular</label>
              <InputText id="phone" name="phone" required className="w-full" placeholder="0991234567" />
            </div>
          </div>
          <div className="grid formgrid">
            <div className="field col-6">
              <label htmlFor="address">Dirección</label>
              <InputText id="address" name="address" required className="w-full" placeholder="Av. Siempre Viva 123" />
            </div>
            <div className="field col-6">
              <label htmlFor="nationality">Nacionalidad</label>
              <InputText id="nationality" name="nationality" required defaultValue="Ecuatoriana" className="w-full" />
            </div>
          </div>
          <Message severity="info" text="El usuario y la contraseña de primer acceso se generan automáticamente y se envían al correo indicado." className="w-full" />
          <div className="flex flex-column gap-2">
            <label htmlFor="role">Rol Inicial</label>
            <Dropdown id="role" name="role" options={[{label: 'Cliente', value: 'client'}, {label: 'Administrador', value: 'admin'}]} defaultValue="client" className="w-full" />
          </div>
          <div className="flex gap-2 mt-2">
            <Button label="Cancelar" type="button" className="p-button-text flex-1" onClick={() => setIsRegisterOpen(false)} disabled={registering} />
            <Button label={registering ? 'Creando...' : 'Crear Usuario'} type="submit" className="p-button-primary flex-1" disabled={registering} />
          </div>
        </form>
      </Dialog>

      <Dialog header={`Gestionar Roles - ${roleModalUser?.name}`} visible={!!roleModalUser} onHide={() => setRoleModalUser(null)} style={{ width: '400px' }}>
        {roleModalUser && (
          <div className="flex flex-column gap-4 pt-3">
            <div>
              <h4 className="text-sm text-color-secondary uppercase mb-3">Roles Actuales</h4>
              <div className="flex flex-column gap-2">
                {roleModalUser.roles.map(r => (
                  <div key={r} className="flex justify-content-between align-items-center surface-ground p-3 border-round-lg border-1 surface-border">
                    <span className="font-bold text-color capitalize">{r === 'admin' ? 'Administrador' : 'Cliente'}</span>
                    <Button icon="pi pi-times" className="p-button-rounded p-button-text p-button-danger p-button-sm" onClick={() => removeRole(roleModalUser.id, r)} tooltip="Remover Rol" />
                  </div>
                ))}
              </div>
            </div>

            {roleModalUser.roles.length < 2 && (
              <div className="pt-3 border-top-1 surface-border">
                <h4 className="text-sm text-color-secondary uppercase mb-3">Añadir Rol</h4>
                <div className="flex flex-column gap-2">
                  {!roleModalUser.roles.includes('admin') && (
                    <Button label="Administrador" icon="pi pi-plus" className="p-button-outlined p-button-primary w-full justify-content-start" onClick={() => addRole(roleModalUser.id, 'admin')} />
                  )}
                  {!roleModalUser.roles.includes('client') && (
                    <Button label="Cliente" icon="pi pi-plus" className="p-button-outlined p-button-info w-full justify-content-start" onClick={() => addRole(roleModalUser.id, 'client')} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>

      <Dialog header="Eliminar Usuario" visible={!!userToDelete} onHide={() => setUserToDelete(null)} style={{ width: '400px' }}>
        <div className="flex flex-column align-items-center text-center gap-3 pt-3">
          <i className="pi pi-exclamation-triangle text-red-500 text-5xl"></i>
          <p className="m-0 text-color-secondary">¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.</p>
          <div className="flex gap-2 w-full mt-3">
            <Button label="Cancelar" className="p-button-text flex-1" onClick={() => setUserToDelete(null)} />
            <Button label="Sí, Eliminar" className="p-button-danger flex-1" onClick={executeDelete} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
