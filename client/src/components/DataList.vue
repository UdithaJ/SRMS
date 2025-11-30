<template>
  <div class="data-list-wrapper">
    <!-- Table Card -->
    <div class="neomorphic-card table-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="header in headers" :key="header.value" class="table-header">
                {{ header.title }}
              </th>
            </tr>
          </thead>
        </table>
        <div class="table-body-scroll">
          <table class="data-table">
            <tbody>
              <tr v-if="items.length === 0">
                <td :colspan="headers.length" class="text-center pa-8">
                  <slot name="no-data">
                    <v-icon size="48" color="grey-lighten-1">{{ noDataIcon }}</v-icon>
                    <p class="mt-2 text-grey">{{ noDataText }}</p>
                  </slot>
                </td>
              </tr>
              <tr v-for="item in items" :key="item._id || item.id" class="table-row">
                <td 
                  v-for="header in headers.filter(h => h.value !== 'actions')" 
                  :key="header.value" 
                  class="table-cell"
                  :class="header.align ? `text-${header.align}` : ''"
                  :title="String(item[header.value] || '')"
                >
                  <div class="cell-content">
                    <slot :name="`item.${header.value}`" :item="item" :value="item[header.value]">
                      {{ item[header.value] }}
                    </slot>
                  </div>
                </td>
                <td v-if="hasActions" class="table-cell text-right">
                  <slot name="item.actions" :item="item">
                    <button 
                      v-if="showEdit"
                      class="neomorphic-btn-small" 
                      @click="$emit('edit', item)" 
                      title="Edit"
                    >
                      <v-icon size="18" color="#667eea">mdi-pencil</v-icon>
                    </button>
                  </slot>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="pagination && pagination.total > 0" class="pagination-controls neomorphic-card mt-4 pa-3">
      <div class="d-flex align-center justify-space-between">
        <div class="pagination-info">
          Showing {{ Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total) }} 
          to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
          of {{ pagination.total }} entries
        </div>
        <div class="pagination-buttons d-flex align-center gap-2">
          <button 
            class="neomorphic-btn neomorphic-btn-icon-small" 
            @click="$emit('page-change', 1)"
            :disabled="pagination.page === 1"
            title="First Page"
          >
            <v-icon size="18">mdi-page-first</v-icon>
          </button>
          <button 
            class="neomorphic-btn neomorphic-btn-icon-small" 
            @click="$emit('page-change', pagination.page - 1)"
            :disabled="pagination.page === 1"
            title="Previous Page"
          >
            <v-icon size="18">mdi-chevron-left</v-icon>
          </button>
          
          <div class="page-numbers d-flex align-center gap-2">
            <template v-for="(page, index) in visiblePages">
              <span v-if="page === '...'" :key="`ellipsis-${index}`" class="page-ellipsis">...</span>
              <button 
                v-else
                :key="page"
                class="neomorphic-btn neomorphic-btn-icon-small page-number" 
                :class="{ active: pagination.page === page }"
                @click="$emit('page-change', page)"
              >
                {{ page }}
              </button>
            </template>
          </div>

          <button 
            class="neomorphic-btn neomorphic-btn-icon-small" 
            @click="$emit('page-change', pagination.page + 1)"
            :disabled="pagination.page === pagination.pages"
            title="Next Page"
          >
            <v-icon size="18">mdi-chevron-right</v-icon>
          </button>
          <button 
            class="neomorphic-btn neomorphic-btn-icon-small" 
            @click="$emit('page-change', pagination.pages)"
            :disabled="pagination.page === pagination.pages"
            title="Last Page"
          >
            <v-icon size="18">mdi-page-last</v-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  headers: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: null
  },
  showEdit: {
    type: Boolean,
    default: true
  },
  noDataIcon: {
    type: String,
    default: 'mdi-information-outline'
  },
  noDataText: {
    type: String,
    default: 'No data available'
  }
})

defineEmits(['edit', 'page-change'])

const hasActions = computed(() => {
  return props.headers.some(h => h.value === 'actions')
})

const visiblePages = computed(() => {
  if (!props.pagination) return []
  
  const { page, pages } = props.pagination
  const delta = 2 // Show 2 pages on each side of current page
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
      range.push(i)
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})
</script>

<style scoped lang="scss">
@import '@/assets/neomorphic.scss';

.data-list-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-card {
  flex: 0 0 auto;
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    
    thead {
      tr {
        background: var(--table-header-bg) !important;
        
        th {
          color: var(--neomorphic-text) !important;
          font-weight: 600 !important;
          text-transform: uppercase;
          font-size: 13px !important;
          letter-spacing: 0.5px;
          padding: 16px 12px !important;
          border-bottom: none !important;
          text-align: left;
        }
      }
    }
    
    tbody {
      tr {
        &:hover {
          background: var(--table-hover-bg) !important;
        }
        
        td {
          padding: 6px 12px !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          font-size: 14px !important;
          max-width: 0;
          overflow: hidden;
          color: var(--neomorphic-text) !important;
          
          .cell-content {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}

.table-body-scroll {
  height: calc(100vh - 370px);
  overflow-y: auto;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    width: 8px !important;
    height: 8px !important;
  }

  &::-webkit-scrollbar-track {
    background: var(--scrollbar-track) !important;
    border-radius: 4px !important;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb) !important;
    border-radius: 4px !important;
    
    &:hover {
      background: var(--scrollbar-thumb-hover) !important;
    }
  }
  
  // Firefox scrollbar
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

.pagination-controls {
  flex: 0 0 auto;
  margin-top: 0 !important;
  .pagination-info {
    color: var(--neomorphic-text);
    font-size: 14px;
    font-weight: 500;
  }

  .pagination-buttons {
    gap: 8px;

    .neomorphic-btn-icon-small {
      width: 36px;
      height: 36px;
      min-width: 36px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      &.page-number {
        font-weight: 500;
        font-size: 14px;
        color: var(--neomorphic-text);

        &.active {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          box-shadow: 
            2px 2px 4px var(--neomorphic-shadow-dark),
            -2px -2px 4px var(--neomorphic-shadow-light),
            inset 1px 1px 2px rgba(255, 255, 255, 0.1);
        }
      }
    }
  }

  .page-numbers {
    .page-ellipsis {
      color: var(--neomorphic-text);
      padding: 0 4px;
    }
  }
}

// Add gap utility
.gap-2 {
  gap: 8px;
}
</style>
