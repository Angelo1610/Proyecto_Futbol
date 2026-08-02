import { masterApi, setTokens, clearTokens, getAccessToken } from './client';

export function mapUser(userResponse) {
  if (!userResponse) return null;
  const person = userResponse.person ?? {};
  const name = [person.firstName, person.lastName].filter(Boolean).join(' ').trim();
  return {
    id: userResponse.id,
    username: userResponse.username,
    name: name || userResponse.username,
    roles: userResponse.roles ?? [],
    person,
    active: userResponse.active,
  };
}

export async function login(username, password) {
  const data = await masterApi.post('/api/auth/login', { username, password }, { auth: false });
  setTokens(data);
  return mapUser(data.user);
}

export async function logout() {
  try {
    if (getAccessToken()) {
      await masterApi.post('/api/auth/logout', undefined, { auth: true });
    }
  } finally {
    clearTokens();
  }
}

export async function register({ firstName, middleName, lastName, dni, email, phone, address, nationality }) {
  const data = await masterApi.post(
    '/api/v1/users/',
    { firstName, middleName, lastName, dni, email, phone, address, nationality },
    { auth: false },
  );
  return mapUser(data);
}

export async function changePassword(currentPassword, newPassword) {
  await masterApi.patch('/api/auth/change-password', { currentPassword, newPassword });
}
