<template>
  <v-container fluid class="neomorphic-container">
    <!-- Header Card with Neumorphism -->
    <div class="neomorphic-card header-card mb-4">
      <div class="d-flex align-center justify-space-between pa-3">
        <h2 class="page-title">Inquiries Management</h2>
        <div class="action-buttons">
          <button class="neomorphic-btn neomorphic-btn-icon mr-3" @click="openFilterModal" title="Filter">
            <v-badge v-if="activeFilterCount > 0" :content="activeFilterCount" color="red" offset-x="-2" offset-y="-2">
              <v-icon color="#667eea">mdi-filter</v-icon>
            </v-badge>
            <v-icon v-else color="#667eea">mdi-filter</v-icon>
          </button>
          <button class="neomorphic-btn neomorphic-btn-icon mr-3" @click="openAddModal" title="Add Inquiry">
            <v-icon color="#667eea">mdi-plus</v-icon>
          </button>
          <button class="neomorphic-btn neomorphic-btn-icon" @click="fetchInquiries(true)" title="Refresh">
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
      no-data-icon="mdi-file-document-outline"
      no-data-text="No inquiries found."
      @edit="openEditModal"
      @page-change="handlePageChange"
    >
      <template #[`item.status`]="{ item }">
        <v-chip :color="getStatusColor(item.status)" size="small" class="status-chip" :title="statusOptions[item.status] || item.status">
          {{ statusOptions[item.status] || item.status }}
        </v-chip>
      </template>
    </DataList>

    <!-- Filter Modal -->
    <v-dialog v-model="showFilterModal" max-width="550px">
      <div class="neomorphic-modal elegant-modal">
        <div class="modal-header">
          <h3 class="modal-title">Filter Inquiries</h3>
        </div>
        <div class="modal-content">
          <v-form>
            <v-row>
              <v-col cols="12">
                <v-select
                  :items="statusItems"
                  label="Status"
                  v-model="filters.status"
                  item-title="title"
                  item-value="value"
                  clearable
                  multiple
                  chips
                  density="comfortable"
                  hide-details="auto"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  :items="sections"
                  item-title="name"
                  item-value="_id"
                  label="Section"
                  v-model="filters.section"
                  clearable
                  multiple
                  chips
                  density="comfortable"
                  hide-details="auto"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  :items="usersWithFullName"
                  item-title="fullName"
                  item-value="_id"
                  label="Assignee"
                  v-model="filters.assignee"
                  clearable
                  multiple
                  chips
                  density="comfortable"
                  hide-details="auto"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  :items="acknowledgementItems"
                  label="Acknowledgement"
                  v-model="filters.acknowledgement"
                  clearable
                  multiple
                  chips
                  density="comfortable"
                  hide-details="auto"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </div>
        <div class="modal-actions">
          <button class="neomorphic-btn" @click="clearFilters">Clear All</button>
          <div>
            <button class="neomorphic-btn mr-3" @click="showFilterModal = false">Cancel</button>
            <button class="neomorphic-btn neomorphic-btn-primary" @click="applyFilters">Apply</button>
          </div>
        </div>
      </div>
    </v-dialog>

    <!-- Add/Edit Modal -->
    <v-dialog v-model="showModal" max-width="750px">
      <div class="neomorphic-modal elegant-modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditMode ? 'Edit Inquiry' : 'Add Inquiry' }}</h3>
        </div>
        <div class="modal-content">
          <v-form @submit.prevent="isEditMode ? updateInquiry() : addInquiry()">
            <v-row>
              <v-col cols="12" v-if="isEditMode && assigneeInfo">
                <div class="assignee-profile">
                  <div class="assignee-profile-header">Pending With</div>
                  <div class="assignee-profile-content">
                    <div class="assignee-avatar-wrapper">
                      <img v-if="assigneeInfo.image" :src="assigneeInfo.image" alt="Assignee" class="assignee-avatar" />
                      <div v-else class="assignee-avatar-placeholder">
                        <v-icon size="48" color="white">mdi-account</v-icon>
                      </div>
                    </div>
                    <div class="assignee-details">
                      <div class="assignee-name-text">{{ assigneeInfo.name }}</div>
                      <div class="assignee-ref-text">Ref: {{ assigneeInfo.ref || 'N/A' }}</div>
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="First Name" v-model="modalInquiry.firstName" density="comfortable" hide-details="auto" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Last Name" v-model="modalInquiry.lastName" density="comfortable" hide-details="auto" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="NIC" v-model="modalInquiry.nic" density="comfortable" hide-details="auto" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="sections"
                  item-title="name"
                  item-value="_id"
                  label="Section"
                  v-model="selectedSectionId"
                  @update:modelValue="onSectionChange"
                  density="comfortable"
                  hide-details="auto"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="filteredRequirements"
                  item-title="name"
                  item-value="_id"
                  label="Requirement"
                  v-model="modalInquiry.requirement"
                  density="comfortable"
                  hide-details="auto"
                  :key="selectedSectionId"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="mb-1 text-caption text-grey">Rating</div>
                <v-rating
                  v-model="modalInquiry.rating"
                  length="4"
                  color="#667eea"
                  active-color="#667eea"
                  hover
                  density="comfortable"
                  size="large"
                ></v-rating>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="usersWithFullName"
                  item-title="fullName"
                  item-value="_id"
                  label="Assignee"
                  v-model="modalInquiry.assignee"
                  density="comfortable"
                  hide-details="auto"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="[
                    'Checked and Completed',
                    'Checked and Instruction Given',
                    'Checked and Need to Follow Up'
                    ]"
                  label="Acknowledgement"
                  v-model="modalInquiry.acknowledgement"
                  :disabled="!canAcknowledge"
                  density="comfortable"
                  hide-details="auto"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea label="Notes" v-model="modalInquiry.notes" density="comfortable" hide-details="auto"></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="statusItems"
                  label="Status"
                  v-model="modalInquiry.status"
                  item-title="title"
                  item-value="value"
                  density="comfortable"
                  hide-details="auto"
                  required
                ></v-select>
              </v-col>
            </v-row>
            <v-alert v-if="modalMessage" :type="modalError ? 'error' : 'success'" class="neomorphic-alert mt-3" density="compact">
              {{ modalMessage }}
            </v-alert>
          </v-form>
        </div>

        <div class="modal-actions">
          <button class="neomorphic-btn mr-3" @click="closeModal" :disabled="modalLoading">Cancel</button>
          <button class="neomorphic-btn neomorphic-btn-primary" @click="isEditMode ? updateInquiry() : addInquiry()" :disabled="modalLoading">
            <v-progress-circular v-if="modalLoading" indeterminate size="18" width="2" class="mr-2"></v-progress-circular>
            {{ isEditMode ? 'Save' : 'Add' }}
          </button>
        </div>
      </div>
    </v-dialog>
  </v-container>
</template>

<script>
import { http, invalidateCache } from '@/api/http'
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import DataList from '@/components/DataList.vue'

export default {
  name: 'InquiryList',
  components: {
    DataList
  },
  setup() {
    const { showToast } = useToast()
    const inquiries = ref([])
    const sections = ref([])
    const users = ref([])
    const profileImageCache = ref({})
    const assigneeInfo = ref(null)
    const selectedSectionId = ref('')
    const loading = ref(false)
    const error = ref('')

    const showModal = ref(false)
    const isEditMode = ref(false)
    const modalInquiry = ref({
      _id: '', firstName: '', lastName: '', requirement: '', nic: '',
      rating: null, assignee: '', acknowledgement: '', notes: '', status: 1
    })
    const modalMessage = ref('')
    const modalError = ref(false)
    const modalLoading = ref(false)
    const currentPage = ref(1)
    const pagination = ref({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    })

    // Filter state
    const showFilterModal = ref(false)
    const filters = ref({
      status: [],
      section: [],
      assignee: [],
      acknowledgement: []
    })

    const statusOptions = {
      1: 'Processing',
      2: 'Work Done',
      3: 'Can Not Done - Legal Issue',
      4: 'Can Not Done - Document Issue'
    }

    const statusItems = Object.entries(statusOptions).map(([value, title]) => ({
      title,
      value: Number(value)
    }));

    const acknowledgementItems = [
      'Checked and Completed',
      'Checked and Instruction Given',
      'Checked and Need to Follow Up'
    ];

    // current user store to check role for acknowledgement permission
    const userStore = useUserStore();
    const canAcknowledge = computed(() => {
      const role = userStore.userRole || '';
      return role === 'ads' || role === 'ds';
    });

    const tableHeaders = [
      { title: 'ID', value: 'inquiryId' },
      { title: 'Name', value: 'fullName' },
      { title: 'NIC', value: 'nic' },
      { title: 'Section', value: 'section' },
      { title: 'Assignee', value: 'assigneeName' },
      { title: 'Status', value: 'status' },
      { title: 'Actions', value: 'actions', sortable: false }
    ]

    // dynamic slot names for lint-safe usage
    const itemStatus = 'item.status'
    const itemActions = 'item.actions'

    const filteredRequirements = computed(() => {
      const section = sections.value.find(s => s._id === selectedSectionId.value)
      return section?.requirements || []
    })

    const usersWithFullName = computed(() => {
      return users.value.map(u => ({ ...u, fullName: u.firstName + ' ' + u.lastName }))
    })

    const getUserName = (id) => {
      const u = users.value.find(u => u._id === id)
      return u ? `${u.firstName} ${u.lastName}` : '-'
    }

    const getUserDetails = (assigneeObj) => {
      // assigneeObj is now the populated user object from backend
      if (!assigneeObj || !assigneeObj._id) return { name: '-', ref: '', image: '' }
      
      const id = assigneeObj._id
      const name = `${assigneeObj.firstName || ''} ${assigneeObj.lastName || ''}`.trim()
      const ref = assigneeObj.referenceNo || ''
      
      // Check cache first for profile image
      if (profileImageCache.value[id]) {
        return { name, ref, image: profileImageCache.value[id] }
      }
      
      // Handle profile image if present (only from detailed fetch)
      let imageUrl = ''
      if (assigneeObj.profileImage) {
        imageUrl = assigneeObj.profileImage.startsWith('data:') 
          ? assigneeObj.profileImage 
          : `data:image/jpeg;base64,${assigneeObj.profileImage}`
        // Cache it
        profileImageCache.value[id] = imageUrl
      }
      
      return { name, ref, image: imageUrl }
    }

    const getAssigneeInfo = async (inquiryId, assigneeId) => {
      if (!assigneeId) {
        assigneeInfo.value = null
        return
      }
      
      try {
        // Fetch full inquiry details including assignee with profile image
        const response = await http.get(`/api/inquiries/${inquiryId}`)
        const assigneeObj = response.data.assignee
        assigneeInfo.value = getUserDetails(assigneeObj)
      } catch (err) {
        console.error('Failed to fetch assignee info', err)
        assigneeInfo.value = { name: '-', ref: '', image: '' }
      }
    }

    const getStatusColor = (status) => {
      const n = Number(status)
      switch(n) {
        case 1: return '#FFA726' // Processing - Orange
        case 2: return '#66BB6A' // Work Done - Green
        case 3: return '#EF5350' // Legal Issue - Red
        case 4: return '#D32F2F' // Document Issue - Darker Red
        default: return '#9E9E9E' // Unknown - Grey
      }
    }

    const tableItems = computed(() => {
      // Filters are now applied on backend, inquiries come with populated data
      return inquiries.value.map(i => {
        // Assignee is now populated by backend
        const assigneeDetails = getUserDetails(i.assignee)
        return {
          inquiryId: i.inquiryId || '-',
          fullName: `${i.firstName || ''} ${i.lastName || ''}`.trim(),
          nic: i.nic || '-',
          section: i.requirement?.section?.name || '-',
          requirement: i.requirement?.name || '-',
          assigneeName: assigneeDetails.name,
          rating: i.rating || '-',
          acknowledgement: i.acknowledgement || '-',
          status: Number(i.status) || 1,
          _id: i._id,
          actions: i._id
        }
      })
    })

    const activeFilterCount = computed(() => {
      let count = 0
      if (filters.value.status && filters.value.status.length > 0) count++
      if (filters.value.section && filters.value.section.length > 0) count++
      if (filters.value.assignee && filters.value.assignee.length > 0) count++
      if (filters.value.acknowledgement && filters.value.acknowledgement.length > 0) count++
      return count
    })

    const fetchSections = async () => {
      try { 
        const res = await http.get('/api/sections', {
          params: { limit: 1000 }, // Fetch all sections for dropdown
          cacheTTL: 300000 // Cache for 5 minutes
        })
        sections.value = res.data.sections || res.data || []
      } 
      catch (err) { console.error(err) }
    }

    const fetchUsers = async () => {
      try { 
        // Fetch users without profileImage for dropdown selection
        const res = await http.get('/api/auth/users', {
          params: { 
            exclude: 'profileImage',
            limit: 1000 // Fetch all users for dropdown
          },
          cacheTTL: 300000 // Cache for 5 minutes
        })
        users.value = res.data.users || res.data || []
      } 
      catch (err) { console.error(err) }
    }

    const fetchInquiries = async (forceRefresh = false) => {
      loading.value = true; error.value = ''
      try { 
        // Clear cache if force refresh
        if (forceRefresh) {
          invalidateCache('/api/inquiries')
          currentPage.value = 1
        }
        
        // Build query parameters for filters and pagination
        const params = {
          page: currentPage.value,
          limit: 10
        };
        
        if (filters.value.status && filters.value.status.length > 0) {
          params.status = filters.value.status.join(',');
        }
        
        if (filters.value.section && filters.value.section.length > 0) {
          params.section = filters.value.section.join(',');
        }
        
        if (filters.value.assignee && filters.value.assignee.length > 0) {
          params.assignee = filters.value.assignee.join(',');
        }
        
        if (filters.value.acknowledgement && filters.value.acknowledgement.length > 0) {
          params.acknowledgement = filters.value.acknowledgement.join(',');
        }
        
        const response = await http.get('/api/inquiries', { 
          params,
          cacheTTL: 120000, // Cache for 2 minutes
          useCache: !forceRefresh // Bypass cache if force refresh
        });
        
        // Response now includes populated assignee and section data
        inquiries.value = response.data.inquiries || [];
        pagination.value = response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
      } 
      catch (err) { error.value = err.response?.data?.message || 'Failed to load inquiries' } 
      finally { loading.value = false }
    }

    const handlePageChange = (page) => {
      currentPage.value = page
      fetchInquiries()
    }

    const onSectionChange = () => {
      // Reset requirement to first available requirement for the selected section
      const firstReq = filteredRequirements.value[0]
      modalInquiry.value.requirement = firstReq?._id || ''
    }

    const openAddModal = async () => {
      // Lazy load sections and users if not already loaded
      if (sections.value.length === 0) await fetchSections()
      if (users.value.length === 0) await fetchUsers()
      
      isEditMode.value = false
      selectedSectionId.value = sections.value[0]?._id || ''
      modalInquiry.value = {
        _id: '', firstName: '', lastName: '', requirement: filteredRequirements.value[0]?._id || '',
        nic: '', rating: null, assignee: users.value[0]?._id || '', acknowledgement: '', notes: '', status: 1
      }
      modalMessage.value = ''
      showModal.value = true
    }

    const openEditModal = async (item) => {
      // Lazy load sections and users if not already loaded
      if (sections.value.length === 0) await fetchSections()
      if (users.value.length === 0) await fetchUsers()
      
      isEditMode.value = true
      const inquiry = inquiries.value.find(i => i._id === item._id)
      const requirementObj = inquiry.requirement || {}
      const sectionId = requirementObj.section?._id || sections.value[0]?._id
      selectedSectionId.value = sectionId
      const section = sections.value.find(s => s._id === sectionId)
      const requirements = section?.requirements || []
      const assigneeId = typeof inquiry.assignee === 'string' ? inquiry.assignee : inquiry.assignee?._id || users.value[0]?._id
      modalInquiry.value = {
        _id: inquiry._id,
        firstName: inquiry.firstName,
        lastName: inquiry.lastName,
        nic: inquiry.nic,
        requirement: requirementObj._id || requirements[0]?._id || '',
        rating: inquiry.rating || null,
        assignee: assigneeId,
        acknowledgement: inquiry.acknowledgement || '',
        notes: inquiry.notes || '',
        status: Number(inquiry.status) || 1
      }
      // Load assignee info with profile image
      getAssigneeInfo(inquiry._id, assigneeId)
      modalMessage.value = ''
      showModal.value = true
    }

    const addInquiry = async () => {
      try {
        modalLoading.value = true
        const payload = { ...modalInquiry.value }
        const res = await http.post('/api/inquiries', payload)
        showToast(res.data.message || 'Inquiry added successfully', 'success')
        // Invalidate inquiry cache to force refresh
        invalidateCache('/api/inquiries')
        fetchInquiries()
        closeModal()
      } catch (err) {
        modalMessage.value = err.response?.data?.message || 'Failed to add inquiry'
        modalError.value = true
      } finally {
        modalLoading.value = false
      }
    }

    const updateInquiry = async () => {
      try {
        modalLoading.value = true
        const payload = { ...modalInquiry.value }
        const res = await http.put(`/api/inquiries/${modalInquiry.value._id}`, payload)
        showToast(res.data.message || 'Inquiry updated successfully', 'success')
        // Invalidate inquiry cache to force refresh
        invalidateCache('/api/inquiries')
        fetchInquiries()
        closeModal()
      } catch (err) {
        modalMessage.value = err.response?.data?.message || 'Failed to update inquiry'
        modalError.value = true
      } finally {
        modalLoading.value = false
      }
    }

    const closeModal = () => {
      showModal.value = false
      modalMessage.value = ''
    }

    const applyFilters = () => {
      showFilterModal.value = false
      currentPage.value = 1 // Reset to first page when applying filters
      // Invalidate cache when applying filters to force fresh data
      invalidateCache('/api/inquiries')
      fetchInquiries() // Refetch with new filters
    }

    const clearFilters = () => {
      filters.value = {
        status: [],
        section: [],
        assignee: [],
        acknowledgement: []
      }
      currentPage.value = 1 // Reset to first page when clearing filters
      // Invalidate cache when clearing filters to force fresh data
      invalidateCache('/api/inquiries')
      fetchInquiries() // Refetch without filters
    }

    const openFilterModal = async () => {
      // Lazy load sections and users if not already loaded
      if (sections.value.length === 0) await fetchSections()
      if (users.value.length === 0) await fetchUsers()
      showFilterModal.value = true
    }

    onMounted(() => { 
      // Only fetch inquiries on initial load
      // Sections and users will be lazy loaded when modals are opened
      fetchInquiries() 
    })

    return {
      tableHeaders, tableItems, statusOptions, getStatusColor,
      openAddModal, openEditModal, fetchInquiries, loading, error,
      sections, selectedSectionId, filteredRequirements, onSectionChange,
      modalInquiry, showModal, isEditMode, modalMessage, modalError,
      addInquiry, updateInquiry, closeModal, usersWithFullName, statusItems,
      acknowledgementItems,
      canAcknowledge,
      itemStatus,
      itemActions,
      showFilterModal,
      openFilterModal,
      filters,
      applyFilters,
      clearFilters,
      activeFilterCount,
      assigneeInfo,
      modalLoading,
      pagination,
      handlePageChange
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/neomorphic.scss';

.assignee-profile {
  background: $neomorphic-bg;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 
    inset 3px 3px 6px $neomorphic-shadow-dark,
    inset -3px -3px 6px $neomorphic-shadow-light;
  
  .assignee-profile-header {
    color: $neomorphic-text;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .assignee-profile-content {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .assignee-avatar-wrapper {
      flex-shrink: 0;
      
      .assignee-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 
          4px 4px 8px $neomorphic-shadow-dark,
          -4px -4px 8px $neomorphic-shadow-light;
        border: 3px solid $neomorphic-bg;
      }
      
      .assignee-avatar-placeholder {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 
          4px 4px 8px $neomorphic-shadow-dark,
          -4px -4px 8px $neomorphic-shadow-light;
      }
    }
    
    .assignee-details {
      flex: 1;
      
      .assignee-name-text {
        color: $neomorphic-text;
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 4px;
      }
      
      .assignee-ref-text {
        color: $neomorphic-text-light;
        font-size: 13px;
      }
    }
  }

  .status-chip {
    font-weight: 500;
    font-size: 12px;
    
    :deep(.v-chip__content) {
      color: white;
    }
  }
}

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
