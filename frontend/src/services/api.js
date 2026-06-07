/**
 * API service layer — wraps all backend calls.
 * Using fetch instead of axios to avoid the extra dependency concern,
 * but axios is listed in package.json for teams that prefer it.
 */

const BASE = '/api'

/**
 * Health check — verifies backend + Ollama are reachable.
 * @returns {Promise<{status: string, ollama: string}>}
 */
export async function checkHealth() {
  const res = await fetch(`${BASE}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

/**
 * Summarize a file upload.
 * @param {File} file
 * @param {'short'|'medium'|'detailed'} summaryType
 * @returns {Promise<{success: boolean, summary: string, char_count: number, word_count: number}>}
 */
export async function summarizeFile(file, summaryType) {
  const form = new FormData()
  form.append('file', file)
  form.append('summary_type', summaryType)

  const res = await fetch(`${BASE}/summarize`, {
    method: 'POST',
    body: form,
  })

  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Server error: ${res.status}`)
  }
  return data
}

/**
 * Summarize raw text.
 * @param {string} text
 * @param {'short'|'medium'|'detailed'} summaryType
 * @returns {Promise<{success: boolean, summary: string, char_count: number, word_count: number}>}
 */
export async function summarizeText(text, summaryType) {
  const res = await fetch(`${BASE}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, summary_type: summaryType }),
  })

  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.error || `Server error: ${res.status}`)
  }
  return data
}
