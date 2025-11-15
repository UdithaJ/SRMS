<template>
  <div class="section-list">
    <h2>Sections</h2>
    <div class="actions">
      <button @click="openAddModal">Add Section</button>
      <button @click="fetchSections">Refresh List</button>
    </div>

    <p v-if="loading">Loading sections...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <table v-if="sections.length" border="1" cellpadding="8">
      <thead>
        <tr>
          <th>Section ID</th>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="section in sections" :key="section._id">
          <td>{{ section.sectionId }}</td>
          <td>{{ section.name }}</td>
          <td>
            <button @click="openEditModal(section)">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>No sections found.</p>

    <!-- MODAL -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ isEditMode ? 'Edit Section' : 'Add Section' }}</h3>

        <!-- SECTION FORM -->
        <form @submit.prevent="isEditMode ? updateSection() : addSection()">
          <div>
            <label for="sectionId">Section ID:</label>
            <input type="text" v-model="modalSection.sectionId" id="sectionId" :disabled="isEditMode" required />
          </div>

          <div>
            <label for="name">Name:</label>
            <input type="text" v-model="modalSection.name" id="name" required />
          </div>

          <div class="modal-actions">
            <button type="submit">{{ isEditMode ? 'Save' : 'Add' }}</button>
            <button type="button" @click="closeModal">Cancel</button>
          </div>
        </form>

        <p v-if="modalMessage" :class="{ error: modalError, success: !modalError }">
          {{ modalMessage }}
        </p>

        <!-- REQUIREMENTS MANAGEMENT → EDIT MODE ONLY -->
        <div v-if="isEditMode" class="requirements-box">
          <h4>Requirements for this Section</h4>

          <!-- Requirement List -->
          <table v-if="requirements.length" border="1" cellpadding="6">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in requirements" :key="req._id">
                <td>{{ req.name }}</td>
                <td>
                  <button @click="startEditRequirement(req)">Edit</button>
                  <button @click="deleteRequirement(req._id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else>No requirements found.</p>

          <!-- Add/Edit Requirement Form -->
          <div class="req-form">
            <h4>{{ editingRequirement ? 'Edit Requirement' : 'Add New Requirement' }}</h4>

            <input
              type="text"
              v-model="reqForm.name"
              placeholder="Requirement Name"
            />

            <button @click="editingRequirement ? updateRequirement() : addRequirement()">
              {{ editingRequirement ? 'Update' : 'Add' }}
            </button>

            <button v-if="editingRequirement" @click="cancelRequirementEdit">Cancel</button>
          </div>

          <p v-if="reqMessage" :class="{ error: reqError, success: !reqError }">
            {{ reqMessage }}
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';

export default {
  name: 'SectionList',
  setup() {
    const sections = ref([]);
    const loading = ref(false);
    const error = ref('');

    const showModal = ref(false);
    const isEditMode = ref(false);
    const modalSection = ref({ _id: '', sectionId: '', name: '' });
    const modalMessage = ref('');
    const modalError = ref(false);

    // Requirement management
    const requirements = ref([]);
    const reqForm = ref({ name: '', _id: '' });
    const editingRequirement = ref(false);
    const reqMessage = ref('');
    const reqError = ref(false);

    /* ---------------------- FETCH SECTIONS ---------------------- */
    const fetchSections = async () => {
      loading.value = true;
      try {
        const response = await axios.get('http://127.0.0.1:3000/api/sections');
        sections.value = response.data;
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load sections';
      } finally {
        loading.value = false;
      }
    };

    /* ---------------------- FETCH REQUIREMENTS ---------------------- */
    const fetchRequirements = async (sectionId) => {
      try {
        const res = await axios.get(`http://127.0.0.1:3000/api/requirements/section/${sectionId}`);
        requirements.value = res.data;
      } catch (err) {
        requirements.value = [];
      }
    };

    /* ---------------------- MODALS ---------------------- */
    const openAddModal = () => {
      isEditMode.value = false;
      modalSection.value = { _id: '', sectionId: '', name: '' };
      modalMessage.value = '';
      showModal.value = true;
    };

    const openEditModal = async (section) => {
      isEditMode.value = true;
      modalSection.value = { ...section };
      modalMessage.value = '';
      showModal.value = true;

      fetchRequirements(section._id);
    };

    const closeModal = () => {
      showModal.value = false;
      modalSection.value = { _id: '', sectionId: '', name: '' };
      requirements.value = [];
      reqForm.value = { name: '', _id: '' };
      editingRequirement.value = false;
      reqMessage.value = '';
    };

    /* ---------------------- ADD SECTION ---------------------- */
    const addSection = async () => {
      try {
        const res = await axios.post('http://127.0.0.1:3000/api/sections', {
          sectionId: modalSection.value.sectionId,
          name: modalSection.value.name,
        });
        modalMessage.value = res.data.message;
        fetchSections();
        setTimeout(closeModal, 1000);
      } catch (err) {
        modalError.value = true;
        modalMessage.value = err.response?.data?.message || 'Failed to add section';
      }
    };

    /* ---------------------- UPDATE SECTION ---------------------- */
    const updateSection = async () => {
      try {
        const res = await axios.put(
          `http://127.0.0.1:3000/api/sections/${modalSection.value._id}`,
          { name: modalSection.value.name }
        );
        modalMessage.value = res.data.message;
        fetchSections();
      } catch (err) {
        modalError.value = true;
        modalMessage.value = 'Update failed';
      }
    };

    /* ---------------------- REQUIREMENTS CRUD ---------------------- */
    const addRequirement = async () => {
      try {
        const res = await axios.post('http://127.0.0.1:3000/api/requirements', {
          name: reqForm.value.name,
          section: modalSection.value._id,
        });

        reqMessage.value = res.data.message;
        fetchRequirements(modalSection.value._id);
        reqForm.value.name = '';
      } catch (err) {
        reqError.value = true;
        reqMessage.value = 'Failed to add requirement';
      }
    };

    const startEditRequirement = (req) => {
      editingRequirement.value = true;
      reqForm.value = { name: req.name, _id: req._id };
    };

    const updateRequirement = async () => {
      try {
        await axios.put(`http://127.0.0.1:3000/api/requirements/${reqForm.value._id}`, {
          name: reqForm.value.name,
          section: modalSection.value._id
        });

        reqMessage.value = 'Requirement updated';
        editingRequirement.value = false;
        reqForm.value = { name: '', _id: '' };
        fetchRequirements(modalSection.value._id);
      } catch {
        reqError.value = true;
        reqMessage.value = 'Update failed';
      }
    };

    const cancelRequirementEdit = () => {
      editingRequirement.value = false;
      reqForm.value = { name: '', _id: '' };
    };

    const deleteRequirement = async (id) => {
      if (!confirm('Delete this requirement?')) return;

      try {
        await axios.delete(`http://127.0.0.1:3000/api/requirements/${id}`);
        fetchRequirements(modalSection.value._id);
      } catch {
        reqError.value = true;
        reqMessage.value = 'Delete failed';
      }
    };

    onMounted(fetchSections);

    return {
      sections,
      loading,
      error,
      showModal,
      isEditMode,
      modalSection,
      modalMessage,
      modalError,
      fetchSections,
      openAddModal,
      openEditModal,
      addSection,
      updateSection,
      closeModal,

      // req
      requirements,
      reqForm,
      editingRequirement,
      reqMessage,
      reqError,
      addRequirement,
      startEditRequirement,
      updateRequirement,
      deleteRequirement,
      cancelRequirementEdit,
    };
  },
};
</script>

<style scoped>
/* same styling as original */
.section-list { max-width: 600px; margin: 0 auto; }
.modal-overlay {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}
.modal {
  background: white; padding: 1.5rem; border-radius: 8px; width: 450px;
}
.requirements-box {
  margin-top: 1.5rem;
  padding: 1rem;
  border-top: 1px solid #ddd;
}
.req-form {
  margin-top: 1rem;
  display: flex;
  gap: 8px;
}
.error { color: red; }
.success { color: green; }
</style>
