// The ONLY place that calls fetch. Components never call fetch directly.
// Response and error shapes are defined in docs/API_CONTRACT.md.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const err = json?.error ?? { code: 'NETWORK_ERROR', message: 'Request failed' }
    throw Object.assign(new Error(err.message), { code: err.code, status: res.status })
  }
  return json.data
}
