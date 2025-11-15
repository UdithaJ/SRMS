<template>
  <div class="user-list">
    <h2>Users</h2>
    <div class="actions">
      <button @click="openAddModal">Add User</button>
      <button @click="fetchUsers">Refresh List</button>
    </div>

    <p v-if="loading">Loading users...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <table v-if="users.length" border="1" cellpadding="8">
      <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>User Name</th>
          <th>Reference No</th>
          <th>User Role</th>
          <th>Section</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user._id">
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.userName }}</td>
          <td>{{ user.referenceNo }}</td>
          <td>{{ user.userRole }}</td>
          <td>{{ user.userRole === 'section staff' ? getSectionName(user.section) : '-' }}</td>
          <td>
            <button @click="openEditModal(user)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No users found.</p>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ isEditMode ? 'Edit User' : 'Add User' }}</h3>
        <form @submit.prevent="isEditMode ? updateUser() : addUser()">
          <div>
            <label>First Name:</label>
            <input type="text" v-model="modalUser.firstName" required />
          </div>
          <div>
            <label>Last Name:</label>
            <input type="text" v-model="modalUser.lastName" required />
          </div>
          <div>
            <label>User Name:</label>
            <input type="text" v-model="modalUser.userName" required />
          </div>
          <div>
            <label>Reference No:</label>
            <input type="text" v-model="modalUser.referenceNo" required />
          </div>
          <div>
            <label>User Role:</label>
            <select v-model="modalUser.userRole" required @change="onRoleChange">
              <option value="" disabled>Select role</option>
              <option value="admin">Admin</option>
              <option value="reporter">Reporter</option>
              <option value="section staff">Section Staff</option>
            </select>
          </div>

          <!-- Section dropdown visible only if role is 'section staff' -->
          <div v-if="modalUser.userRole === 'section staff'">
            <label>Section:</label>
            <select v-model="modalUser.section" required>
              <option value="" disabled>Select section</option>
              <option v-for="sec in sections" :key="sec._id" :value="sec._id">{{ sec.name }}</option>
            </select>
          </div>

          <div>
            <label>Password:</label>
            <input
              type="password"
              v-model="modalUser.password"
              :placeholder="isEditMode ? 'Leave blank to keep current password' : ''"
              :required="!isEditMode"
            />
          </div>
          <div class="modal-actions">
            <button type="submit">{{ isEditMode ? 'Save' : 'Add' }}</button>
            <button type="button" @click="closeModal">Cancel</button>
          </div>
        </form>
        <p v-if="modalMessage" :class="{ error: modalError, success: !modalError }">{{ modalMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])
const sections = ref([]) // store the sections list
const loading = ref(false)
const error = ref('')

const showModal = ref(false)
const isEditMode = ref(false)
const modalUser = ref({
  _id: '',
  firstName: '',
  lastName: '',
  userName: '',
  referenceNo: '',
  password: '',
  userRole: '',
  section: ''
})
const modalMessage = ref('')
const modalError = ref(false)

// Fetch all users
const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get('http://127.0.0.1:3000/api/auth/users')
    users.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

// Fetch sections from API
const fetchSections = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:3000/api/sections')
    sections.value = res.data
  } catch (err) {
    console.error('Failed to fetch sections', err)
  }
}

// Clear section if role is not 'section staff'
const onRoleChange = () => {
  if (modalUser.value.userRole !== 'section staff') {
    modalUser.value.section = ''
  }
}

// Helper to get section name from ID
const getSectionName = (id) => {
  const sec = sections.value.find(s => s._id === id)
  return sec ? sec.name : '-'
}

// Open add modal
const openAddModal = () => {
  isEditMode.value = false
  modalUser.value = { _id: '', firstName: '', lastName: '', userName: '', referenceNo: '', password: '', userRole: '', section: '' }
  modalMessage.value = ''
  showModal.value = true
}

// Open edit modal
const openEditModal = (user) => {
  isEditMode.value = true
  modalUser.value = {
    ...user,
    password: '',
    userRole: user.userRole || '',
    section: user.section || ''
  }
  modalMessage.value = ''
  showModal.value = true
}

// Add user
const addUser = async () => {
  try {
    const payload = { ...modalUser.value }
    const res = await axios.post('http://127.0.0.1:3000/api/auth/register', payload)
    modalMessage.value = res.data.message
    modalError.value = false
    fetchUsers()
    setTimeout(closeModal, 1000)
  } catch (err) {
    modalError.value = true
    modalMessage.value = err.response?.data?.message || 'Failed to add user'
  }
}

// Update user
const updateUser = async () => {
  try {
    const payload = { ...modalUser.value }
    if (!payload.password) delete payload.password
    const res = await axios.put(`http://127.0.0.1:3000/api/auth/users/${modalUser.value._id}`, payload)
    modalMessage.value = res.data.message
    modalError.value = false
    fetchUsers()
    setTimeout(closeModal, 1000)
  } catch (err) {
    modalError.value = true
    modalMessage.value = err.response?.data?.message || 'Failed to update user'
  }
}

// Close modal
const closeModal = () => {
  showModal.value = false
  modalUser.value = { _id: '', firstName: '', lastName: '', userName: '', referenceNo: '', password: '', userRole: '', section: '' }
  modalMessage.value = ''
  modalError.value = false
}

onMounted(() => {
  fetchUsers()
  fetchSections()
})
</script>

<style scoped>
.user-list {
  max-width: 700px;
  margin: 0 auto;
}
.actions {
  margin-bottom: 1rem;
}
.error {
  color: red;
}
.success {
  color: green;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th {
  background-color: #f4f4f4;
}
/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 450px;
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
