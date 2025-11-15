<template>
  <div class="inquiry-list">
    <h2>Inquiries</h2>
    <div class="actions">
      <button @click="openAddModal">Add Inquiry</button>
      <button @click="fetchInquiries">Refresh List</button>
    </div>

    <p v-if="loading">Loading inquiries...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <table v-if="inquiries.length" border="1" cellpadding="8">
      <thead>
        <tr>
          <th>Inquiry ID</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Section</th>
          <th>Requirement</th>
          <th>NIC</th>
          <th>Rating</th>
          <th>Assignee</th>
          <th>Acknowledgement</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="inquiry in inquiries" :key="inquiry._id">
          <td>{{ inquiry.inquiryId }}</td>
          <td>{{ inquiry.firstName }}</td>
          <td>{{ inquiry.lastName }}</td>
          <td>{{ inquiry.requirement?.section?.name || '' }}</td>
          <td>{{ inquiry.requirement?.name || '' }}</td>
          <td>{{ inquiry.nic }}</td>
          <td>{{ inquiry.rating || '' }}</td>
          <td>{{ getUserName(inquiry.assignee) || '-' }}</td>
          <td>{{ inquiry.acknowledgement || '-' }}</td>
          <td>{{ statusOptions[inquiry.status] || inquiry.status }}</td>
          <td>
            <button @click="openEditModal(inquiry)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No inquiries found.</p>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ isEditMode ? 'Edit Inquiry' : 'Add Inquiry' }}</h3>
        <form @submit.prevent="isEditMode ? updateInquiry() : addInquiry()">
          <div>
            <label>First Name:</label>
            <input type="text" v-model="modalInquiry.firstName" required />
          </div>
          <div>
            <label>Last Name:</label>
            <input type="text" v-model="modalInquiry.lastName" required />
          </div>
          <div>
            <label>NIC:</label>
            <input type="text" v-model="modalInquiry.nic" required />
          </div>
          <div>
            <label>Section:</label>
            <select v-model="selectedSectionId" @change="onSectionChange" required>
              <option v-for="section in sections" :key="section._id" :value="section._id">
                {{ section.name }}
              </option>
            </select>
          </div>
          <div>
            <label>Requirement:</label>
            <select v-model="modalInquiry.requirement" required>
              <option v-for="req in filteredRequirements" :key="req._id" :value="req._id">
                {{ req.name }}
              </option>
            </select>
          </div>
          <div>
            <label>Rating:</label>
            <input type="number" v-model="modalInquiry.rating" min="1" max="5" />
          </div>
          <div>
            <label>Assignee:</label>
            <select v-model="modalInquiry.assignee" required>
              <option v-for="user in users" :key="user._id" :value="user._id">
                {{ user.firstName }} {{ user.lastName }}
              </option>
            </select>
          </div>
          <div>
            <label>Acknowledgement:</label>
            <select v-model="modalInquiry.acknowledgement">
              <option value="" disabled>Select acknowledgement</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label>Notes:</label>
            <textarea v-model="modalInquiry.notes"></textarea>
          </div>
          <div>
            <label>Status:</label>
            <select v-model="modalInquiry.status" required>
              <option v-for="(label, code) in statusOptions" :key="code" :value="code">{{ label }}</option>
            </select>
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

<script>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';

export default {
  name: 'InquiryList',
  setup() {
    const inquiries = ref([]);
    const sections = ref([]);
    const users = ref([]);
    const selectedSectionId = ref('');
    const loading = ref(false);
    const error = ref('');

    const showModal = ref(false);
    const isEditMode = ref(false);
    const modalInquiry = ref({
      _id: '',
      firstName: '',
      lastName: '',
      requirement: '',
      nic: '',
      rating: null,
      assignee: '', 
      acknowledgement: '',
      notes: '',
      status: 1
    });
    const modalMessage = ref('');
    const modalError = ref(false);

    const statusOptions = {
      1: 'Processing',
      2: 'Work Done',
      3: 'Can Not Done - Legal Issue',
      4: 'Can Not Done - Document Issue'
    };

    const filteredRequirements = computed(() => {
      const section = sections.value.find(s => s._id === selectedSectionId.value);
      return section?.requirements || [];
    });

    const fetchSections = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3000/api/sections');
        sections.value = response.data;
      } catch (err) {
        console.error('Failed to fetch sections', err);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:3000/api/auth/users');
        users.value = response.data;
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };

    const fetchInquiries = async () => {
      loading.value = true;
      error.value = '';
      try {
        const response = await axios.get('http://127.0.0.1:3000/api/inquiries');
        inquiries.value = response.data;
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load inquiries';
      } finally {
        loading.value = false;
      }
    };

    const getUserName = (userId) => {
      const user = users.value.find(u => u._id === userId);
      return user ? `${user.firstName} ${user.lastName}` : '-';
    };

    const onSectionChange = () => {
      modalInquiry.value.requirement = filteredRequirements.value[0]?._id || '';
    };

    const openAddModal = () => {
      isEditMode.value = false;
      selectedSectionId.value = sections.value[0]?._id || '';
      modalInquiry.value = {
        _id: '',
        firstName: '',
        lastName: '',
        requirement: filteredRequirements.value[0]?._id || '',
        nic: '',
        rating: null,
        assignee: users.value[0]?._id || '', 
        acknowledgement: '',
        notes: '',
        status: 1
      };
      modalMessage.value = '';
      showModal.value = true;
    };

    const openEditModal = (inquiry) => {
      isEditMode.value = true;

      // Determine the section and requirement for the inquiry
      const requirementObj = inquiry.requirement || {};
      const sectionId = requirementObj.section?._id || sections.value[0]?._id;
      selectedSectionId.value = sectionId;

      const section = sections.value.find(s => s._id === sectionId);
      const requirements = section?.requirements || [];

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
      };

      modalMessage.value = '';
      showModal.value = true;
    };

    const addInquiry = async () => {
      try {
        const payload = { ...modalInquiry.value };
        const response = await axios.post('http://127.0.0.1:3000/api/inquiries', payload);
        modalMessage.value = response.data.message;
        modalError.value = false;
        fetchInquiries();
        setTimeout(closeModal, 1000);
      } catch (err) {
        modalError.value = true;
        modalMessage.value = err.response?.data?.message || 'Failed to add inquiry';
      }
    };

    const updateInquiry = async () => {
      try {
        const payload = { ...modalInquiry.value };
        const response = await axios.put(`http://127.0.0.1:3000/api/inquiries/${modalInquiry.value._id}`, payload);
        modalMessage.value = response.data.message;
        modalError.value = false;
        fetchInquiries();
        setTimeout(closeModal, 1000);
      } catch (err) {
        modalError.value = true;
        modalMessage.value = err.response?.data?.message || 'Failed to update inquiry';
      }
    };

    const closeModal = () => {
      showModal.value = false;
      modalInquiry.value = {
        _id: '',
        firstName: '',
        lastName: '',
        requirement: '',
        nic: '',
        rating: null,
        assignee: '',
        acknowledgement: '',
        notes: '',
        status: 1
      };
      selectedSectionId.value = '';
      modalMessage.value = '';
    };

    onMounted(() => {
      fetchSections();
      fetchUsers();
      fetchInquiries();
    });

    return {
      inquiries,
      sections,
      users,
      selectedSectionId,
      filteredRequirements,
      loading,
      error,
      showModal,
      isEditMode,
      modalInquiry,
      modalMessage,
      modalError,
      statusOptions,
      fetchInquiries,
      openAddModal,
      openEditModal,
      onSectionChange,
      addInquiry,
      updateInquiry,
      closeModal,
      getUserName
    };
  }
};
</script>

<style scoped>
.inquiry-list {
  max-width: 800px;
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
  width: 500px;
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>