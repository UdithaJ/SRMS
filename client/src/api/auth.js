import axios from 'axios'

const API_BASE = 'http://127.0.0.1:3000/api/auth'

/**
 * Change password for a user
 * @param {string} userId - Mongo ObjectId of the user
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<any>} API response data
 */
export async function changePassword(userId, currentPassword, newPassword) {
  const res = await axios.post(`${API_BASE}/change-password`, {
    userId,
    currentPassword,
    newPassword,
  })
  return res.data
}
