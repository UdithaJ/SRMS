<template>
  <v-container fluid class="pa-4 fill-height no-page-scroll">
    <v-card outlined elevation="2" class="card-flex full-width-card">
      <v-toolbar flat color="cyan lighten-4">
        <v-toolbar-title>Users</v-toolbar-title>
        <v-spacer />
        <v-btn color="primary" @click="openAddModal">Add User</v-btn>
        <v-btn color="secondary" @click="fetchUsers">Refresh</v-btn>
      </v-toolbar>

      <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
      <v-alert v-if="error" type="error">{{ error }}</v-alert>

      <v-data-table 
        :headers="tableHeaders" 
        :items="users" 
        :items-per-page="10"
        class="elevation-1 compact-table w-100"
        density="compact"
        fixed-header
        :height="computedTableHeight">
        <template #item="{ item }">
          <tr>
            <td>{{ item.firstName }}</td>
            <td>{{ item.lastName }}</td>
            <td>{{ item.userName }}</td>
            <td>{{ item.referenceNo }}</td>
            <td>{{ getRoleLabel(item.userRole) }}</td>
            <td>{{ item.userRole === 'section staff' ? getSectionName(item.section) : '-' }}</td>
            <td class="text-right">
              <v-btn icon class="action-btn" variant="text" @click="openEditModal(item)" :ripple="false" title="Edit">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>

        <template #no-data>
          <v-alert type="info">No users found.</v-alert>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="showModal" max-width="700px">
      <v-card>
        <v-card-title>{{ isEditMode ? 'Edit User' : 'Add User' }}</v-card-title>
        <v-card-text>
          <UserForm v-model="modalUser" :is-edit-mode="isEditMode" :sections="sections" :modal-message="modalMessage" :modal-error="modalError" @role-change="onRoleChange" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="isEditMode ? updateUser() : addUser()">{{ isEditMode ? 'Save' : 'Add' }}</v-btn>
          <v-btn color="secondary" @click="closeModal">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { http } from '@/api/http'
import UserForm from '../components/UserForm.vue'

const users = ref([])
const sections = ref([]) // store the sections list
const loading = ref(false)
const error = ref('')
const viewportHeight = ref(window.innerHeight)

const ROW_HEIGHT = 36
const HEADER_HEIGHT = 52
const VERTICAL_PADDING = 64

const updateViewport = () => { viewportHeight.value = window.innerHeight }
window.addEventListener('resize', updateViewport)

// table headers for Vuetify v-data-table
const tableHeaders = [
  { title: 'First Name', value: 'firstName' },
  { title: 'Last Name', value: 'lastName' },
  { title: 'User Name', value: 'userName' },
  { title: 'Reference No', value: 'referenceNo' },
  { title: 'User Role', value: 'userRole' },
  { title: 'Section', value: 'section' },
  { title: 'Actions', value: 'actions', sortable: false }
]

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
  section: '',
  profileImage: ''
})
const modalMessage = ref('')
const modalError = ref(false)

// role labels mapping for display
const roleLabels = {
  admin: 'Admin',
  reporter: 'Reporter',
  'section staff': 'Section Staff',
  ads: 'ADS',
  ds: 'DS'
}

const getRoleLabel = (role) => roleLabels[role] || role || '-'

// Fetch all users
const fetchUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await http.get('/api/auth/users')
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
    const res = await http.get('/api/sections')
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
  modalUser.value = { _id: '', firstName: '', lastName: '', userName: '', referenceNo: '', password: '', userRole: '', section: '', profileImage: '' }
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
    section: user.section || '',
    profileImage: user.profileImage || ''
  }
  modalMessage.value = ''
  showModal.value = true
}

// Add user
const addUser = async () => {
  try {
    const payload = { ...modalUser.value }
    const res = await http.post('/api/auth/register', payload)
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
    const res = await http.put(`/api/auth/users/${modalUser.value._id}`, payload)
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
  modalUser.value = { _id: '', firstName: '', lastName: '', userName: '', referenceNo: '', password: '', userRole: '', section: '', profileImage: '' }
  modalMessage.value = ''
  modalError.value = false
}

const computedTableHeight = computed(() => {
  const rows = users.value.length
  const desired = rows * ROW_HEIGHT + HEADER_HEIGHT
  const maxAvailable = viewportHeight.value - VERTICAL_PADDING
  return Math.min(Math.max(desired, 120), maxAvailable)
})

onMounted(() => {
  fetchUsers()
  fetchSections()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport)
})

</script>

<style scoped>
.error { color: red; }
.success { color: green; }
.compact-table .v-data-table__td, .compact-table .v-data-table__th { padding-top: 4px !important; padding-bottom: 4px !important; }
.compact-table .v-btn.v-btn--icon { --v-btn-size: 26px; }
.compact-table .action-btn { height:22px !important; width:22px !important; min-width:22px !important; padding:0 !important; }
.compact-table .action-btn .v-icon { font-size:16px !important; line-height:22px; }
.fill-height { height: 100vh; }
.no-page-scroll { overflow: hidden; }
.card-flex { display:flex; flex-direction:column; height:100%; }
.full-width-card { width:100%; }
</style>
