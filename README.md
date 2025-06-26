# Spasta - Task Management Dashboard

A comprehensive task management and productivity dashboard built with Vue 3, TypeScript, and Quasar Framework.

## Features

### 🎯 **Task Management**
- **Project Boards** - Create custom workflow boards with drag-and-drop functionality
- **Task Organization** - Categorize tasks with custom statuses, priorities, and tags
- **Subtasks** - Break down complex tasks into manageable subtasks
- **Due Dates** - Set deadlines and track overdue tasks
- **Assignees** - Assign tasks to team members with profile photos

### 📅 **Calendar Integration**
- **Multiple Views** - Month, week, and day calendar views
- **Event Management** - Create and edit calendar events
- **Task Scheduling** - Schedule tasks with start/end times
- **Recurring Events** - Set up repeating tasks and events

### 📝 **Notes System**
- **WYSIWYG Editor** - Rich text editing with formatting options
- **Category Organization** - Organize notes into custom categories
- **Tag System** - Tag notes for easy searching and filtering
- **Search Functionality** - Find notes quickly by title, content, or tags

### 💰 **Finance Tracking**
- **Expense Management** - Track income and expenses by category
- **Goal Setting** - Set and track financial goals with milestones
- **Budget Monitoring** - Monitor spending against budgets
- **Statistics Dashboard** - Visual insights into your finances

### 🔄 **Code Backup System**
- **GitHub Integration** - Connect your GitHub account via OAuth
- **Repository Management** - View and manage all your repositories
- **Automated Backups** - Schedule automatic repository backups
- **Download Options** - Download repositories as ZIP files
- **Backup History** - Track backup status and history

### 🎨 **Design & UX**
- **Glass-morphism UI** - Modern, translucent design elements
- **Dark Theme** - Eye-friendly dark color scheme
- **Responsive Design** - Works perfectly on desktop and mobile
- **Smooth Animations** - Polished micro-interactions and transitions
- **Accessibility** - WCAG compliant design patterns

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **UI Framework**: Quasar Framework
- **State Management**: Pinia
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth + GitHub OAuth
- **Styling**: SASS + CSS3 with custom glass-morphism theme
- **Icons**: Material Design Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- GitHub OAuth App (for backup features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spasta
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your configuration:
   - Firebase project credentials
   - GitHub OAuth app credentials

4. **Start development server**
   ```bash
   npm run dev
   ```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication with Google provider
4. Copy your Firebase config to `.env`

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App with:
   - **Application name**: Spasta
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
3. Copy Client ID and Client Secret to `.env`

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
├── stores/             # Pinia state management
├── services/           # API and external service integrations
├── types/              # TypeScript type definitions
├── router/             # Vue Router configuration
└── firebase/           # Firebase configuration
```

## Key Components

### Task Management
- `CategoryBoard.vue` - Main task board with drag-and-drop
- `TaskCard.vue` - Individual task display
- `TaskDrawer.vue` - Task creation/editing form

### Calendar
- `CalendarView.vue` - Full calendar implementation
- Supports month/week/day views with event management

### Notes
- `NotesView.vue` - Complete notes system with WYSIWYG editor
- Category-based organization with search

### Finance
- `ExpensesView.vue` - Expense tracking and categorization
- `GoalsView.vue` - Financial goal setting and progress tracking

### Backup
- `BackupView.vue` - GitHub repository management and backup
- `githubService.ts` - GitHub API integration

## Authentication

The app supports multiple authentication methods:

1. **Google OAuth** - Primary authentication via Firebase
2. **Guest Mode** - Local storage for demo/testing
3. **GitHub OAuth** - For repository access (backup features)

## Data Storage

- **Authenticated Users**: Data stored in Firebase Firestore
- **Guest Users**: Data stored in browser localStorage
- **Backup Data**: Repository metadata and backup history

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Quasar Framework** - For the excellent Vue.js framework
- **Firebase** - For backend services and authentication
- **GitHub API** - For repository management features
- **Material Design Icons** - For the beautiful icon set
- **Vue.js Community** - For the amazing ecosystem

---

Built with ❤️ using Vue 3 and modern web technologies.