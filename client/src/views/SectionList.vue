<template>
  <v-container fluid class="pa-4">
    <v-card max-width="1200" outlined elevation="2">
      <v-toolbar flat color="cyan lighten-4">
        <v-toolbar-title>Sections</v-toolbar-title>
        <v-spacer />
        <v-btn color="primary" @click="openAddModal">Add Section</v-btn>
        <v-btn color="secondary" @click="fetchSections">Refresh</v-btn>
      </v-toolbar>

      <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
      <v-alert v-if="error" type="error">{{ error }}</v-alert>

      <v-data-table
        :headers="tableHeaders"
        :items="sections"
        :items-per-page="10"
        class="elevation-1"
        dense
      >
        <template #item="{ item }">
          <tr>
            <td>{{ item.sectionId }}</td>
            <td>{{ item.name }}</td>
            <td class="text-right">
              <v-btn size="x-small" icon small @click="openEditModal(item)">
                <v-icon size="small">mdi-pencil</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>

        <template v-slot:no-data>
          <v-alert type="info">No sections found.</v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showModal" max-width="800px">
      <v-card>
        <v-card-title>{{ isEditMode ? 'Edit Section' : 'Add Section' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="isEditMode ? updateSection() : addSection()">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  label="Section ID"
                  v-model="modalSection.sectionId"
                  :disabled="isEditMode"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field label="Name" v-model="modalSection.name" required></v-text-field>
              </v-col>
            </v-row>

            <v-alert v-if="modalMessage" :type="modalError ? 'error' : 'success'" class="mt-2">
              {{ modalMessage }}
            </v-alert>
          </v-form>

          <!-- Requirements section (edit mode only) -->
          <div v-if="isEditMode" class="requirements-box">
            <h4>Requirements for this Section</h4>

            <div class="requirements-scroll">
              <v-data-table :headers="reqHeaders" :items="requirements" dense hide-default-footer>
              <template #item="{ item }">
                <tr>
                  <td>{{ item.name }}</td>
                  <td class="text-right">
                    <v-btn size="x-small" icon small @click="startEditRequirement(item)">
                      <v-icon size="small">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn size="x-small" icon small @click="deleteRequirement(item._id)">
                      <v-icon size="small">mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>

              <template v-slot:no-data>
                <v-alert type="info">No requirements found.</v-alert>
              </template>
              </v-data-table>
            </div>

            <v-row class="mt-3" align="center">
              <v-col cols="12" sm="8">
                <v-text-field label="Requirement Name" v-model="reqForm.name"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn color="primary" @click="editingRequirement ? updateRequirement() : addRequirement()">
                  {{ editingRequirement ? 'Update' : 'Add' }}
                </v-btn>
                <v-btn v-if="editingRequirement" text @click="cancelRequirementEdit">Cancel</v-btn>
              </v-col>
            </v-row>

            <v-alert v-if="reqMessage" :type="reqError ? 'error' : 'success'" class="mt-2">
              {{ reqMessage }}
            </v-alert>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="isEditMode ? updateSection() : addSection()">
            {{ isEditMode ? 'Save' : 'Add' }}
          </v-btn>
          <v-btn color="secondary" @click="closeModal">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
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

    // table headers for sections
    const tableHeaders = [
      { text: 'Section ID', value: 'sectionId' },
      { text: 'Name', value: 'name' },
      { text: 'Actions', value: 'actions', sortable: false }
    ];

    const reqHeaders = [
      { text: 'Name', value: 'name' },
      { text: 'Actions', value: 'actions', sortable: false }
    ];

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
      tableHeaders,
      reqHeaders,
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
.section-list { max-width: 100%; }
.requirements-box {
  margin-top: 1rem;
}

.requirements-scroll {
  max-height: 220px;
  overflow-y: auto;
}
.error { color: red; }
.success { color: green; }
</style>
