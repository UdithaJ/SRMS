<template>
  <v-container class="pa-4">
    <!-- Card Wrapper -->
    <v-card max-width="1000" outlined elevation="2">
      <!-- Toolbar Header -->
      <v-toolbar flat color="cyan lighten-4">
        <v-toolbar-title>Inquiries</v-toolbar-title>
        <v-spacer></v-spacer>
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
        class="elevation-1"
        fixed-header
        height="500"
      >
        <!-- Status chip -->
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" small dark>
            {{ statusOptions[item.status] || item.status }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <v-btn icon size="x-small" @click="openEditModal(item)">
            <v-icon size="small">mdi-pencil</v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <v-alert type="info">No inquiries found.</v-alert>
        </template>
      </v-data-table>
    </v-card>

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
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'

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

    const statusOptions = {
      1: 'Processing',
      2: 'Work Done',
      3: 'Can Not Done - Legal Issue',
      4: 'Can Not Done - Document Issue'
    }

    const statusItems = Object.entries(statusOptions).map(([value, title]) => ({
      title,
      value
    }));

    const tableHeaders = [
      { title: 'ID', value: 'inquiryId' },
      { title: 'Name', value: 'fullName' },
      { title: 'NIC', value: 'nic' },
      { title: 'Section', value: 'section' },
      { title: 'Assignee', value: 'assigneeName' },
      { title: 'Status', value: 'status' },
      { title: 'Actions', value: 'actions', sortable: false }
    ]

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
      switch(status) {
        case "1": return 'orange'
        case "2": return 'green'
        case "3": return 'red'
        case "4": return 'red darken-2'
        default: return 'grey'
      }
    }

    const tableItems = computed(() => {
      return inquiries.value.map(i => ({
        inquiryId: i.inquiryId || '-',
        fullName: `${i.firstName || ''} ${i.lastName || ''}`.trim(),
        nic: i.nic || '-',
        section: i.requirement?.section?.name || '-',
        requirement: i.requirement?.name || '-',
        assigneeName: getUserName(i.assignee),
        rating: i.rating || '-',
        acknowledgement: i.acknowledgement || '-',
        status: i.status || 1,
        _id: i._id,
        actions: i._id
      }))
    })

    const fetchSections = async () => {
      try { sections.value = (await axios.get('http://127.0.0.1:3000/api/sections')).data } 
      catch (err) { console.error(err) }
    }

    const fetchUsers = async () => {
      try { users.value = (await axios.get('http://127.0.0.1:3000/api/auth/users')).data } 
      catch (err) { console.error(err) }
    }

    const fetchInquiries = async () => {
      loading.value = true; error.value = ''
      try { inquiries.value = (await axios.get('http://127.0.0.1:3000/api/inquiries')).data } 
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
        status: inquiry.status || 1
      }
      modalMessage.value = ''
      showModal.value = true
    }

    const addInquiry = async () => {
      try {
        const payload = { ...modalInquiry.value }
        const res = await axios.post('http://127.0.0.1:3000/api/inquiries', payload)
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
        const res = await axios.put(`http://127.0.0.1:3000/api/inquiries/${modalInquiry.value._id}`, payload)
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

    onMounted(() => { fetchSections(); fetchUsers(); fetchInquiries() })

    return {
      tableHeaders, tableItems, page, statusOptions, getStatusColor,
      openAddModal, openEditModal, fetchInquiries, loading, error,
      sections, selectedSectionId, filteredRequirements, onSectionChange,
      modalInquiry, showModal, isEditMode, modalMessage, modalError,
      addInquiry, updateInquiry, closeModal, usersWithFullName, statusItems
    }
  }
}
</script>
