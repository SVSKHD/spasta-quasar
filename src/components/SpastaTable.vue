<template>
  <div class="spasta-table-container">
    <q-table
      :rows="rows"
      :columns="columns"
      :row-key="rowKey"
      :pagination="pagination"
      :loading="loading"
      :filter="filter"
      :selection="selection"
      :selected="selected"
      flat
      dark
      class="spasta-table"
      :class="tableClass"
      v-bind="$attrs"
      @update:selected="(value: readonly any[]) => $emit('update:selected', [...value])"
      @row-click="(evt: Event, row: any, index: number) => $emit('row-click', evt, row, index)"
      @request="(requestProp: any) => $emit('request', requestProp)"
    >
      <!-- Header slot -->
      <template v-if="$slots.top" v-slot:top>
        <slot name="top"></slot>
      </template>

      <!-- Custom column slots -->
      <template v-for="column in columns" :key="column.name" v-slot:[`body-cell-${column.name}`]="props">
        <q-td :props="props" :class="getCellClass(column)">
          <slot :name="`cell-${column.name}`" :props="props" :value="props.value" :row="props.row">
            <!-- Default cell rendering based on column type -->
            <div v-if="column.type === 'chip'" class="chip-cell">
              <q-chip
                :color="getChipColor(props.value, column)"
                :text-color="getChipTextColor(props.value, column)"
                size="sm"
                :label="formatCellValue(props.value, column)"
              />
            </div>
            
            <div v-else-if="column.type === 'currency'" class="currency-cell">
              <span :class="getCurrencyClass(props.value)">
                {{ formatCurrency(props.value, column) }}
              </span>
            </div>
            
            <div v-else-if="column.type === 'percentage'" class="percentage-cell">
              <span :class="getPercentageClass(props.value)">
                {{ formatPercentage(props.value, column) }}
              </span>
            </div>
            
            <div v-else-if="column.type === 'date'" class="date-cell">
              {{ formatDate(props.value, column) }}
            </div>
            
            <div v-else-if="column.type === 'actions'" class="actions-cell">
              <div class="row q-gutter-xs">
                <q-btn
                  v-for="action in getActions(column, props.row)"
                  :key="action.name"
                  flat
                  round
                  dense
                  :icon="action.icon"
                  :color="action.color || 'white'"
                  size="sm"
                  @click.stop="$emit('action', action.name, props.row)"
                  class="action-btn"
                >
                  <q-tooltip v-if="action.tooltip">{{ action.tooltip }}</q-tooltip>
                </q-btn>
              </div>
            </div>
            
            <div v-else-if="column.type === 'progress'" class="progress-cell">
              <div class="progress-container">
                <q-linear-progress
                  :value="props.value / 100"
                  :color="getProgressColor(props.value)"
                  track-color="grey-3"
                  size="8px"
                  rounded
                />
                <div class="progress-text">{{ props.value }}%</div>
              </div>
            </div>
            
            <div v-else-if="column.type === 'avatar'" class="avatar-cell">
              <q-avatar size="32px">
                <img 
                  v-if="props.value?.photoUrl" 
                  :src="props.value.photoUrl" 
                  :alt="props.value.name"
                  @error="handleAvatarError"
                />
                <div 
                  v-else 
                  class="bg-primary text-white text-weight-bold text-caption avatar-initials"
                >
                  {{ getInitials(props.value?.name || '') }}
                </div>
              </q-avatar>
              <span v-if="showAvatarName" class="avatar-name q-ml-sm">{{ props.value?.name }}</span>
            </div>
            
            <div v-else class="default-cell">
              {{ formatCellValue(props.value, column) }}
            </div>
          </slot>
        </q-td>
      </template>

      <!-- Header cell customization -->
      <template v-for="column in columns" :key="`header-${column.name}`" v-slot:[`header-cell-${column.name}`]="props">
        <q-th :props="props" :class="getHeaderClass(column)">
          <slot :name="`header-${column.name}`" :props="props">
            <div class="header-content">
              <q-icon v-if="column.icon" :name="column.icon" class="q-mr-xs" />
              {{ column.label }}
            </div>
          </slot>
        </q-th>
      </template>

      <!-- Loading slot -->
      <template v-if="$slots.loading" v-slot:loading>
        <slot name="loading"></slot>
      </template>

      <!-- No data slot -->
      <template v-if="$slots['no-data']" v-slot:no-data>
        <slot name="no-data"></slot>
      </template>

      <!-- Bottom slot -->
      <template v-if="$slots.bottom" v-slot:bottom>
        <slot name="bottom"></slot>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
interface TableColumn {
  name: string
  label: string
  field: string | ((row: any) => any)
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  type?: 'text' | 'chip' | 'currency' | 'percentage' | 'date' | 'actions' | 'progress' | 'avatar'
  format?: (val: any, row?: any) => string
  style?: string | ((row: any) => string)
  classes?: string | ((row: any) => string)
  headerStyle?: string
  headerClasses?: string
  icon?: string
  // Type-specific options
  chipColors?: Record<string, string>
  chipTextColors?: Record<string, string>
  currencySymbol?: string
  currencyPrefix?: string
  dateFormat?: string
  actions?: TableAction[]
  progressColors?: Record<string, string>
  showAvatarName?: boolean
}

interface TableAction {
  name: string
  icon: string
  color?: string
  tooltip?: string
  condition?: (row: any) => boolean
}

interface Props {
  rows: any[]
  columns: TableColumn[]
  rowKey?: string
  pagination?: any
  loading?: boolean
  filter?: string
  selection?: 'single' | 'multiple' | 'none'
  selected?: any[]
  tableClass?: string
  showAvatarName?: boolean
}

interface Emits {
  (e: 'update:selected', value: any[]): void
  (e: 'row-click', evt: Event, row: any, index: number): void
  (e: 'request', requestProp: any): void
  (e: 'action', actionName: string, row: any): void
}

withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  pagination: () => ({ rowsPerPage: 10 }),
  loading: false,
  selection: 'none',
  selected: () => [],
  tableClass: '',
  showAvatarName: false
})

defineEmits<Emits>()

const getCellClass = (column: TableColumn) => {
  const classes = ['spasta-table-cell']
  if (column.classes) {
    if (typeof column.classes === 'string') {
      classes.push(column.classes)
    }
  }
  if (column.align) {
    classes.push(`text-${column.align}`)
  }
  return classes.join(' ')
}

const getHeaderClass = (column: TableColumn) => {
  const classes = ['spasta-table-header']
  if (column.headerClasses) {
    classes.push(column.headerClasses)
  }
  if (column.align) {
    classes.push(`text-${column.align}`)
  }
  return classes.join(' ')
}

const formatCellValue = (value: any, column: TableColumn) => {
  if (column.format) {
    return column.format(value)
  }
  
  if (value === null || value === undefined) {
    return ''
  }
  
  return String(value)
}

const formatCurrency = (value: any, column: TableColumn) => {
  // Ensure value is a number
  const numValue = parseFloat(value)
  if (isNaN(numValue)) {
    return 'N/A'
  }
  
  const symbol = column.currencySymbol || '$'
  const prefix = column.currencyPrefix || ''
  return `${prefix}${symbol}${Math.abs(numValue).toLocaleString()}`
}

const formatPercentage = (value: any) => {
  // Ensure value is a number
  const numValue = parseFloat(value)
  if (isNaN(numValue)) {
    return 'N/A'
  }
  
  const sign = numValue >= 0 ? '+' : ''
  return `${sign}${numValue.toFixed(2)}%`
}

const formatDate = (value: string, column: TableColumn) => {
  if (!value) return ''
  const date = new Date(value)
  
  if (column.dateFormat === 'relative') {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

const getChipColor = (value: any, column: TableColumn) => {
  if (column.chipColors && column.chipColors[value]) {
    return column.chipColors[value]
  }
  return 'primary'
}

const getChipTextColor = (value: any, column: TableColumn) => {
  if (column.chipTextColors && column.chipTextColors[value]) {
    return column.chipTextColors[value]
  }
  return 'white'
}

const getCurrencyClass = (value: any) => {
  const classes = ['currency-value', 'text-weight-medium']
  const numValue = parseFloat(value)
  
  if (!isNaN(numValue)) {
    if (numValue >= 0) {
      classes.push('text-positive')
    } else {
      classes.push('text-negative')
    }
  }
  
  return classes.join(' ')
}

const getPercentageClass = (value: any) => {
  const classes = ['percentage-value', 'text-weight-medium']
  const numValue = parseFloat(value)
  
  if (!isNaN(numValue)) {
    if (numValue >= 0) {
      classes.push('text-positive')
    } else {
      classes.push('text-negative')
    }
  }
  
  return classes.join(' ')
}

const getProgressColor = (value: any) => {
  const numValue = parseFloat(value)
  if (isNaN(numValue)) {
    return 'grey'
  }
  
  if (numValue >= 80) return 'positive'
  if (numValue >= 60) return 'warning'
  return 'negative'
}

const getActions = (column: TableColumn, row: any) => {
  if (!column.actions) return []
  
  return column.actions.filter(action => {
    if (action.condition) {
      return action.condition(row)
    }
    return true
  })
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<style scoped>
.spasta-table-container {
  width: 100%;
}

.spasta-table {
  background: rgba(58, 107, 140, 0.1) !important;
  backdrop-filter: blur(15px) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(239, 228, 210, 0.2) !important;
  overflow: hidden;
}

.spasta-table :deep(.q-table__top) {
  background: transparent;
  padding: 16px 20px;
}

.spasta-table :deep(.q-table__middle) {
  border-radius: 20px;
  overflow: hidden;
}

.spasta-table :deep(.q-table thead) {
  background: rgba(58, 107, 140, 0.3) !important;
  backdrop-filter: blur(10px) !important;
}

.spasta-table :deep(.q-table thead th) {
  background: rgba(58, 107, 140, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  color: #EFE4D2 !important;
  font-weight: 600 !important;
  border: none !important;
  padding: 16px 12px !important;
  position: relative;
}

.spasta-table :deep(.q-table thead th:first-child) {
  border-radius: 20px 0 0 0;
}

.spasta-table :deep(.q-table thead th:last-child) {
  border-radius: 0 20px 0 0;
}

.spasta-table :deep(.q-table tbody td) {
  color: #EFE4D2 !important;
  border: none !important;
  padding: 12px !important;
  background: transparent !important;
}

.spasta-table :deep(.q-table tbody tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(239, 228, 210, 0.1) !important;
}

.spasta-table :deep(.q-table tbody tr:hover) {
  background: rgba(58, 107, 140, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  transform: translateY(-1px);
}

.spasta-table :deep(.q-table tbody tr:last-child td:first-child) {
  border-radius: 0 0 0 20px;
}

.spasta-table :deep(.q-table tbody tr:last-child td:last-child) {
  border-radius: 0 0 20px 0;
}

/* Cell specific styling */
.spasta-table-cell {
  position: relative;
}

.spasta-table-header {
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.chip-cell .q-chip {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.currency-cell {
  font-family: 'JetBrains Mono', monospace;
}

.percentage-cell {
  font-family: 'JetBrains Mono', monospace;
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.action-btn {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 228, 210, 0.2);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(239, 228, 210, 0.2) !important;
  transform: translateY(-1px);
  border-color: rgba(239, 228, 210, 0.4);
}

.progress-cell {
  min-width: 120px;
}

.progress-container {
  position: relative;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: 600;
  color: #EFE4D2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.avatar-cell {
  display: flex;
  align-items: center;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.avatar-name {
  color: #EFE4D2;
  font-weight: 500;
}

.date-cell {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
}

/* Pagination styling */
.spasta-table :deep(.q-table__bottom) {
  background: rgba(58, 107, 140, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 0 0 20px 20px;
  border-top: 1px solid rgba(239, 228, 210, 0.1);
  color: #EFE4D2;
}

.spasta-table :deep(.q-table__bottom .q-btn) {
  color: #EFE4D2;
  border-radius: 8px;
}

.spasta-table :deep(.q-table__bottom .q-btn:hover) {
  background: rgba(239, 228, 210, 0.2);
}

/* Selection styling */
.spasta-table :deep(.q-table tbody tr.selected) {
  background: rgba(114, 92, 173, 0.3) !important;
  border-color: rgba(239, 228, 210, 0.4) !important;
}

/* Loading overlay */
.spasta-table :deep(.q-table__loading) {
  background: rgba(37, 77, 112, 0.8) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 20px;
}

.spasta-table :deep(.q-table__loading .q-spinner) {
  color: #EFE4D2 !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .spasta-table :deep(.q-table thead th),
  .spasta-table :deep(.q-table tbody td) {
    padding: 8px 6px !important;
    font-size: 0.9em;
  }
  
  .action-btn {
    min-width: 28px;
    min-height: 28px;
  }
  
  .progress-cell {
    min-width: 80px;
  }
  
  .avatar-cell .q-avatar {
    width: 24px !important;
    height: 24px !important;
  }
  
  .avatar-name {
    font-size: 0.8em;
  }
}

/* Scrollbar styling */
.spasta-table :deep(.q-table__middle) {
  scrollbar-width: thin;
  scrollbar-color: rgba(58, 107, 140, 0.6) rgba(239, 228, 210, 0.1);
}

.spasta-table :deep(.q-table__middle)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.spasta-table :deep(.q-table__middle)::-webkit-scrollbar-track {
  background: rgba(239, 228, 210, 0.1);
  border-radius: 8px;
}

.spasta-table :deep(.q-table__middle)::-webkit-scrollbar-thumb {
  background: rgba(58, 107, 140, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.spasta-table :deep(.q-table__middle)::-webkit-scrollbar-thumb:hover {
  background: rgba(58, 107, 140, 0.8);
}
</style>