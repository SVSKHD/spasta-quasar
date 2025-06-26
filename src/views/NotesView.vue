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
              />
            </div>

            <q-separator class="q-my-md" />

            <!-- Notes List -->
            <div class="notes-list">
              <div class="text-subtitle2 spasta-text q-mb-sm">
                {{ selectedCategoryName }} Notes
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

              <!-- Add Note Button -->
              <q-btn
                flat
                icon="add"
                label="New Note"
                @click="createNewNote"
                class="full-width q-mt-md spasta-text"
              />
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
              @update:model-value="saveNote"
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
                  @update:model-value="saveNote"
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
              
              <div class="text-caption spasta-text opacity-70">
                Last saved: {{ formatDate(selectedNote.updatedAt) }}
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
              @update:model-value="saveNote"
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
            :disable="!newTag.trim()"
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

const newCategory = ref({
  name: '',
  icon: 'folder',
  color: 'primary'
})

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
}

const selectCategory = (categoryId: string | null) => {
  selectedCategory.value = categoryId
}

const saveNote = async () => {
  if (!selectedNote.value || !authStore.user?.id) return

  selectedNote.value.updatedAt = new Date().toISOString()
  
  try {
    if (authStore.user.id === 'guest') {
      saveNotes()
    } else {
      await firestoreService.updateNote(selectedNote.value.id, selectedNote.value)
    }
  } catch (error) {
    console.error('Error saving note:', error)
  }
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
      saveNote()
    }
    newTag.value = ''
    showTagDialog.value = false
  }
}

const removeTag = (tag: string) => {
  if (selectedNote.value) {
    const index = selectedNote.value.tags.indexOf(tag)
    if (index !== -1) {
      selectedNote.value.tags.splice(index, 1)
      saveNote()
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
  console.log('NotesView mounted')
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