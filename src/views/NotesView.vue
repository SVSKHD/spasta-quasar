<template>
  <div class="notes-view">
    <div class="notes-layout">
      <!-- Left Sidebar - Categories -->
      <div class="notes-sidebar spasta-card">
        <div class="sidebar-header q-pa-lg">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 spasta-text">
              <q-icon name="folder" class="q-mr-sm icon-md" />
              Categories
            </div>
            <q-btn
              flat
              round
              dense
              icon="add"
              @click="showCategoryDialog = true"
              class="spasta-text"
            >
              <q-tooltip>Add category</q-tooltip>
            </q-btn>
          </div>
          
          <q-input
            v-model="searchQuery"
            placeholder="Search notes..."
            outlined
            dense
            class="spasta-input"
            color="white"
            label-color="white"
            dark
          >
            <template v-slot:prepend>
              <q-icon name="search" class="icon-sm" />
            </template>
          </q-input>
        </div>

        <q-scroll-area class="sidebar-content">
          <div class="q-pa-lg q-pt-none">
            <!-- All Notes -->
            <q-item
              clickable
              v-ripple
              :active="selectedCategory === null"
              @click="selectCategory(null)"
              class="rounded-borders q-mb-xs category-item"
            >
              <q-item-section avatar>
                <q-icon name="note" color="white" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="spasta-text">All Notes</q-item-label>
                <q-item-label caption class="spasta-text opacity-70">{{ allNotes.length }} notes</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md" />

            <!-- Categories -->
            <q-item
              v-for="category in categories"
              :key="category.id"
              clickable
              v-ripple
              :active="selectedCategory === category.id"
              @click="selectCategory(category.id)"
              class="rounded-borders q-mb-xs category-item"
            >
              <q-item-section avatar>
                <q-icon :name="category.icon" :color="category.color" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="spasta-text">{{ category.name }}</q-item-label>
                <q-item-label caption class="spasta-text opacity-70">{{ getCategoryNoteCount(category.id) }} notes</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  icon="more_vert"
                  size="sm"
                  @click.stop="showCategoryMenu(category)"
                  class="spasta-text"
                />
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md" />

            <!-- Notes List -->
            <div class="notes-list">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 spasta-text">
                  {{ selectedCategoryName }} Notes
                </div>
                <q-btn
                  flat
                  round
                  dense
                  icon="add"
                  @click="createNewNote"
                  class="spasta-text"
                  size="sm"
                >
                  <q-tooltip>New note</q-tooltip>
                </q-btn>
              </div>
              
              <q-item
                v-for="note in filteredNotes"
                :key="note.id"
                clickable
                v-ripple
                :active="selectedNote?.id === note.id"
                @click="selectNote(note)"
                class="rounded-borders q-mb-xs note-item"
              >
                <q-item-section>
                  <q-item-label class="spasta-text text-weight-medium">
                    {{ note.title || 'Untitled Note' }}
                  </q-item-label>
                  <q-item-label caption class="spasta-text opacity-70">
                    {{ formatDate(note.updatedAt) }}
                  </q-item-label>
                  <q-item-label caption class="spasta-text opacity-60">
                    {{ getPlainTextPreview(note.content) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    size="sm"
                    @click.stop="deleteNote(note.id)"
                    class="spasta-text"
                  />
                </q-item-section>
              </q-item>

              <div v-if="filteredNotes.length === 0" class="text-center q-pa-lg">
                <q-icon name="note_add" size="xl" class="spasta-text opacity-30 q-mb-md" />
                <div class="text-body2 spasta-text opacity-70">No notes found</div>
                <div class="text-caption spasta-text opacity-50">Create your first note</div>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </div>

      <!-- Right Side - WordPress-style Editor -->
      <div class="notes-editor">
        <div v-if="selectedNote" class="editor-container">
          <!-- WordPress-style Header -->
          <div class="editor-header spasta-card">
            <div class="q-pa-lg">
              <!-- Title Input -->
              <q-input
                v-model="selectedNote.title"
                placeholder="Add title"
                borderless
                class="title-input"
                @update:model-value="debouncedSave"
              />
              
              <!-- Meta Information -->
              <div class="row items-center justify-between q-mt-md">
                <div class="row items-center spacing-md">
                  <q-select
                    v-model="selectedNote.categoryId"
                    :options="categorySelectOptions"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    outlined
                    dense
                    label="Category"
                    class="spasta-input category-select"
                    color="white"
                    label-color="white"
                    dark
                    @update:model-value="debouncedSave"
                  />
                  
                  <q-btn
                    flat
                    icon="local_offer"
                    label="Add Tags"
                    size="sm"
                    @click="showTagDialog = true"
                    class="spasta-text"
                  />
                </div>
                
                <div class="editor-actions row items-center spacing-sm">
                  <q-btn
                    flat
                    icon="save"
                    label="Save"
                    size="sm"
                    @click="saveNote"
                    :loading="saving"
                    class="spasta-text"
                  />
                  <q-btn
                    flat
                    icon="preview"
                    label="Preview"
                    size="sm"
                    @click="togglePreview"
                    class="spasta-text"
                  />
                  <div class="text-caption spasta-text opacity-70">
                    {{ saving ? 'Saving...' : `Saved ${formatDate(selectedNote.updatedAt)}` }}
                  </div>
                </div>
              </div>

              <!-- Tags Display -->
              <div v-if="selectedNote.tags.length" class="row q-gutter-xs q-mt-sm">
                <q-chip
                  v-for="tag in selectedNote.tags"
                  :key="tag"
                  removable
                  @remove="removeTag(tag)"
                  color="white"
                  text-color="grey-8"
                  size="sm"
                  :label="`#${tag}`"
                />
              </div>
            </div>
          </div>

          <!-- WordPress-style Content Editor -->
          <div class="editor-content spasta-card">
            <div v-if="!showPreview" class="editor-wrapper">
              <!-- Rich Text Editor -->
              <q-editor
                v-model="selectedNote.content"
                min-height="600px"
                class="wordpress-editor"
                :toolbar="editorToolbar"
                @update:model-value="debouncedSave"
                :fonts="{
                  arial: 'Arial',
                  arial_black: 'Arial Black',
                  comic_sans: 'Comic Sans MS',
                  courier_new: 'Courier New',
                  impact: 'Impact',
                  lucida_grande: 'Lucida Grande',
                  times_new_roman: 'Times New Roman',
                  verdana: 'Verdana'
                }"
                :font-sizes="{
                  size1: '0.7rem',
                  size2: '0.8rem',
                  size3: '1rem',
                  size4: '1.2rem',
                  size5: '1.5rem',
                  size6: '2rem',
                  size7: '3rem'
                }"
              />
            </div>
            
            <!-- Preview Mode -->
            <div v-else class="preview-wrapper">
              <div class="preview-header q-pa-md">
                <div class="text-h4 spasta-text">{{ selectedNote.title || 'Untitled Note' }}</div>
                <div class="text-caption spasta-text opacity-70 q-mt-sm">
                  Last updated: {{ formatDate(selectedNote.updatedAt) }}
                </div>
              </div>
              <div class="preview-content q-pa-md" v-html="selectedNote.content"></div>
            </div>
          </div>
        </div>
        
        <!-- No Note Selected -->
        <div v-else class="no-note-selected">
          <q-card class="spasta-card full-height">
            <q-card-section class="text-center full-height flex flex-center">
              <div>
                <q-icon name="edit_note" size="xl" class="spasta-text opacity-30 q-mb-md" />
                <div class="text-h6 spasta-text opacity-70">Start Writing</div>
                <div class="text-body2 spasta-text opacity-50 q-mb-lg">
                  Select a note from the sidebar or create a new one to start writing
                </div>
                <q-btn
                  color="white"
                  text-color="grey-8"
                  icon="add"
                  label="Create New Note"
                  @click="createNewNote"
                  class="q-px-lg"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Add Category Dialog -->
    <q-dialog v-model="showCategoryDialog">
      <q-card class="spasta-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add Category</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newCategory.name"
            label="Category name"
            outlined
            dense
            autofocus
            class="spasta-input q-mb-md"
            color="white"
            label-color="white"
            dark
          />
          
          <div class="row q-gutter-md">
            <div class="col">
              <q-select
                v-model="newCategory.icon"
                label="Icon"
                outlined
                dense
                :options="iconOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                class="spasta-input"
                color="white"
                label-color="white"
                dark
              />
            </div>
            <div class="col">
              <q-select
                v-model="newCategory.color"
                label="Color"
                outlined
                dense
                :options="colorOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                class="spasta-input"
                color="white"
                label-color="white"
                dark
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeCategoryDialog" class="spasta-text" />
          <q-btn 
            flat 
            label="Add" 
            color="white" 
            text-color="grey-8"
            @click="addCategory"
            :disable="!newCategory.name.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Tag Dialog -->
    <q-dialog v-model="showTagDialog">
      <q-card class="spasta-card" style="min-width: 300px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add Tags</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newTag"
            label="Tag name"
            outlined
            dense
            autofocus
            class="spasta-input"
            color="white"
            label-color="white"
            dark
            @keyup.enter="addTag"
            placeholder="Enter tag and press Enter"
          />
          
          <div class="text-caption spasta-text opacity-70 q-mt-sm">
            Press Enter to add multiple tags
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Done" @click="showTagDialog = false" class="spasta-text" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Category Menu -->
    <q-menu v-model="categoryMenuVisible" class="spasta-card">
      <q-list style="min-width: 120px">
        <q-item 
          clickable 
          v-close-popup
          @click="editCategory"
          class="spasta-text"
        >
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>Edit</q-item-section>
        </q-item>
        <q-item 
          clickable 
          v-close-popup
          @click="deleteCategory"
          class="text-negative"
        >
          <q-item-section avatar>
            <q-icon name="delete" />
          </q-item-section>
          <q-item-section>Delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { firestoreService } from '../services/firestoreService'
import { useAuthStore } from '../stores/authStore'

interface Note {
  id: string
  title: string
  content: string
  categoryId?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
  createdAt: string
}

const $q = useQuasar()
const authStore = useAuthStore()
const notes = ref<Note[]>([])
const categories = ref<Category[]>([])
const selectedNote = ref<Note | null>(null)
const selectedCategory = ref<string | null>(null)
const searchQuery = ref('')
const showCategoryDialog = ref(false)
const showTagDialog = ref(false)
const categoryMenuVisible = ref(false)
const selectedCategoryForMenu = ref<Category | null>(null)
const newTag = ref('')
const saving = ref(false)
const showPreview = ref(false)

// Debounced save function
let saveTimeout: NodeJS.Timeout | null = null
const debouncedSave = () => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveNote()
  }, 1000) // Save after 1 second of inactivity
}

const newCategory = ref({
  name: '',
  icon: 'folder',
  color: 'primary'
})

// WordPress-style editor toolbar
const editorToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  ['quote', 'unordered', 'ordered'],
  ['link', 'custom_btn'],
  ['print', 'fullscreen'],
  [
    {
      label: $q.lang.editor.formatting,
      icon: $q.iconSet.editor.formatting,
      list: 'no-icons',
      options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
    },
    {
      label: $q.lang.editor.fontSize,
      icon: $q.iconSet.editor.fontSize,
      fixedLabel: true,
      fixedIcon: true,
      list: 'no-icons',
      options: ['size1', 'size2', 'size3', 'size4', 'size5', 'size6', 'size7']
    },
    {
      label: $q.lang.editor.defaultFont,
      icon: $q.iconSet.editor.font,
      fixedIcon: true,
      list: 'no-icons',
      options: ['default_font', 'arial', 'arial_black', 'comic_sans', 'courier_new', 'impact', 'lucida_grande', 'times_new_roman', 'verdana']
    },
    'removeFormat'
  ],
  ['undo', 'redo'],
  ['viewsource']
]

const iconOptions = [
  { label: 'Folder', value: 'folder' },
  { label: 'Work', value: 'work' },
  { label: 'Personal', value: 'person' },
  { label: 'Ideas', value: 'lightbulb' },
  { label: 'Projects', value: 'assignment' },
  { label: 'Research', value: 'science' },
  { label: 'Meeting', value: 'groups' },
  { label: 'Travel', value: 'flight' },
  { label: 'Finance', value: 'account_balance' },
  { label: 'Health', value: 'local_hospital' }
]

const colorOptions = [
  { label: 'Blue', value: 'primary' },
  { label: 'Green', value: 'positive' },
  { label: 'Orange', value: 'warning' },
  { label: 'Red', value: 'negative' },
  { label: 'Purple', value: 'purple' },
  { label: 'Teal', value: 'teal' },
  { label: 'Pink', value: 'pink' },
  { label: 'Indigo', value: 'indigo' }
]

const allNotes = computed(() => notes.value)

const filteredNotes = computed(() => {
  let filtered = notes.value

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter(note => note.categoryId === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(note => 
      note.title.toLowerCase().includes(query) ||
      getPlainTextPreview(note.content).toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
})

const selectedCategoryName = computed(() => {
  if (!selectedCategory.value) return 'All'
  const category = categories.value.find(c => c.id === selectedCategory.value)
  return category?.name || 'Unknown'
})

const categorySelectOptions = computed(() => {
  return [
    { label: 'No Category', value: undefined },
    ...categories.value.map(cat => ({
      label: cat.name,
      value: cat.id
    }))
  ]
})

const getCategoryNoteCount = (categoryId: string) => {
  return notes.value.filter(note => note.categoryId === categoryId).length
}

const getPlainTextPreview = (htmlContent: string) => {
  const div = document.createElement('div')
  div.innerHTML = htmlContent
  const text = div.textContent || div.innerText || ''
  return text.substring(0, 100) + (text.length > 100 ? '...' : '')
}

const loadData = async () => {
  if (!authStore.user?.id) return

  try {
    if (authStore.user.id === 'guest') {
      // Load from localStorage for guest users
      const storedCategories = localStorage.getItem('spasta_note_categories')
      if (storedCategories) {
        categories.value = JSON.parse(storedCategories)
      } else {
        // Add default categories
        categories.value = [
          {
            id: '1',
            name: 'Personal',
            icon: 'person',
            color: 'primary',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Work',
            icon: 'work',
            color: 'positive',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Ideas',
            icon: 'lightbulb',
            color: 'warning',
            createdAt: new Date().toISOString()
          }
        ]
        saveCategories()
      }

      const storedNotes = localStorage.getItem('spasta_notes')
      if (storedNotes) {
        notes.value = JSON.parse(storedNotes)
      } else {
        // Add demo notes
        notes.value = [
          {
            id: '1',
            title: 'Welcome to Spasta Notes',
            content: '<h1>Welcome to Spasta Notes!</h1><p>This is your new <strong>WordPress-style</strong> note editor. You can:</p><ul><li>Format text with <em>rich formatting</em></li><li>Create <u>organized</u> lists</li><li>Add <code>inline code</code></li><li>Insert links and images</li><li>And much more!</li></ul><p>Start writing your ideas here...</p><blockquote><p>💡 <strong>Tip:</strong> Your notes are automatically saved as you type!</p></blockquote>',
            categoryId: '3',
            tags: ['welcome', 'tutorial'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Project Planning Template',
            content: '<h2>Project Overview</h2><p>Brief description of the project goals and objectives.</p><h3>Key Milestones</h3><ol><li><strong>Research Phase</strong> - Complete by end of month</li><li><strong>Design Phase</strong> - UI/UX mockups and wireframes</li><li><strong>Development Phase</strong> - Implementation and coding</li><li><strong>Testing Phase</strong> - QA, bug fixes, and optimization</li><li><strong>Launch Phase</strong> - Deployment and go-live</li></ol><h3>Resources Needed</h3><ul><li>Team members and roles</li><li>Budget allocation</li><li>Tools and software</li><li>Timeline and deadlines</li></ul><p>Remember to <em>document everything</em> for future reference and team collaboration.</p>',
            categoryId: '2',
            tags: ['project', 'planning', 'template'],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]
        saveNotes()
      }
    } else {
      // Load from Firestore for authenticated users
      categories.value = await firestoreService.getNoteCategories(authStore.user.id)
      notes.value = await firestoreService.getNotes(authStore.user.id)
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const saveNotes = () => {
  if (authStore.user?.id === 'guest') {
    localStorage.setItem('spasta_notes', JSON.stringify(notes.value))
  }
}

const saveCategories = () => {
  if (authStore.user?.id === 'guest') {
    localStorage.setItem('spasta_note_categories', JSON.stringify(categories.value))
  }
}

const createNewNote = async () => {
  if (!authStore.user?.id) return

  const newNote: Note = {
    id: Date.now().toString(),
    title: '',
    content: '<p>Start writing your note here...</p>',
    categoryId: selectedCategory.value || undefined,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  try {
    if (authStore.user.id === 'guest') {
      notes.value.unshift(newNote)
      saveNotes()
    } else {
      const savedNote = await firestoreService.addNote(authStore.user.id, newNote)
      if (savedNote) {
        notes.value.unshift(savedNote)
      }
    }
    
    selectedNote.value = newNote
  } catch (error) {
    console.error('Error creating note:', error)
  }
}

const selectNote = (note: Note) => {
  selectedNote.value = note
  showPreview.value = false
}

const selectCategory = (categoryId: string | null) => {
  selectedCategory.value = categoryId
}

const saveNote = async () => {
  if (!selectedNote.value || !authStore.user?.id || saving.value) return

  saving.value = true
  selectedNote.value.updatedAt = new Date().toISOString()
  
  try {
    if (authStore.user.id === 'guest') {
      saveNotes()
    } else {
      await firestoreService.updateNote(selectedNote.value.id, selectedNote.value)
    }
  } catch (error) {
    console.error('Error saving note:', error)
    $q.notify({
      type: 'negative',
      message: 'Error saving note',
      position: 'top-right',
      timeout: 2000
    })
  } finally {
    saving.value = false
  }
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const deleteNote = async (noteId: string) => {
  $q.dialog({
    title: 'Delete Note',
    message: 'Are you sure you want to delete this note?',
    cancel: true,
    persistent: true,
    class: 'spasta-card'
  }).onOk(async () => {
    const index = notes.value.findIndex(note => note.id === noteId)
    if (index !== -1) {
      try {
        if (authStore.user?.id === 'guest') {
          if (selectedNote.value?.id === noteId) {
            selectedNote.value = null
          }
          notes.value.splice(index, 1)
          saveNotes()
        } else {
          const success = await firestoreService.deleteNote(noteId)
          if (success) {
            if (selectedNote.value?.id === noteId) {
              selectedNote.value = null
            }
            notes.value.splice(index, 1)
          }
        }
        
        $q.notify({
          type: 'positive',
          message: 'Note deleted successfully',
          position: 'top-right',
          timeout: 2000
        })
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }
  })
}

const addCategory = async () => {
  if (!newCategory.value.name.trim() || !authStore.user?.id) return

  const category: Category = {
    id: Date.now().toString(),
    name: newCategory.value.name.trim(),
    icon: newCategory.value.icon,
    color: newCategory.value.color,
    createdAt: new Date().toISOString()
  }
  
  try {
    if (authStore.user.id === 'guest') {
      categories.value.push(category)
      saveCategories()
    } else {
      const savedCategory = await firestoreService.addNoteCategory(authStore.user.id, category)
      if (savedCategory) {
        categories.value.push(savedCategory)
      }
    }
    
    closeCategoryDialog()
    
    $q.notify({
      type: 'positive',
      message: `Category "${category.name}" created successfully`,
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    console.error('Error adding category:', error)
  }
}

const closeCategoryDialog = () => {
  showCategoryDialog.value = false
  newCategory.value = {
    name: '',
    icon: 'folder',
    color: 'primary'
  }
}

const showCategoryMenu = (category: Category) => {
  selectedCategoryForMenu.value = category
  categoryMenuVisible.value = true
}

const editCategory = () => {
  $q.notify({
    type: 'info',
    message: 'Category editing coming soon',
    position: 'top-right',
    timeout: 2000
  })
}

const deleteCategory = async () => {
  if (!selectedCategoryForMenu.value || !authStore.user?.id) return
  
  $q.dialog({
    title: 'Delete Category',
    message: 'Are you sure you want to delete this category? Notes in this category will become uncategorized.',
    cancel: true,
    persistent: true,
    class: 'spasta-card'
  }).onOk(async () => {
    const categoryId = selectedCategoryForMenu.value!.id
    
    try {
      // Remove category from notes
      notes.value.forEach(note => {
        if (note.categoryId === categoryId) {
          note.categoryId = undefined
        }
      })
      
      // Remove category
      const index = categories.value.findIndex(c => c.id === categoryId)
      if (index !== -1) {
        if (authStore.user?.id === 'guest') {
          categories.value.splice(index, 1)
          saveCategories()
          saveNotes()
        } else {
          const success = await firestoreService.deleteNoteCategory(categoryId)
          if (success) {
            categories.value.splice(index, 1)
            // Update notes in Firestore
            for (const note of notes.value.filter(n => n.categoryId === categoryId)) {
              await firestoreService.updateNote(note.id, { categoryId: undefined })
            }
          }
        }
        
        // Clear selection if deleted category was selected
        if (selectedCategory.value === categoryId) {
          selectedCategory.value = null
        }
        
        $q.notify({
          type: 'positive',
          message: 'Category deleted successfully',
          position: 'top-right',
          timeout: 2000
        })
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  })
}

const addTag = () => {
  if (newTag.value.trim() && selectedNote.value) {
    const tag = newTag.value.trim().toLowerCase()
    if (!selectedNote.value.tags.includes(tag)) {
      selectedNote.value.tags.push(tag)
      debouncedSave()
    }
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  if (selectedNote.value) {
    const index = selectedNote.value.tags.indexOf(tag)
    if (index !== -1) {
      selectedNote.value.tags.splice(index, 1)
      debouncedSave()
    }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.notes-view {
  height: calc(100vh - 150px);
  width: 100%;
  margin-top: 0;
}

.notes-layout {
  display: flex;
  height: 100%;
  gap: 0;
}

.notes-sidebar {
  width: 320px;
  min-width: 320px;
  border-radius: 0;
  border-right: 2px solid rgba(239, 228, 210, 0.2);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  border-bottom: 1px solid rgba(239, 228, 210, 0.1);
}

.sidebar-content {
  flex: 1;
}

.notes-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  border-radius: 0;
  border-bottom: 2px solid rgba(239, 228, 210, 0.2);
  background: rgba(58, 107, 140, 0.1);
}

.editor-content {
  flex: 1;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  background: rgba(58, 107, 140, 0.05);
}

.editor-wrapper,
.preview-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.no-note-selected {
  flex: 1;
  padding: 24px;
}

.category-item {
  transition: all 0.2s ease;
}

.category-item:hover {
  background: rgba(58, 107, 140, 0.2);
}

.category-item.q-item--active {
  background: rgba(58, 107, 140, 0.3);
  border-left: 4px solid #EFE4D2;
}

.note-item {
  transition: all 0.2s ease;
}

.note-item:hover {
  background: rgba(58, 107, 140, 0.15);
}

.note-item.q-item--active {
  background: rgba(58, 107, 140, 0.25);
  border-left: 3px solid #EFE4D2;
}

/* WordPress-style Editor Styling */
.title-input {
  font-size: 2.5rem;
  font-weight: 600;
  color: #EFE4D2;
}

.title-input :deep(.q-field__native) {
  font-size: 2.5rem;
  font-weight: 600;
  color: #EFE4D2;
  padding: 0;
}

.title-input :deep(.q-field__control) {
  background: transparent;
  border: none;
  box-shadow: none;
}

.category-select {
  min-width: 150px;
}

.editor-actions {
  gap: 12px;
}

.spacing-md {
  gap: 16px;
}

.spacing-sm {
  gap: 8px;
}

/* WordPress Editor Styling */
.wordpress-editor {
  height: 100%;
  background: transparent;
}

.wordpress-editor :deep(.q-editor__content) {
  background-color: rgba(239, 228, 210, 0.05);
  color: #EFE4D2;
  min-height: 600px;
  padding: 40px;
  font-size: 16px;
  line-height: 1.6;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.wordpress-editor :deep(.q-editor__toolbar) {
  background-color: rgba(58, 107, 140, 0.2);
  border-bottom: 1px solid rgba(239, 228, 210, 0.2);
  padding: 12px 20px;
}

.wordpress-editor :deep(.q-btn) {
  color: #EFE4D2;
  border-radius: 4px;
  margin: 0 2px;
}

.wordpress-editor :deep(.q-btn:hover) {
  background-color: rgba(239, 228, 210, 0.2);
}

.wordpress-editor :deep(.q-editor__content h1) {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 1.5rem 0;
  color: #EFE4D2;
}

.wordpress-editor :deep(.q-editor__content h2) {
  font-size: 2rem;
  font-weight: 600;
  margin: 1.25rem 0;
  color: #EFE4D2;
}

.wordpress-editor :deep(.q-editor__content h3) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1rem 0;
  color: #EFE4D2;
}

.wordpress-editor :deep(.q-editor__content p) {
  margin: 1rem 0;
  color: #EFE4D2;
}

.wordpress-editor :deep(.q-editor__content blockquote) {
  border-left: 4px solid #EFE4D2;
  padding-left: 20px;
  margin: 1.5rem 0;
  font-style: italic;
  color: rgba(239, 228, 210, 0.9);
}

.wordpress-editor :deep(.q-editor__content ul),
.wordpress-editor :deep(.q-editor__content ol) {
  margin: 1rem 0;
  padding-left: 2rem;
  color: #EFE4D2;
}

.wordpress-editor :deep(.q-editor__content code) {
  background: rgba(58, 107, 140, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  color: #EFE4D2;
}

/* Preview Mode Styling */
.preview-wrapper {
  background: rgba(239, 228, 210, 0.05);
}

.preview-header {
  border-bottom: 1px solid rgba(239, 228, 210, 0.2);
  background: rgba(58, 107, 140, 0.1);
}

.preview-content {
  flex: 1;
  padding: 40px;
  font-size: 16px;
  line-height: 1.6;
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #EFE4D2;
  overflow-y: auto;
}

.preview-content :deep(h1) {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 1.5rem 0;
  color: #EFE4D2;
}

.preview-content :deep(h2) {
  font-size: 2rem;
  font-weight: 600;
  margin: 1.25rem 0;
  color: #EFE4D2;
}

.preview-content :deep(h3) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1rem 0;
  color: #EFE4D2;
}

.preview-content :deep(p) {
  margin: 1rem 0;
  color: #EFE4D2;
}

.preview-content :deep(blockquote) {
  border-left: 4px solid #EFE4D2;
  padding-left: 20px;
  margin: 1.5rem 0;
  font-style: italic;
  color: rgba(239, 228, 210, 0.9);
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
  color: #EFE4D2;
}

.preview-content :deep(code) {
  background: rgba(58, 107, 140, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  color: #EFE4D2;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .notes-view {
    height: calc(100vh - 200px);
  }
  
  .notes-layout {
    flex-direction: column;
  }
  
  .notes-sidebar {
    width: 100%;
    min-width: auto;
    height: 300px;
    border-right: none;
    border-bottom: 2px solid rgba(239, 228, 210, 0.2);
  }
  
  .notes-editor {
    height: calc(100vh - 500px);
  }
  
  .title-input {
    font-size: 1.8rem;
  }
  
  .title-input :deep(.q-field__native) {
    font-size: 1.8rem;
  }
  
  .editor-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .wordpress-editor :deep(.q-editor__content) {
    padding: 20px;
    font-size: 14px;
  }
  
  .preview-content {
    padding: 20px;
    font-size: 14px;
  }
}
</style>