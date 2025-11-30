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
    <DataList
      :headers="tableHeaders"
      :items="tableItems"
      :pagination="pagination"
      no-data-icon="mdi-account-off-outline"
      no-data-text="No users found."
      @edit="openEditModal"
      @page-change="handlePageChange"
    >
      <template #[`item.userRoleLabel`]="{ value }">
        <span class="role-badge">{{ value }}</span>
      </template>
      <template #[`item.sectionName`]="{ item }">
        <span v-if="item.userRole === 'section staff'">{{ item.sectionName }}</span>
        <v-icon v-else color="#667eea" size="20" title="All Sections">mdi-all-inclusive</v-icon>
      </template>
    </DataList>

    <!-- Neumorphic Modal -->
    <v-dialog v-model="showModal" max-width="650px">
      <div class="neomorphic-modal elegant-modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditMode ? 'Edit User' : 'Add User' }}</h3>
        </div>
        <div class="modal-content">
          <UserForm ref="userFormRef" v-model="modalUser" :is-edit-mode="isEditMode" :sections="sections" :modal-message="modalMessage" :modal-error="modalError" @role-change="onRoleChange" />
        </div>

        <div class="modal-actions">
          <button class="neomorphic-btn mr-3" @click="closeModal" :disabled="modalLoading">Cancel</button>
          <button class="neomorphic-btn neomorphic-btn-primary" @click="handleUserSubmit" :disabled="modalLoading">
            <v-progress-circular v-if="modalLoading" indeterminate size="18" width="2" class="mr-2"></v-progress-circular>
            {{ isEditMode ? 'Save' : 'Add' }}
          </button>
        </div>
      </div>
    </v-dialog>
  </v-container>
</template>

<script setup>
const userFormRef = ref(null)

const handleUserSubmit = async () => {
  let valid = true
  if (userFormRef.value && userFormRef.value.formRef) {
    const result = await userFormRef.value.formRef.validate()
    // Vuetify v-form.validate() returns an object { valid: boolean } in v3, or boolean in v2
    valid = typeof result === 'object' ? result.valid : result
  }
  if (!valid) return
  if (isEditMode.value) {
    await updateUser()
  } else {
    await addUser()
  }
}
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { http, invalidateCache } from '@/api/http'
import { useToast } from '@/composables/useToast'
import { getRoleLabel } from '@/utils/constants'
import UserForm from '../components/UserForm.vue'
import DataList from '../components/DataList.vue'

const { showToast } = useToast()

const users = ref([])
const sections = ref([]) // store the sections list
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// table headers for Vuetify v-data-table
const tableHeaders = [
  { title: 'First Name', value: 'firstName' },
  { title: 'Last Name', value: 'lastName' },
  { title: 'User Name', value: 'userName' },
  { title: 'Reference No', value: 'referenceNo' },
  { title: 'User Role', value: 'userRoleLabel' },
  { title: 'Section', value: 'sectionName' },
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
const modalLoading = ref(false)

// Fetch all users (exclude profileImage for performance)
const fetchUsers = async (forceRefresh = false) => {
  loading.value = true
  error.value = ''
  try {
    // Clear cache if force refresh
    if (forceRefresh) {
      invalidateCache('/api/auth/users')
      currentPage.value = 1
    }
    
    const res = await http.get('/api/auth/users', {
      params: { 
        exclude: 'profileImage',
        page: currentPage.value,
        limit: 10
      },
      cacheTTL: 180000, // Cache for 3 minutes
      useCache: !forceRefresh // Bypass cache if force refresh
    })
    users.value = res.data.users || []
    pagination.value = res.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

// Handle page change
const handlePageChange = (page) => {
  currentPage.value = page
  fetchUsers()
}

// Fetch sections from API
const fetchSections = async () => {
  try {
    const res = await http.get('/api/sections', {
      params: { limit: 1000 }, // Fetch all sections for dropdown
      cacheTTL: 300000 // Cache for 5 minutes
    })
    sections.value = res.data.sections || res.data || []
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
    modalLoading.value = true
    const payload = { ...modalUser.value }
    const res = await http.post('/api/auth/register', payload)
    showToast(res.data.message || 'User added successfully', 'success')
    invalidateCache('/api/auth/users')
    fetchUsers()
    closeModal()
  } catch (err) {
    modalError.value = true
    modalMessage.value = err.response?.data?.message || 'Failed to add user'
  } finally {
    modalLoading.value = false
  }
}

// Update user
const updateUser = async () => {
  try {
    modalLoading.value = true
    const payload = { ...modalUser.value }
    if (!payload.password) delete payload.password
    const res = await http.put(`/api/auth/users/${modalUser.value._id}`, payload)
    showToast(res.data.message || 'User updated successfully', 'success')
    invalidateCache('/api/auth/users')
    fetchUsers()
    closeModal()
  } catch (err) {
    modalError.value = true
    modalMessage.value = err.response?.data?.message || 'Failed to update user'
  } finally {
    modalLoading.value = false
  }
}

// Close modal
const closeModal = () => {
  showModal.value = false
  modalUser.value = { _id: '', firstName: '', lastName: '', userName: '', referenceNo: '', password: '', userRole: '', section: '', profileImage: '' }
  modalMessage.value = ''
  modalError.value = false
}

// Computed items for DataList
const tableItems = computed(() => {
  return users.value.map(user => ({
    ...user,
    userRoleLabel: getRoleLabel(user.userRole),
    sectionName: user.userRole === 'section staff' ? getSectionName(user.section) : '-'
  }))
})

onMounted(() => {
  fetchUsers()
  fetchSections()
})

</script>

<style scoped lang="scss">
@import '@/assets/neomorphic.scss';

.elegant-modal {
  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    
    .modal-title {
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .modal-content {
    padding: 24px;
    max-height: calc(90vh - 160px);
    overflow-y: auto;
  }
  
  .modal-actions {
    padding: 16px 24px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    
    .neomorphic-btn {
      padding: 10px 24px;
      font-size: 14px;
    }
  }
}
</style>
