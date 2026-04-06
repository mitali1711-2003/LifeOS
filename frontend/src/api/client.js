/**
 * API Client — a simple wrapper around fetch() for making API calls.
 * All our components use these functions instead of calling fetch directly.
 * This keeps API logic in one place and makes it easy to change later.
 */

const BASE_URL = '/api';

/**
 * Make a GET request.
 * Example: apiGet('/habits') calls GET /api/habits
 */
export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Make a POST request with a JSON body.
 * Example: apiPost('/habits', { name: "Read" }) calls POST /api/habits
 */
export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Make a DELETE request.
 * Example: apiDelete('/habits/1') calls DELETE /api/habits/1
 */
export async function apiDelete(path) {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`DELETE ${path} failed: ${res.statusText}`);
  }
  return res.json();
}
