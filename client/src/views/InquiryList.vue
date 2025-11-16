<template>
  <v-container fluid class="pa-4 fill-height no-page-scroll">
    <!-- Card Wrapper -->
    <v-card outlined elevation="2" class="card-flex full-width-card">
      <!-- Toolbar Header -->
      <v-toolbar flat color="cyan lighten-4">
        <v-toolbar-title>Inquiries</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="accent" @click="showFilterModal = true" class="mr-2">
          <v-icon left>mdi-filter</v-icon>
          Filter
          <v-badge v-if="activeFilterCount > 0" :content="activeFilterCount" color="red" inline class="ml-2" />
        </v-btn>
        <v-btn color="primary" @click="openAddModal">Add</v-btn>
        <v-btn color="secondary" @click="fetchInquiries">Refresh</v-btn>
      </v-toolbar>

      <!-- Loading & Errors -->
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
      ></v-progress-linear>
      <v-alert v-if="error" type="error">{{ error }}</v-alert>

      <!-- DATA TABLE -->
      <v-data-table
        :headers="tableHeaders"
        :items="tableItems"
        :items-per-page="10"
        :page.sync="page"
        class="elevation-1 compact-table w-100"
        density="compact"
        fixed-header
        :height="computedTableHeight"
      >
        <!-- Status chip -->
        <template v-slot:[itemStatus]="{ item }">
          <v-chip :color="getStatusColor(item.status)" small dark>
            {{ statusOptions[item.status] || item.status }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template v-slot:[itemActions]="{ item }">
          <v-btn icon class="action-btn" variant="text" @click="openEditModal(item)" :ripple="false" title="Edit">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <v-alert type="info">No inquiries found.</v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Filter Modal -->
    <v-dialog v-model="showFilterModal" max-width="600px">
      <v-card>
        <v-card-title>Filter Inquiries</v-card-title>
        <v-card-text>
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
                  hint="Select one or more statuses"
                  persistent-hint
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
                  hint="Select one or more sections"
                  persistent-hint
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
                  hint="Select one or more assignees"
                  persistent-hint
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="warning" variant="text" @click="clearFilters">Clear All</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="showFilterModal = false">Cancel</v-btn>
          <v-btn color="primary" @click="applyFilters">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Modal -->
    <v-dialog v-model="showModal" max-width="800px">
      <v-card>
        <v-card-title>{{ isEditMode ? 'Edit Inquiry' : 'Add Inquiry' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="isEditMode ? updateInquiry() : addInquiry()">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field label="First Name" v-model="modalInquiry.firstName" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="Last Name" v-model="modalInquiry.lastName" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field label="NIC" v-model="modalInquiry.nic" required></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="sections"
                  item-title="name"
                  item-value="_id"
                  label="Section"
                  v-model="selectedSectionId"
                  @change="onSectionChange"
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
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="Rating"
                  type="number"
                  v-model="modalInquiry.rating"
                  min="1"
                  max="5"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="usersWithFullName"
                  item-title="fullName"
                  item-value="_id"
                  label="Assignee"
                  v-model="modalInquiry.assignee"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="['Pending','Approved','Rejected']"
                  label="Acknowledgement"
                  v-model="modalInquiry.acknowledgement"
                  :disabled="!canAcknowledge"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea label="Notes" v-model="modalInquiry.notes"></v-textarea>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="statusItems"
                  label="Status"
                  v-model="modalInquiry.status"
                  item-title="title"
                  item-value="value"
                  required
                ></v-select>
              </v-col>
            </v-row>
            <v-alert v-if="modalMessage" :type="modalError ? 'error' : 'success'" class="mt-2">
              {{ modalMessage }}
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="isEditMode ? updateInquiry() : addInquiry()">
            {{ isEditMode ? 'Save' : 'Add' }}
          </v-btn>
          <v-btn color="secondary" @click="closeModal">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { http } from '@/api/http'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useUserStore } from '@/stores/user'

export default {
  name: 'InquiryList',
  setup() {
    const inquiries = ref([])
    const sections = ref([])
    const users = ref([])
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
    const page = ref(1)
    const viewportHeight = ref(window.innerHeight)

    // Filter state
    const showFilterModal = ref(false)
    const filters = ref({
      status: [],
      section: [],
      assignee: []
    })

    const ROW_HEIGHT = 36 // approximate compact row height
    const HEADER_HEIGHT = 52
    const VERTICAL_PADDING = 64 // toolbar + container padding + alerts etc

    const updateViewport = () => { viewportHeight.value = window.innerHeight }
    window.addEventListener('resize', updateViewport)

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

    const getStatusColor = (status) => {
      const n = Number(status)
      switch(n) {
        case 1: return 'orange'
        case 2: return 'green'
        case 3: return 'red'
        case 4: return 'red darken-2'
        default: return 'grey'
      }
    }

    const tableItems = computed(() => {
      // Filters are now applied on backend, so just map the data
      return inquiries.value.map(i => ({
        inquiryId: i.inquiryId || '-',
        fullName: `${i.firstName || ''} ${i.lastName || ''}`.trim(),
        nic: i.nic || '-',
        section: i.requirement?.section?.name || '-',
        requirement: i.requirement?.name || '-',
        assigneeName: getUserName(i.assignee),
        rating: i.rating || '-',
        acknowledgement: i.acknowledgement || '-',
        status: Number(i.status) || 1,
        _id: i._id,
        actions: i._id
      }))
    })

    const activeFilterCount = computed(() => {
      let count = 0
      if (filters.value.status && filters.value.status.length > 0) count++
      if (filters.value.section && filters.value.section.length > 0) count++
      if (filters.value.assignee && filters.value.assignee.length > 0) count++
      return count
    })

    const computedTableHeight = computed(() => {
      const rows = tableItems.value.length
      const desired = rows * ROW_HEIGHT + HEADER_HEIGHT
      const maxAvailable = viewportHeight.value - VERTICAL_PADDING
      return Math.min(Math.max(desired, 120), maxAvailable)
    })

    const fetchSections = async () => {
      try { sections.value = (await http.get('/api/sections')).data } 
      catch (err) { console.error(err) }
    }

    const fetchUsers = async () => {
      try { users.value = (await http.get('/api/auth/users')).data } 
      catch (err) { console.error(err) }
    }

    const fetchInquiries = async () => {
      loading.value = true; error.value = ''
      try { 
        // Build query parameters for filters
        const params = {};
        
        if (filters.value.status && filters.value.status.length > 0) {
          params.status = filters.value.status.join(',');
        }
        
        if (filters.value.section && filters.value.section.length > 0) {
          params.section = filters.value.section.join(',');
        }
        
        if (filters.value.assignee && filters.value.assignee.length > 0) {
          params.assignee = filters.value.assignee.join(',');
        }
        
        const response = await http.get('/api/inquiries', { params });
        
        // Handle both old format (array) and new format (object with inquiries array)
        inquiries.value = Array.isArray(response.data) ? response.data : response.data.inquiries;
      } 
      catch (err) { error.value = err.response?.data?.message || 'Failed to load inquiries' } 
      finally { loading.value = false }
    }

    const onSectionChange = () => {
      modalInquiry.value.requirement = filteredRequirements.value[0]?._id || ''
    }

    const openAddModal = () => {
      isEditMode.value = false
      selectedSectionId.value = sections.value[0]?._id || ''
      modalInquiry.value = {
        _id: '', firstName: '', lastName: '', requirement: filteredRequirements.value[0]?._id || '',
        nic: '', rating: null, assignee: users.value[0]?._id || '', acknowledgement: '', notes: '', status: 1
      }
      modalMessage.value = ''
      showModal.value = true
    }

    const openEditModal = (item) => {
      isEditMode.value = true
      const inquiry = inquiries.value.find(i => i._id === item._id)
      const requirementObj = inquiry.requirement || {}
      const sectionId = requirementObj.section?._id || sections.value[0]?._id
      selectedSectionId.value = sectionId
      const section = sections.value.find(s => s._id === sectionId)
      const requirements = section?.requirements || []
      modalInquiry.value = {
        _id: inquiry._id,
        firstName: inquiry.firstName,
        lastName: inquiry.lastName,
        nic: inquiry.nic,
        requirement: requirementObj._id || requirements[0]?._id || '',
        rating: inquiry.rating || null,
        assignee: inquiry.assignee || users.value[0]?._id,
        acknowledgement: inquiry.acknowledgement || '',
        notes: inquiry.notes || '',
        status: Number(inquiry.status) || 1
      }
      modalMessage.value = ''
      showModal.value = true
    }

    const addInquiry = async () => {
      try {
        const payload = { ...modalInquiry.value }
        const res = await http.post('/api/inquiries', payload)
        modalMessage.value = res.data.message; modalError.value = false
        fetchInquiries(); setTimeout(() => showModal.value = false, 1000)
      } catch (err) {
        modalMessage.value = err.response?.data?.message || 'Failed to add inquiry'
        modalError.value = true
      }
    }

    const updateInquiry = async () => {
      try {
        const payload = { ...modalInquiry.value }
        const res = await http.put(`/api/inquiries/${modalInquiry.value._id}`, payload)
        modalMessage.value = res.data.message; modalError.value = false
        fetchInquiries(); setTimeout(() => showModal.value = false, 1000)
      } catch (err) {
        modalMessage.value = err.response?.data?.message || 'Failed to update inquiry'
        modalError.value = true
      }
    }

    const closeModal = () => {
      showModal.value = false
      modalMessage.value = ''
    }

    const applyFilters = () => {
      showFilterModal.value = false
      fetchInquiries() // Refetch with new filters
    }

    const clearFilters = () => {
      filters.value = {
        status: [],
        section: [],
        assignee: []
      }
      fetchInquiries() // Refetch without filters
    }

    onMounted(() => { fetchSections(); fetchUsers(); fetchInquiries() })
    onBeforeUnmount(() => { window.removeEventListener('resize', updateViewport) })

    return {
      tableHeaders, tableItems, page, statusOptions, getStatusColor,
      openAddModal, openEditModal, fetchInquiries, loading, error,
      sections, selectedSectionId, filteredRequirements, onSectionChange,
      modalInquiry, showModal, isEditMode, modalMessage, modalError,
      addInquiry, updateInquiry, closeModal, usersWithFullName, statusItems,
      canAcknowledge,
      itemStatus,
      itemActions,
      computedTableHeight,
      showFilterModal,
      filters,
      applyFilters,
      clearFilters,
      activeFilterCount
    }
  }
}
</script>

<style scoped>
.compact-table .v-data-table__td, .compact-table .v-data-table__th { padding-top: 4px !important; padding-bottom: 4px !important; }
.compact-table .v-chip { height: 22px; }
.compact-table .v-btn.v-btn--icon { --v-btn-size: 26px; }
.compact-table .action-btn { height:22px !important; width:22px !important; min-width:22px !important; padding:0 !important; }
.compact-table .action-btn .v-icon { font-size:16px !important; line-height:22px; }
/* Layout helpers to prevent page scroll and allow dynamic table sizing */
.fill-height { height: 100vh; }
.no-page-scroll { overflow: hidden; }
.card-flex { display:flex; flex-direction:column; height:100%; }
.full-width-card { width:100%; }
</style>
