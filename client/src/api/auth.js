import { http } from './http'

const API_BASE = '/api/auth'

/**
 * Change password for a user
 * @param {string} userId - Mongo ObjectId of the user
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<any>} API response data
 */
export async function changePassword(userId, currentPassword, newPassword) {
  const res = await http.post(`${API_BASE}/change-password`, {
    userId,
    currentPassword,
    newPassword,
  })
  return res.data
}
