<template>
  <v-container fluid class="neomorphic-container">
    <!-- Header Card with Neumorphism -->
    <div class="neomorphic-card header-card mb-4">
      <div class="d-flex align-center justify-space-between pa-3">
        <h2 class="page-title">Sections Management</h2>
        <div class="action-buttons">
          <button class="neomorphic-btn neomorphic-btn-icon mr-3" @click="openAddModal" title="Add Section">
            <v-icon color="#667eea">mdi-plus</v-icon>
          </button>
          <button class="neomorphic-btn neomorphic-btn-icon" @click="fetchSections(true)" title="Refresh">
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
        :items="sections"
        :items-per-page="10"
        class="neomorphic-table compact-table w-100"
        density="compact"
      >
        <template #item="{ item }">
          <tr class="table-row">
            <td class="table-cell">{{ item.sectionId }}</td>
            <td class="table-cell">{{ item.name }}</td>
            <td class="table-cell text-right">
              <button class="neomorphic-btn-small" @click="openEditModal(item)" title="Edit">
                <v-icon size="18" color="#667eea">mdi-pencil</v-icon>
              </button>
            </td>
          </tr>
        </template>

        <template v-slot:no-data>
          <div class="pa-8 text-center text-grey">
            <v-icon size="48" color="grey-lighten-1">mdi-folder-outline</v-icon>
            <p class="mt-2">No sections found.</p>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showModal" max-width="800px">
      <div class="neomorphic-modal">
        <div class="modal-header pa-6">
          <h3 class="modal-title">{{ isEditMode ? 'Edit Section' : 'Add Section' }}</h3>
        </div>
        <div class="modal-content pa-6">
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

            <v-alert v-if="modalMessage" :type="modalError ? 'error' : 'success'" class="neomorphic-alert mt-2">
              {{ modalMessage }}
            </v-alert>
          </v-form>

          <!-- Requirements section (edit mode only) -->
          <div v-if="isEditMode" class="requirements-box neomorphic-card pa-4 mt-4">
            <h4 class="page-title mb-3" style="font-size: 16px;">Requirements for this Section</h4>

            <div class="requirements-scroll">
              <v-data-table :headers="reqHeaders" :items="requirements" class="neomorphic-table" dense hide-default-footer>
              <template #item="{ item }">
                <tr class="table-row">
                  <td class="table-cell">{{ item.name }}</td>
                  <td class="table-cell text-right">
                    <button class="neomorphic-btn-small mr-2" @click="startEditRequirement(item)" title="Edit">
                      <v-icon size="16" color="#667eea">mdi-pencil</v-icon>
                    </button>
                    <button class="neomorphic-btn-small" @click="deleteRequirement(item._id)" title="Delete">
                      <v-icon size="16" color="#667eea">mdi-delete</v-icon>
                    </button>
                  </td>
                </tr>
              </template>

              <template v-slot:no-data>
                <div class="pa-4 text-center text-grey">
                  <p>No requirements found.</p>
                </div>
              </template>
              </v-data-table>
            </div>

            <v-row class="mt-3" align="center">
              <v-col cols="12" sm="8">
                <v-text-field label="Requirement Name" v-model="reqForm.name"></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <button class="neomorphic-btn neomorphic-btn-primary mr-2" @click="editingRequirement ? updateRequirement() : addRequirement()">
                  {{ editingRequirement ? 'Update' : 'Add' }}
                </button>
                <button v-if="editingRequirement" class="neomorphic-btn" @click="cancelRequirementEdit">Cancel</button>
              </v-col>
            </v-row>

            <v-alert v-if="reqMessage" :type="reqError ? 'error' : 'success'" class="neomorphic-alert mt-2">
              {{ reqMessage }}
            </v-alert>
          </div>
        </div>

        <div class="modal-actions pa-6 d-flex justify-end">
          <button class="neomorphic-btn mr-3" @click="closeModal">Cancel</button>
          <button class="neomorphic-btn neomorphic-btn-primary" @click="isEditMode ? updateSection() : addSection()">
            {{ isEditMode ? 'Save' : 'Add' }}
          </button>
        </div>
      </div>
    </v-dialog>
  </v-container>
</template>

<script>
import { http, invalidateCache } from '@/api/http';
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

export default {
  name: 'SectionList',
  setup() {
    const sections = ref([]);
    const loading = ref(false);
    const error = ref('');
    const viewportHeight = ref(window.innerHeight);

    const ROW_HEIGHT = 36;
    const HEADER_HEIGHT = 52;
    const VERTICAL_PADDING = 64;

    const updateViewport = () => { viewportHeight.value = window.innerHeight };
    window.addEventListener('resize', updateViewport);

    // table headers for sections
    const tableHeaders = [
      { title: 'Section ID', value: 'sectionId' },
      { title: 'Name', value: 'name' },
      { title: 'Actions', value: 'actions', sortable: false }
    ];

    const reqHeaders = [
      { title: 'Name', value: 'name' },
      { title: 'Actions', value: 'actions', sortable: false }
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
    const fetchSections = async (forceRefresh = false) => {
      loading.value = true;
      try {
        // Clear cache if force refresh
        if (forceRefresh) {
          invalidateCache('/api/sections');
        }
        
        const response = await http.get('/api/sections', {
          cacheTTL: 300000, // Cache for 5 minutes
          useCache: !forceRefresh // Bypass cache if force refresh
        });
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
        const res = await http.get(`/api/requirements/section/${sectionId}`, {
          cacheTTL: 240000 // Cache for 4 minutes
        });
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
        const res = await http.post('/api/sections', {
          sectionId: modalSection.value.sectionId,
          name: modalSection.value.name,
        });
        modalMessage.value = res.data.message;
        invalidateCache('/api/sections');
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
        const res = await http.put(
          `/api/sections/${modalSection.value._id}`,
          { name: modalSection.value.name }
        );
        modalMessage.value = res.data.message;
        invalidateCache('/api/sections');
        fetchSections();
      } catch (err) {
        modalError.value = true;
        modalMessage.value = 'Update failed';
      }
    };

    /* ---------------------- REQUIREMENTS CRUD ---------------------- */
    const addRequirement = async () => {
      try {
        const res = await http.post('/api/requirements', {
          name: reqForm.value.name,
          section: modalSection.value._id,
        });

        reqMessage.value = res.data.message;
        invalidateCache('/api/requirements');
        invalidateCache('/api/sections'); // Sections may include requirements
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
        await http.put(`/api/requirements/${reqForm.value._id}`, {
          name: reqForm.value.name,
          section: modalSection.value._id
        });

        reqMessage.value = 'Requirement updated';
        invalidateCache('/api/requirements');
        invalidateCache('/api/sections');
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
        await http.delete(`/api/requirements/${id}`);
        invalidateCache('/api/requirements');
        invalidateCache('/api/sections');
        fetchRequirements(modalSection.value._id);
      } catch {
        reqError.value = true;
        reqMessage.value = 'Delete failed';
      }
    };

    const computedTableHeight = computed(() => {
      const rows = sections.value.length;
      const desired = rows * ROW_HEIGHT + HEADER_HEIGHT;
      const maxAvailable = viewportHeight.value - VERTICAL_PADDING;
      return Math.min(Math.max(desired, 120), maxAvailable);
    });

    onMounted(fetchSections);

    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateViewport);
    });

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
      computedTableHeight,
    };
  },
};
</script>

<style scoped lang="scss">
@import '@/assets/neomorphic.scss';

.requirements-scroll {
  max-height: 300px;
  overflow-y: auto;
}
</style>
