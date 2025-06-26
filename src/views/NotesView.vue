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
              :loading="categoriesLoading"
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
            <!-- Loading Categories -->
            <div v-if="categoriesLoading" class="text-center q-pa-lg">
              <q-spinner-dots size="40px" color="white" />
              <div class="text-body2 spasta-text q-mt-md">Loading categories...</div>
            </div>

            <div v-else>
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

              <!-- Categories List -->
              <div class="categories-section">
                <div class="text-subtitle2 spasta-text q-mb-sm">Categories</div>
                
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
                      :loading="category.deleting"
                    />
                  </q-item-section>
                </q-item>

                <!-- Add Category Button -->
                <q-btn
                  flat
                  icon="add"
                  label="Add Category"
                  @click="showCategoryDialog = true"
                  class="full-width q-mt-sm spasta-text category-add-btn"
                  size="sm"
                  :loading="categoriesLoading"
                />
              </div>

              <q-separator class="q-my-md" />

              <!-- Notes List -->
              <div class="notes-list">
                <div class="text-subtitle2 spasta-text q-mb-sm">
                  {{ selectedCategoryName }} Notes
                </div>
                
                <!-- Loading Notes -->
                <div v-if="notesLoading" class="text-center q-pa-lg">
                  <q-spinner-dots size="30px" color="white" />
                  <div class="text-body2 spasta-text q-mt-sm">Loading notes...</div>
                </div>

                <div v-else>
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
                        :loading="note.deleting"
                      />
                    </q-item-section>
                  </q-item>

                  <div v-if="filteredNotes.length === 0 && !notesLoading" class="text-center q-pa-lg">
                    <q-icon name="note_add" size="xl" class="spasta-text opacity-30 q-mb-md" />
                    <div class="text-body2 spasta-text opacity-70">No notes found</div>
                    <div class="text-caption spasta-text opacity-50">Create your first note</div>
                  </div>

                  <!-- Add Note Button -->
                  <q-btn
                    flat
                    icon="add"
                    label="New Note"
                    @click="createNewNote"
                    class="full-width q-mt-md spasta-text"
                    :loading="creatingNote"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </div>

      <!-- Right Side - Note Editor -->
      <div class="notes-editor">
        <div v-if="selectedNote" class="editor-container">
          <!-- Editor Header -->
          <div class="editor-header spasta-card q-pa-lg">
            <q-input
              v-model="selectedNote.title"
              placeholder="Note title..."
              outlined
              dense
              class="spasta-input q-mb-md"
              color="white"
              label-color="white"
              dark
              @update:model-value="debouncedSaveNote"
              :loading="savingNote"
            />
            
            <div class="row items-center justify-between">
              <div class="row items-center spacing-sm">
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
                  class="spasta-input"
                  color="white"
                  label-color="white"
                  dark
                  @update:model-value="debouncedSaveNote"
                />
                
                <q-btn
                  flat
                  icon="add"
                  label="Tag"
                  size="sm"
                  @click="showTagDialog = true"
                  class="spasta-text"
                />
              </div>
              
              <div class="row items-center spacing-sm">
                <q-spinner-dots v-if="savingNote" size="20px" color="white" />
                <div class="text-caption spasta-text opacity-70">
                  {{ savingNote ? 'Saving...' : `Last saved: ${formatDate(selectedNote.updatedAt)}` }}
                </div>
              </div>
            </div>

            <!-- Tags -->
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

          <!-- Quasar Editor -->
          <div class="editor-content spasta-card">
            <q-editor
              v-model="selectedNote.content"
              min-height="5rem"
              class="spasta-editor"
              :toolbar="[
                ['bold', 'italic', 'underline', 'strike'],
                ['hr', 'link'],
                ['unordered', 'ordered'],
                ['undo', 'redo'],
                ['viewsource']
              ]"
              @update:model-value="debouncedSaveNote"
            />
          </div>
        </div>
        
        <!-- No Note Selected -->
        <div v-else class="no-note-selected">
          <q-card class="spasta-card full-height">
            <q-card-section class="text-center full-height flex flex-center">
              <div>
                <q-icon name="note" size="xl" class="spasta-text opacity-30 q-mb-md" />
                <div class="text-h6 spasta-text opacity-70">Select a note to edit</div>
                <div class="text-body2 spasta-text opacity-50">Choose a note from the list or create a new one</div>
                <q-btn
                  flat
                  icon="add"
                  label="Create New Note"
                  @click="createNewNote"
                  class="q-mt-md spasta-text"
                  :loading="creatingNote"
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
          <div class="text-h6 spasta-text">{{ editingCategory ? 'Edit Category' : 'Add Category' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="categoryForm.name"
            label="Category name"
            outlined
            dense
            autofocus
            class="spasta-input q-mb-md"
            color="white"
            label-color="white"
            dark
            :rules="[val => !!val?.trim() || 'Category name is required']"
          />
          
          <div class="row q-gutter-md">
            <div class="col">
              <q-select
                v-model="categoryForm.icon"
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
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" class="spasta-card">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.value" color="white" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="spasta-text">{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col">
              <q-select
                v-model="categoryForm.color"
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
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" class="spasta-card">
                    <q-item-section avatar>
                      <q-icon name="circle" :color="scope.opt.value" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="spasta-text">{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Category Preview -->
          <div class="category-preview q-mt-md">
            <div class="text-caption spasta-text q-mb-sm">Preview:</div>
            <q-card flat class="spasta-card-light q-pa-md">
              <div class="row items-center">
                <q-icon :name="categoryForm.icon" :color="categoryForm.color" size="md" class="q-mr-sm" />
                <div>
                  <div class="text-body1 spasta-text text-weight-medium">
                    {{ categoryForm.name || 'Category Name' }}
                  </div>
                  <div class="text-caption spasta-text opacity-70">
                    0 notes
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeCategoryDialog" class="spasta-text" />
          <q-btn 
            flat 
            :label="editingCategory ? 'Update' : 'Add'"
            color="white" 
            text-color="grey-8"
            @click="saveCategory"
            :disable="!categoryForm.name?.trim()"
            :loading="savingCategory"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Tag Dialog -->
    <q-dialog v-model="showTagDialog">
      <q-card class="spasta-card" style="min-width: 300px">
        <q-card-section>
          <div class="text-h6 spasta-text">Add Tag</div>
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
            :rules="[val => !!val?.trim() || 'Tag name is required']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showTagDialog = false" class="spasta-text" />
          <q-btn 
            flat 
            label="Add" 
            color="white" 
            text-color="grey-8"
            @click="addTag"
            :disable="!newTag?.trim()"
            :loading="addingTag"
          />
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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
  deleting?: boolean
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
  createdAt: string
  deleting?: boolean
}

const $q = useQuasar()
const authStore = useAuthStore()

// Data
const notes = ref<Note[]>([])
const categories = ref<Category[]>([])
const selectedNote = ref<Note | null>(null)
const selectedCategory = ref<string | null>(null)
const searchQuery = ref('')

// Loading states
const categoriesLoading = ref(false)
const notesLoading = ref(false)
const savingNote = ref(false)
const savingCategory = ref(false)
const creatingNote = ref(false)
const addingTag = ref(false)

// Dialog states
const showCategoryDialog = ref(false)
const showTagDialog = ref(false)
const categoryMenuVisible = ref(false)

// Form data
const editingCategory = ref<Category | null>(null)
const selectedCategoryForMenu = ref<Category | null>(null)
const newTag = ref('')
const categoryForm = ref({
  name: '',
  icon: 'folder',
  color: 'primary'
})

// Debounce timer
let saveTimer: NodeJS.Timeout | null = null

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
  { label: 'Health', value: 'local_hospital' },
  { label: 'Education', value: 'school' },
  { label: 'Shopping', value: 'shopping_cart' },
  { label: 'Entertainment', value: 'movie' },
  { label: 'Food', value: 'restaurant' },
  { label: 'Sports', value: 'sports_soccer' }
]

const colorOptions = [
  { label: 'Blue', value: 'primary' },
  { label: 'Green', value: 'positive' },
  { label: 'Orange', value: 'warning' },
  { label: 'Red', value: 'negative' },
  { label: 'Purple', value: 'purple' },
  { label: 'Teal', value: 'teal' },
  { label: 'Pink', value: 'pink' },
  { label: 'Indigo', value: 'indigo' },
  { label: 'Brown', value: 'brown' },
  { label: 'Grey', value: 'grey' }
]

// Computed properties
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

// Helper functions
const getCategoryNoteCount = (categoryId: string) => {
  return notes.value.filter(note => note.categoryId === categoryId).length
}

const getPlainTextPreview = (htmlContent: string) => {
  const div = document.createElement('div')
  div.innerHTML = htmlContent
  const text = div.textContent || div.innerText || ''
  return text.substring(0, 100) + (text.length > 100 ? '...' : '')
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

// Data loading functions
const loadData = async () => {
  console.log('NotesView: Loading data...')
  if (!authStore.user?.id) {
    console.log('NotesView: No user authenticated')
    return
  }

  try {
    await Promise.all([
      loadCategories(),
      loadNotes()
    ])
  } catch (error) {
    console.error('NotesView: Error loading data:', error)
    $q.notify({
      type: 'negative',
      message: 'Error loading notes data',
      position: 'top-right',
      timeout: 3000
    })
  }
}

const loadCategories = async () => {
  if (!authStore.user?.id) return

  categoriesLoading.value = true
  try {
    console.log('NotesView: Loading categories for user:', authStore.user.id)
    
    if (authStore.user.id === 'guest') {
      // Load from localStorage for guest users
      const storedCategories = localStorage.getItem('spasta_note_categories')
      if (storedCategories) {
        categories.value = JSON.parse(storedCategories)
        console.log('NotesView: Loaded categories from localStorage:', categories.value.length)
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
          },
          {
            id: '4',
            name: 'Projects',
            icon: 'assignment',
            color: 'purple',
            createdAt: new Date().toISOString()
          },
          {
            id: '5',
            name: 'Research',
            icon: 'science',
            color: 'teal',
            createdAt: new Date().toISOString()
          }
        ]
        saveCategories()
        console.log('NotesView: Created default categories')
      }
    } else {
      // Load from Firestore for authenticated users
      categories.value = await firestoreService.getNoteCategories(authStore.user.id)
      console.log('NotesView: Loaded categories from Firestore:', categories.value.length)
    }
  } catch (error) {
    console.error('NotesView: Error loading categories:', error)
    throw error
  } finally {
    categoriesLoading.value = false
  }
}

const loadNotes = async () => {
  if (!authStore.user?.id) return

  notesLoading.value = true
  try {
    console.log('NotesView: Loading notes for user:', authStore.user.id)
    
    if (authStore.user.id === 'guest') {
      const storedNotes = localStorage.getItem('spasta_notes')
      if (storedNotes) {
        notes.value = JSON.parse(storedNotes)
        console.log('NotesView: Loaded notes from localStorage:', notes.value.length)
      } else {
        // Add demo notes
        notes.value = [
          {
            id: '1',
            title: 'Welcome to Spasta Notes',
            content: '<h1>Welcome to Spasta Notes!</h1><p>This is your new <strong>WYSIWYG</strong> note editor. You can:</p><ul><li>Format text with <em>rich formatting</em></li><li>Create <u>organized</u> lists</li><li>Add <code>inline code</code></li><li>And much more!</li></ul><p>Start writing your ideas here...</p>',
            categoryId: '3',
            tags: ['welcome', 'tutorial'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Project Planning',
            content: '<h2>Project Roadmap</h2><p>Key milestones for the upcoming project:</p><ol><li><strong>Research Phase</strong> - Complete by end of month</li><li><strong>Design Phase</strong> - UI/UX mockups</li><li><strong>Development Phase</strong> - Implementation</li><li><strong>Testing Phase</strong> - QA and bug fixes</li></ol><p>Remember to <em>document everything</em> for future reference.</p>',
            categoryId: '2',
            tags: ['project', 'planning', 'roadmap'],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            title: 'Meeting Notes - Team Sync',
            content: '<h3>Weekly Team Sync - January 2025</h3><p><strong>Attendees:</strong> John, Sarah, Mike, Lisa</p><h4>Agenda:</h4><ul><li>Project status updates</li><li>Upcoming deadlines</li><li>Resource allocation</li></ul><h4>Action Items:</h4><ol><li>John to finalize API documentation</li><li>Sarah to review UI designs</li><li>Mike to setup testing environment</li></ol>',
            categoryId: '2',
            tags: ['meeting', 'team', 'sync'],
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]
        saveNotes()
        console.log('NotesView: Created demo notes')
      }
    } else {
      // Load from Firestore for authenticated users
      notes.value = await firestoreService.getNotes(authStore.user.id)
      console.log('NotesView: Loaded notes from Firestore:', notes.value.length)
    }
  } catch (error) {
    console.error('NotesView: Error loading notes:', error)
    throw error
  } finally {
    notesLoading.value = false
  }
}

// Save functions
const saveNotes = () => {
  if (authStore.user?.id === 'guest') {
    localStorage.setItem('spasta_notes', JSON.stringify(notes.value))
    console.log('NotesView: Saved notes to localStorage')
  }
}

const saveCategories = () => {
  if (authStore.user?.id === 'guest') {
    localStorage.setItem('spasta_note_categories', JSON.stringify(categories.value))
    console.log('NotesView: Saved categories to localStorage')
  }
}

// Debounced save function
const debouncedSaveNote = () => {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  
  saveTimer = setTimeout(() => {
    saveNote()
  }, 1000) // Save after 1 second of inactivity
}

const saveNote = async () => {
  if (!selectedNote.value || !authStore.user?.id) return

  savingNote.value = true
  selectedNote.value.updatedAt = new Date().toISOString()
  
  try {
    console.log('NotesView: Saving note:', selectedNote.value.id)
    
    if (authStore.user.id === 'guest') {
      saveNotes()
    } else {
      await firestoreService.updateNote(selectedNote.value.id, selectedNote.value)
    }
    
    console.log('NotesView: Note saved successfully')
  } catch (error) {
    console.error('NotesView: Error saving note:', error)
    $q.notify({
      type: 'negative',
      message: 'Error saving note',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    savingNote.value = false
  }
}

// Note CRUD operations
const createNewNote = async () => {
  if (!authStore.user?.id) return

  creatingNote.value = true
  
  try {
    console.log('NotesView: Creating new note')
    
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '<p>Start writing your note here...</p>',
      categoryId: selectedCategory.value || undefined,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
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
    console.log('NotesView: New note created:', newNote.id)
    
    $q.notify({
      type: 'positive',
      message: 'New note created',
      position: 'top-right',
      timeout: 2000
    })
  } catch (error) {
    console.error('NotesView: Error creating note:', error)
    $q.notify({
      type: 'negative',
      message: 'Error creating note',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    creatingNote.value = false
  }
}

const selectNote = (note: Note) => {
  console.log('NotesView: Selecting note:', note.id)
  selectedNote.value = note
}

const selectCategory = (categoryId: string | null) => {
  console.log('NotesView: Selecting category:', categoryId)
  selectedCategory.value = categoryId
}

const deleteNote = async (noteId: string) => {
  const note = notes.value.find(n => n.id === noteId)
  if (!note) return

  $q.dialog({
    title: 'Delete Note',
    message: `Are you sure you want to delete "${note.title || 'Untitled Note'}"?`,
    cancel: true,
    persistent: true,
    class: 'spasta-card'
  }).onOk(async () => {
    note.deleting = true
    
    try {
      console.log('NotesView: Deleting note:', noteId)
      
      if (authStore.user?.id === 'guest') {
        if (selectedNote.value?.id === noteId) {
          selectedNote.value = null
        }
        const index = notes.value.findIndex(n => n.id === noteId)
        if (index !== -1) {
          notes.value.splice(index, 1)
          saveNotes()
        }
      } else {
        const success = await firestoreService.deleteNote(noteId)
        if (success) {
          if (selectedNote.value?.id === noteId) {
            selectedNote.value = null
          }
          const index = notes.value.findIndex(n => n.id === noteId)
          if (index !== -1) {
            notes.value.splice(index, 1)
          }
        }
      }
      
      console.log('NotesView: Note deleted successfully')
      
      $q.notify({
        type: 'positive',
        message: 'Note deleted successfully',
        position: 'top-right',
        timeout: 2000
      })
    } catch (error) {
      console.error('NotesView: Error deleting note:', error)
      $q.notify({
        type: 'negative',
        message: 'Error deleting note',
        position: 'top-right',
        timeout: 3000
      })
    } finally {
      note.deleting = false
    }
  })
}

// Category CRUD operations
const saveCategory = async () => {
  if (!categoryForm.value.name?.trim() || !authStore.user?.id) return

  savingCategory.value = true
  
  try {
    console.log('NotesView: Saving category:', categoryForm.value.name)
    
    if (editingCategory.value) {
      // Update existing category
      const updatedCategory = {
        ...editingCategory.value,
        name: categoryForm.value.name.trim(),
        icon: categoryForm.value.icon,
        color: categoryForm.value.color
      }
      
      if (authStore.user.id === 'guest') {
        const index = categories.value.findIndex(c => c.id === editingCategory.value!.id)
        if (index !== -1) {
          categories.value[index] = updatedCategory
          saveCategories()
        }
      } else {
        const success = await firestoreService.updateNoteCategory(editingCategory.value.id, updatedCategory)
        if (success) {
          const index = categories.value.findIndex(c => c.id === editingCategory.value!.id)
          if (index !== -1) {
            categories.value[index] = updatedCategory
          }
        }
      }
      
      $q.notify({
        type: 'positive',
        message: `Category "${updatedCategory.name}" updated successfully`,
        position: 'top-right',
        timeout: 2000
      })
    } else {
      // Create new category
      const category: Category = {
        id: Date.now().toString(),
        name: categoryForm.value.name.trim(),
        icon: categoryForm.value.icon,
        color: categoryForm.value.color,
        createdAt: new Date().toISOString()
      }
      
      if (authStore.user.id === 'guest') {
        categories.value.push(category)
        saveCategories()
      } else {
        const savedCategory = await firestoreService.addNoteCategory(authStore.user.id, category)
        if (savedCategory) {
          categories.value.push(savedCategory)
        }
      }
      
      $q.notify({
        type: 'positive',
        message: `Category "${category.name}" created successfully`,
        position: 'top-right',
        timeout: 2000
      })
    }
    
    closeCategoryDialog()
    console.log('NotesView: Category saved successfully')
  } catch (error) {
    console.error('NotesView: Error saving category:', error)
    $q.notify({
      type: 'negative',
      message: 'Error saving category',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    savingCategory.value = false
  }
}

const closeCategoryDialog = () => {
  showCategoryDialog.value = false
  editingCategory.value = null
  categoryForm.value = {
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
  if (!selectedCategoryForMenu.value) return
  
  editingCategory.value = selectedCategoryForMenu.value
  categoryForm.value = {
    name: selectedCategoryForMenu.value.name,
    icon: selectedCategoryForMenu.value.icon,
    color: selectedCategoryForMenu.value.color
  }
  showCategoryDialog.value = true
}

const deleteCategory = async () => {
  if (!selectedCategoryForMenu.value || !authStore.user?.id) return
  
  const category = selectedCategoryForMenu.value
  const noteCount = getCategoryNoteCount(category.id)
  
  $q.dialog({
    title: 'Delete Category',
    message: `Are you sure you want to delete "${category.name}"? ${noteCount > 0 ? `${noteCount} note${noteCount > 1 ? 's' : ''} will become uncategorized.` : ''}`,
    cancel: true,
    persistent: true,
    class: 'spasta-card'
  }).onOk(async () => {
    category.deleting = true
    
    try {
      console.log('NotesView: Deleting category:', category.id)
      
      // Remove category from notes
      notes.value.forEach(note => {
        if (note.categoryId === category.id) {
          note.categoryId = undefined
        }
      })
      
      // Remove category
      const index = categories.value.findIndex(c => c.id === category.id)
      if (index !== -1) {
        if (authStore.user?.id === 'guest') {
          categories.value.splice(index, 1)
          saveCategories()
          saveNotes()
        } else {
          const success = await firestoreService.deleteNoteCategory(category.id)
          if (success) {
            categories.value.splice(index, 1)
            // Update notes in Firestore
            for (const note of notes.value.filter(n => n.categoryId === category.id)) {
              await firestoreService.updateNote(note.id, { categoryId: undefined })
            }
          }
        }
        
        // Clear selection if deleted category was selected
        if (selectedCategory.value === category.id) {
          selectedCategory.value = null
        }
        
        console.log('NotesView: Category deleted successfully')
        
        $q.notify({
          type: 'positive',
          message: 'Category deleted successfully',
          position: 'top-right',
          timeout: 2000
        })
      }
    } catch (error) {
      console.error('NotesView: Error deleting category:', error)
      $q.notify({
        type: 'negative',
        message: 'Error deleting category',
        position: 'top-right',
        timeout: 3000
      })
    } finally {
      category.deleting = false
    }
  })
}

// Tag operations
const addTag = async () => {
  if (!newTag.value?.trim() || !selectedNote.value) return

  addingTag.value = true
  
  try {
    const tag = newTag.value.trim().toLowerCase()
    if (!selectedNote.value.tags.includes(tag)) {
      selectedNote.value.tags.push(tag)
      await saveNote()
      
      $q.notify({
        type: 'positive',
        message: `Tag "${tag}" added`,
        position: 'top-right',
        timeout: 2000
      })
    }
    
    newTag.value = ''
    showTagDialog.value = false
  } catch (error) {
    console.error('NotesView: Error adding tag:', error)
    $q.notify({
      type: 'negative',
      message: 'Error adding tag',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    addingTag.value = false
  }
}

const removeTag = async (tag: string) => {
  if (!selectedNote.value) return
  
  try {
    const index = selectedNote.value.tags.indexOf(tag)
    if (index !== -1) {
      selectedNote.value.tags.splice(index, 1)
      await saveNote()
      
      $q.notify({
        type: 'positive',
        message: `Tag "${tag}" removed`,
        position: 'top-right',
        timeout: 2000
      })
    }
  } catch (error) {
    console.error('NotesView: Error removing tag:', error)
    $q.notify({
      type: 'negative',
      message: 'Error removing tag',
      position: 'top-right',
      timeout: 3000
    })
  }
}

// Lifecycle
onMounted(() => {
  console.log('NotesView mounted')
  loadData()
})

onBeforeUnmount(() => {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
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
  width: 350px;
  min-width: 350px;
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
}

.editor-content {
  flex: 1;
  border-radius: 0;
  display: flex;
  flex-direction: column;
}

.no-note-selected {
  flex: 1;
  padding: 24px;
}

.categories-section {
  margin-bottom: 16px;
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

.category-add-btn {
  border: 1px dashed rgba(239, 228, 210, 0.3);
  border-radius: 8px;
  margin-top: 8px;
}

.category-add-btn:hover {
  border-color: rgba(239, 228, 210, 0.5);
  background: rgba(58, 107, 140, 0.1);
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

.category-preview {
  background: rgba(239, 228, 210, 0.03);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(239, 228, 210, 0.05);
}

/* Quasar Editor Styling */
.spasta-editor :deep(.q-editor__content) {
  background-color: rgba(37, 77, 112, 0.3);
  color: #EFE4D2;
  min-height: 400px;
  padding: 20px;
}

.spasta-editor :deep(.q-editor__toolbar) {
  background-color: rgba(58, 107, 140, 0.3);
  border-bottom: 1px solid rgba(239, 228, 210, 0.2);
}

.spasta-editor :deep(.q-btn) {
  color: #EFE4D2;
}

.spasta-editor :deep(.q-btn:hover) {
  background-color: rgba(239, 228, 210, 0.2);
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
}
</style>