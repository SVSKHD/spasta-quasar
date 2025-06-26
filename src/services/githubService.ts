import { ref } from 'vue'

export interface GitHubUser {
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
  public_repos: number
  private_repos: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  html_url: string
  clone_url: string
  ssh_url: string
  size: number
  language: string
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  default_branch: string
  created_at: string
  updated_at: string
  pushed_at: string
  archived: boolean
  disabled: boolean
  visibility: 'public' | 'private'
}

export interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  author: {
    login: string
    avatar_url: string
  }
  html_url: string
}

class GitHubService {
  private clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'your_github_client_id'
  private clientSecret = import.meta.env.VITE_GITHUB_CLIENT_SECRET || 'your_github_client_secret'
  private redirectUri = `${window.location.origin}/auth/github/callback`
  private accessToken = ref<string | null>(null)
  private user = ref<GitHubUser | null>(null)

  constructor() {
    // Load stored access token
    const storedToken = localStorage.getItem('github_access_token')
    if (storedToken) {
      this.accessToken.value = storedToken
      this.loadUser()
    }
  }

  // OAuth Flow
  initiateOAuth(): void {
    const scope = 'repo,user:email,read:org'
    const state = this.generateRandomState()
    localStorage.setItem('github_oauth_state', state)
    
    const authUrl = new URL('https://github.com/login/oauth/authorize')
    authUrl.searchParams.set('client_id', this.clientId)
    authUrl.searchParams.set('redirect_uri', this.redirectUri)
    authUrl.searchParams.set('scope', scope)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('allow_signup', 'true')
    
    window.location.href = authUrl.toString()
  }

  // Handle OAuth callback
  async handleOAuthCallback(code: string, state: string): Promise<boolean> {
    try {
      const storedState = localStorage.getItem('github_oauth_state')
      if (state !== storedState) {
        throw new Error('Invalid OAuth state')
      }

      // Exchange code for access token
      const tokenResponse = await this.exchangeCodeForToken(code)
      
      if (tokenResponse.access_token) {
        this.accessToken.value = tokenResponse.access_token
        localStorage.setItem('github_access_token', tokenResponse.access_token)
        localStorage.removeItem('github_oauth_state')
        
        await this.loadUser()
        return true
      }
      
      return false
    } catch (error) {
      console.error('OAuth callback error:', error)
      return false
    }
  }

  // Exchange authorization code for access token
  private async exchangeCodeForToken(code: string): Promise<any> {
    // In a real application, this should be done on your backend server
    // to keep the client secret secure. For demo purposes, we'll simulate this.
    
    // This is a mock implementation - in production, call your backend API
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    return response.json()
  }

  // Load user information
  private async loadUser(): Promise<void> {
    if (!this.accessToken.value) return

    try {
      const response = await this.makeAuthenticatedRequest('/user')
      this.user.value = response
    } catch (error) {
      console.error('Failed to load user:', error)
      this.logout()
    }
  }

  // Get current user
  getUser(): GitHubUser | null {
    return this.user.value
  }

  // Check if connected
  isConnected(): boolean {
    return !!this.accessToken.value && !!this.user.value
  }

  // Get user repositories
  async getRepositories(options: {
    type?: 'all' | 'owner' | 'public' | 'private' | 'member'
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  } = {}): Promise<GitHubRepository[]> {
    if (!this.accessToken.value) {
      throw new Error('Not authenticated')
    }

    const params = new URLSearchParams({
      type: options.type || 'owner',
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
      per_page: (options.per_page || 100).toString(),
      page: (options.page || 1).toString(),
    })

    try {
      const repositories = await this.makeAuthenticatedRequest(`/user/repos?${params}`)
      return repositories
    } catch (error) {
      console.error('Failed to fetch repositories:', error)
      return []
    }
  }

  // Get repository details
  async getRepository(owner: string, repo: string): Promise<GitHubRepository | null> {
    if (!this.accessToken.value) {
      throw new Error('Not authenticated')
    }

    try {
      const repository = await this.makeAuthenticatedRequest(`/repos/${owner}/${repo}`)
      return repository
    } catch (error) {
      console.error('Failed to fetch repository:', error)
      return null
    }
  }

  // Get repository commits
  async getRepositoryCommits(owner: string, repo: string, options: {
    sha?: string
    path?: string
    author?: string
    since?: string
    until?: string
    per_page?: number
    page?: number
  } = {}): Promise<GitHubCommit[]> {
    if (!this.accessToken.value) {
      throw new Error('Not authenticated')
    }

    const params = new URLSearchParams()
    if (options.sha) params.set('sha', options.sha)
    if (options.path) params.set('path', options.path)
    if (options.author) params.set('author', options.author)
    if (options.since) params.set('since', options.since)
    if (options.until) params.set('until', options.until)
    params.set('per_page', (options.per_page || 30).toString())
    params.set('page', (options.page || 1).toString())

    try {
      const commits = await this.makeAuthenticatedRequest(`/repos/${owner}/${repo}/commits?${params}`)
      return commits
    } catch (error) {
      console.error('Failed to fetch commits:', error)
      return []
    }
  }

  // Get repository content
  async getRepositoryContent(owner: string, repo: string, path: string = ''): Promise<any> {
    if (!this.accessToken.value) {
      throw new Error('Not authenticated')
    }

    try {
      const content = await this.makeAuthenticatedRequest(`/repos/${owner}/${repo}/contents/${path}`)
      return content
    } catch (error) {
      console.error('Failed to fetch repository content:', error)
      return null
    }
  }

  // Download repository as ZIP
  async downloadRepository(owner: string, repo: string, ref: string = 'main'): Promise<Blob | null> {
    if (!this.accessToken.value) {
      throw new Error('Not authenticated')
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/zipball/${ref}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken.value}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to download repository')
      }

      return response.blob()
    } catch (error) {
      console.error('Failed to download repository:', error)
      return null
    }
  }

  // Create a repository backup
  async createBackup(repository: GitHubRepository): Promise<{
    success: boolean
    backupId?: string
    error?: string
  }> {
    try {
      // Download repository
      const [owner, repo] = repository.full_name.split('/')
      const zipBlob = await this.downloadRepository(owner, repo, repository.default_branch)
      
      if (!zipBlob) {
        throw new Error('Failed to download repository')
      }

      // Create backup metadata
      const backupId = `backup_${repository.id}_${Date.now()}`
      const backupData = {
        id: backupId,
        repository: repository,
        createdAt: new Date().toISOString(),
        size: zipBlob.size,
        format: 'zip'
      }

      // Store backup metadata (in real app, this would go to your backend)
      const existingBackups = JSON.parse(localStorage.getItem('github_backups') || '[]')
      existingBackups.push(backupData)
      localStorage.setItem('github_backups', JSON.stringify(existingBackups))

      // In a real application, you would upload the zipBlob to your storage service
      // For demo purposes, we'll just store the backup metadata
      
      return {
        success: true,
        backupId: backupId
      }
    } catch (error) {
      console.error('Backup creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Get backup history
  getBackupHistory(): any[] {
    return JSON.parse(localStorage.getItem('github_backups') || '[]')
  }

  // Make authenticated request to GitHub API
  private async makeAuthenticatedRequest(endpoint: string): Promise<any> {
    if (!this.accessToken.value) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`https://api.github.com${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken.value}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        this.logout()
        throw new Error('Authentication expired')
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    return response.json()
  }

  // Generate random state for OAuth
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  // Logout
  logout(): void {
    this.accessToken.value = null
    this.user.value = null
    localStorage.removeItem('github_access_token')
    localStorage.removeItem('github_oauth_state')
  }

  // Get rate limit status
  async getRateLimit(): Promise<any> {
    if (!this.accessToken.value) {
      throw new Error('Not authenticated')
    }

    try {
      return await this.makeAuthenticatedRequest('/rate_limit')
    } catch (error) {
      console.error('Failed to get rate limit:', error)
      return null
    }
  }
}

export const githubService = new GitHubService()