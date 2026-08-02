import { masterApi } from './client';

export function mapUserRow(userResponse) {
  const person = userResponse.person ?? {};
  const name = [person.firstName, person.lastName].filter(Boolean).join(' ').trim();
  return {
    id: userResponse.id,
    name: name || userResponse.username,
    username: userResponse.username,
    roles: userResponse.roles ?? [],
    status: userResponse.active ? 'ACTIVO' : 'INACTIVO',
    person,
  };
}

export async function getUsers() {
  const users = await masterApi.get('/api/v1/users/');
  return users.map(mapUserRow);
}

export function getRoles() {
  return masterApi.get('/api/v1/roles');
}

export async function createUser({ firstName, middleName, lastName, dni, email, phone, address, nationality, password }) {
  const user = await masterApi.post('/api/v1/users/', {
    firstName,
    middleName,
    lastName,
    dni,
    email,
    phone,
    address,
    nationality,
    password,
  });
  return mapUserRow(user);
}

export async function updateUser(id, patch) {
  const user = await masterApi.patch(`/api/v1/users/${id}`, patch);
  return mapUserRow(user);
}

export function deleteUser(id) {
  return masterApi.delete(`/api/v1/users/${id}`);
}

export async function assignRole(userId, roleId) {
  const user = await masterApi.post(`/api/v1/users/${userId}/roles/${roleId}`, undefined);
  return mapUserRow(user);
}

export function removeRole(userId, roleId) {
  return masterApi.delete(`/api/v1/users/${userId}/roles/${roleId}`);
}
