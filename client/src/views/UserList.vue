<template>
  <v-container fluid class="neomorphic-container">
    <!-- Header Card with Neumorphism -->
    <div class="neomorphic-card header-card mb-4">
      <div class="d-flex align-center justify-space-between pa-3">
        <h2 class="page-title">Users Management</h2>
        <div class="action-buttons">
          <button class="neomorphic-btn neomorphic-btn-icon mr-3" @click="openAddModal" title="Add User">
            <v-icon color="#667eea">mdi-plus</v-icon>
          </button>
          <button class="neomorphic-btn neomorphic-btn-icon" @click="fetchUsers(true)" title="Refresh">
            <v-icon color="#667eea">mdi-refresh</v-icon>
          </button>
        </div>
      </div>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="#667eea" class="mb-3"></v-progress-linear>
    <v-alert v-if="error" type="error" class="neomorphic-alert mb-3">{{ error }}</v-alert>

    <!-- Table Card with Neumorphism -->
    <div class="neomorphic-card table-card">
      <v-data-table 
        :headers="tableHeaders" 
        :items="users" 
        :items-per-page="10"
        class="neomorphic-table compact-table w-100"
        density="compact">
        <template #item="{ item }">
          <tr class="table-row">
            <td class="table-cell">{{ item.firstName }}</td>
            <td class="table-cell">{{ item.lastName }}</td>
            <td class="table-cell">{{ item.userName }}</td>
            <td class="table-cell">{{ item.referenceNo }}</td>
            <td class="table-cell">
              <span class="role-badge">{{ getRoleLabel(item.userRole) }}</span>
            </td>
            <td class="table-cell">{{ item.userRole === 'section staff' ? getSectionName(item.section) : '-' }}</td>
            <td class="table-cell text-right">
              <button class="neomorphic-btn-small" @click="openEditModal(item)" title="Edit">
                <v-icon size="18" color="#667eea">mdi-pencil</v-icon>
              </button>
            </td>
          </tr>
        </template>

        <template #no-data>
          <div class="pa-8 text-center text-grey">
            <v-icon size="48" color="grey-lighten-1">mdi-account-off-outline</v-icon>
            <p class="mt-2">No users found.</p>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Neumorphic Modal -->
    <v-dialog v-model="showModal" max-width="700px">
      <div class="neomorphic-modal">
        <div class="modal-header pa-6">
          <h3 class="modal-title">{{ isEditMode ? 'Edit User' : 'Add User' }}</h3>
        </div>
        <div class="modal-content pa-6">
          <UserForm v-model="modalUser" :is-edit-mode="isEditMode" :sections="sections" :modal-message="modalMessage" :modal-error="modalError" @role-change="onRoleChange" />
        </div>

        <div class="modal-actions pa-6 d-flex justify-end">
          <button class="neomorphic-btn mr-3" @click="closeModal">Cancel</button>
          <button class="neomorphic-btn neomorphic-btn-primary" @click="isEditMode ? updateUser() : addUser()">
            {{ isEditMode ? 'Save' : 'Add' }}
          </button>
        </div>
      </div>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { http, invalidateCache } from '@/api/http'
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

// Fetch all users (exclude profileImage for performance)
const fetchUsers = async (forceRefresh = false) => {
  loading.value = true
  error.value = ''
  try {
    // Clear cache if force refresh
    if (forceRefresh) {
      invalidateCache('/api/auth/users')
    }
    
    const res = await http.get('/api/auth/users', {
      params: { exclude: 'profileImage' },
      cacheTTL: 180000, // Cache for 3 minutes
      useCache: !forceRefresh // Bypass cache if force refresh
    })
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
    const res = await http.get('/api/sections', {
      cacheTTL: 300000 // Cache for 5 minutes
    })
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

// Open edit modal (fetch full user details with profileImage)
const openEditModal = async (user) => {
  isEditMode.value = true
  modalMessage.value = ''
  showModal.value = true
  
  try {
    // Fetch complete user details including profileImage
    const res = await http.get(`/api/auth/users/${user._id}`)
    modalUser.value = {
      ...res.data,
      password: '',
      userRole: res.data.userRole || '',
      section: res.data.section || '',
      profileImage: res.data.profileImage || ''
    }
  } catch (err) {
    console.error('Failed to fetch user details', err)
    // Fallback to basic user data if fetch fails
    modalUser.value = {
      ...user,
      password: '',
      userRole: user.userRole || '',
      section: user.section || '',
      profileImage: ''
    }
  }
}

// Add user
const addUser = async () => {
  try {
    const payload = { ...modalUser.value }
    const res = await http.post('/api/auth/register', payload)
    modalMessage.value = res.data.message
    modalError.value = false
    invalidateCache('/api/auth/users')
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
    invalidateCache('/api/auth/users')
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

<style scoped lang="scss">
@import '@/assets/neomorphic.scss';
</style>
