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
    <DataList
      :headers="tableHeaders"
      :items="tableItems"
      :pagination="pagination"
      no-data-icon="mdi-folder-outline"
      no-data-text="No sections found."
      @edit="openEditModal"
      @page-change="handlePageChange"
    />

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showModal" max-width="750px">
      <div class="neomorphic-modal elegant-modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditMode ? 'Edit Section' : 'Add Section' }}</h3>
        </div>
        <div class="modal-content">
          <v-form @submit.prevent="isEditMode ? updateSection() : addSection()">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Section ID"
                  v-model="modalSection.sectionId"
                  :disabled="isEditMode"
                  density="comfortable"
                  hide-details="auto"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field 
                  label="Name" 
                  v-model="modalSection.name" 
                  density="comfortable"
                  hide-details="auto"
                  required
                ></v-text-field>
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
                <v-text-field 
                  label="Requirement Name" 
                  v-model="reqForm.name" 
                  density="comfortable"
                  hide-details="auto"
                  :disabled="reqLoading"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <button class="neomorphic-btn neomorphic-btn-primary mr-2" @click="editingRequirement ? updateRequirement() : addRequirement()" :disabled="reqLoading">
                  <v-progress-circular v-if="reqLoading" indeterminate size="16" width="2" class="mr-1"></v-progress-circular>
                  {{ editingRequirement ? 'Update' : 'Add' }}
                </button>
                <button v-if="editingRequirement" class="neomorphic-btn" @click="cancelRequirementEdit" :disabled="reqLoading">Cancel</button>
              </v-col>
            </v-row>

            <v-alert v-if="reqMessage" :type="reqError ? 'error' : 'success'" class="neomorphic-alert mt-2">
              {{ reqMessage }}
            </v-alert>
          </div>
        </div>

        <div class="modal-actions d-flex justify-end">
          <button class="neomorphic-btn mr-3" @click="closeModal" :disabled="modalLoading">Cancel</button>
          <button class="neomorphic-btn neomorphic-btn-primary" @click="isEditMode ? updateSection() : addSection()" :disabled="modalLoading">
            <v-progress-circular v-if="modalLoading" indeterminate size="18" width="2" class="mr-2"></v-progress-circular>
            {{ isEditMode ? 'Save' : 'Add' }}
          </button>
        </div>
      </div>
    </v-dialog>
  </v-container>
</template>

<script>
import { http, invalidateCache } from '@/api/http';
import { ref, onMounted, computed } from 'vue';
import { useToast } from '@/composables/useToast';
import DataList from '@/components/DataList.vue';

export default {
  name: 'SectionList',
  components: {
    DataList
  },
  setup() {
    const { showToast } = useToast();
    const sections = ref([]);
    const loading = ref(false);
    const error = ref('');
    const currentPage = ref(1);
    const pagination = ref({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    });

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
    const modalLoading = ref(false);

    // Requirement management
    const requirements = ref([]);
    const reqForm = ref({ name: '', _id: '' });
    const editingRequirement = ref(false);
    const reqMessage = ref('');
    const reqError = ref(false);
    const reqLoading = ref(false);

    /* ---------------------- FETCH SECTIONS ---------------------- */
    const fetchSections = async (forceRefresh = false) => {
      loading.value = true;
      try {
        // Clear cache if force refresh
        if (forceRefresh) {
          invalidateCache('/api/sections');
          currentPage.value = 1;
        }
        
        const response = await http.get('/api/sections', {
          params: {
            page: currentPage.value,
            limit: 10
          },
          cacheTTL: 300000, // Cache for 5 minutes
          useCache: !forceRefresh // Bypass cache if force refresh
        });
        sections.value = response.data.sections || [];
        pagination.value = response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load sections';
      } finally {
        loading.value = false;
      }
    };

    /* ---------------------- PAGE CHANGE ---------------------- */
    const handlePageChange = (page) => {
      currentPage.value = page;
      fetchSections();
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
        modalLoading.value = true;
        const res = await http.post('/api/sections', {
          sectionId: modalSection.value.sectionId,
          name: modalSection.value.name,
        });
        showToast(res.data.message || 'Section added successfully', 'success');
        invalidateCache('/api/sections');
        fetchSections();
        closeModal();
      } catch (err) {
        modalError.value = true;
        modalMessage.value = err.response?.data?.message || 'Failed to add section';
      } finally {
        modalLoading.value = false;
      }
    };

    /* ---------------------- UPDATE SECTION ---------------------- */
    const updateSection = async () => {
      try {
        modalLoading.value = true;
        const res = await http.put(
          `/api/sections/${modalSection.value._id}`,
          { name: modalSection.value.name }
        );
        showToast(res.data.message || 'Section updated successfully', 'success');
        invalidateCache('/api/sections');
        fetchSections();
      } catch (err) {
        modalError.value = true;
        modalMessage.value = 'Update failed';
      } finally {
        modalLoading.value = false;
      }
    };

    /* ---------------------- REQUIREMENTS CRUD ---------------------- */
    const addRequirement = async () => {
      try {
        reqLoading.value = true;
        const res = await http.post('/api/requirements', {
          name: reqForm.value.name,
          section: modalSection.value._id,
        });

        showToast(res.data.message || 'Requirement added successfully', 'success');
        invalidateCache('/api/requirements');
        invalidateCache('/api/sections'); // Sections may include requirements
        fetchRequirements(modalSection.value._id);
        reqForm.value.name = '';
      } catch (err) {
        reqError.value = true;
        reqMessage.value = 'Failed to add requirement';
      } finally {
        reqLoading.value = false;
      }
    };

    const startEditRequirement = (req) => {
      editingRequirement.value = true;
      reqForm.value = { name: req.name, _id: req._id };
    };

    const updateRequirement = async () => {
      try {
        reqLoading.value = true;
        await http.put(`/api/requirements/${reqForm.value._id}`, {
          name: reqForm.value.name,
          section: modalSection.value._id
        });

        showToast('Requirement updated successfully', 'success');
        invalidateCache('/api/requirements');
        invalidateCache('/api/sections');
        editingRequirement.value = false;
        reqForm.value = { name: '', _id: '' };
        fetchRequirements(modalSection.value._id);
      } catch {
        reqError.value = true;
        reqMessage.value = 'Update failed';
      } finally {
        reqLoading.value = false;
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

    const tableItems = computed(() => {
      return sections.value.map(section => ({
        ...section
      }));
    });

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
      tableItems,
      pagination,
      handlePageChange,
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

.elegant-modal {
  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .modal-content {
    padding: 24px;
    max-height: calc(85vh - 180px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(102, 126, 234, 0.3);
      border-radius: 3px;

      &:hover {
        background: rgba(102, 126, 234, 0.5);
      }
    }
  }

  .modal-actions {
    padding: 16px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
}
</style>
