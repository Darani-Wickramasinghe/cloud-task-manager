import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { api } from './api'
import { supabase } from './supabase'
import type { Task, TaskInput, TaskPriority, TaskStatus } from './types'

const emptyForm: TaskInput = {
  title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '',
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authSaving, setAuthSaving] = useState(false)

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState<TaskInput>(emptyForm)
  const [filter, setFilter] = useState<'ALL' | TaskStatus>('ALL')
  const [saving, setSaving] = useState(false)

  // Restore the existing Supabase session and listen for login/logout changes.
  useEffect(() => {
    let active = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (active) {
          setSession(newSession)
          setAuthLoading(false)
        }
      }
    )

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return

      if (error) setAuthError(error.message)
      setSession(data.session)
      setAuthLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')
    setAuthSaving(true)

    try {
      if (authMode === 'REGISTER') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })

        if (error) throw error

        if (data.session) {
          setAuthMessage('Your account has been created successfully.')
        } else {
          setAuthMessage(
            'Registration successful! Please check your email and confirm your account before logging in.'
          )
          setAuthMode('LOGIN')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      }
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'Authentication failed')
    } finally {
      setAuthSaving(false)
    }
  }

  async function logout() {
    setAuthError('')
    const { error } = await supabase.auth.signOut()

    if (error) {
      setAuthError(error.message)
    } else {
      setTasks([])
      setShowForm(false)
      setEditing(null)
      setForm(emptyForm)
    }
  }

  async function refresh() {
    try {
      setError('')
      setTasks(await api.list())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load tasks')
    } finally {
      setLoading(false)
    }
  }

  // Load tasks only after a valid session is available.
  useEffect(() => {
    if (authLoading) return

    if (session) {
      setLoading(true)
      void refresh()
    } else {
      setTasks([])
      setLoading(false)
    }
  }, [session, authLoading])

  const counts = useMemo(() => ({
    total: tasks.length,
    active: tasks.filter(t => t.status !== 'COMPLETED').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  }), [tasks])

  const visibleTasks = useMemo(
    () => tasks.filter(task => filter === 'ALL' || task.status === filter),
    [tasks, filter],
  )

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(task: Task) {
    setEditing(task)
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
    })
    setShowForm(true)
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editing) await api.update(editing.id, form)
      else await api.create(form)

      setShowForm(false)
      setEditing(null)
      setForm(emptyForm)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save task')
    } finally {
      setSaving(false)
    }
  }

  async function completeTask(id: number) {
    try {
      await api.complete(id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not complete task')
    }
  }

  async function deleteTask(id: number) {
    if (!window.confirm('Delete this task?')) return

    try {
      await api.remove(id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete task')
    }
  }

  async function uploadAttachment(id: number, file?: File) {
    if (!file) return

    try {
      await api.upload(id, file)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not upload file')
    }
  }

  // Authentication loading screen.
  if (authLoading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="brand-mark auth-mark">✓</div>
          <h2>CloudTasks</h2>
          <p>Checking your session...</p>
        </div>
      </main>
    )
  }

  // Login and registration screen.
  if (!session) {
    return (
      <main className="auth-page">
        <form className="auth-card" onSubmit={handleAuth}>
          <a className="brand auth-brand" href="/">
            <span className="brand-mark">✓</span>
            <span>Cloud<span className="brand-light">Tasks</span></span>
          </a>

          <p className="eyebrow auth-eyebrow">YOUR CLOUD WORKSPACE</p>

          <h1 className="auth-title">
            {authMode === 'LOGIN' ? 'Welcome back.' : 'Create your account.'}
          </h1>

          <p className="auth-description">
            {authMode === 'LOGIN'
              ? 'Sign in to organize your work and manage your tasks.'
              : 'Create an account to start managing your tasks.'}
          </p>

          {authError && <div className="error-banner">{authError}</div>}
          {authMessage && <div className="success-banner">{authMessage}</div>}

          <label className="auth-label">
            Email address
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete={authMode === 'LOGIN' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </label>

          <button className="primary-button auth-submit" disabled={authSaving}>
            {authSaving
              ? 'Please wait...'
              : authMode === 'LOGIN'
                ? 'Sign in'
                : 'Create account'}
          </button>

          <p className="auth-switch">
            {authMode === 'LOGIN'
              ? "Don't have an account?"
              : 'Already have an account?'}
            {' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')
                setAuthError('')
                setAuthMessage('')
              }}
            >
              {authMode === 'LOGIN' ? 'Create account' : 'Sign in'}
            </button>
          </p>

          <p className="auth-footer">Secure authentication powered by Supabase</p>
        </form>
      </main>
    )
  }

  // Existing CloudTasks workspace.
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">✓</span>
          <span>Cloud<span className="brand-light">Tasks</span></span>
        </a>

        <div className="topbar-right">
          <span className="cloud-dot" />
          <span>{session.user.email}</span>
          <button className="logout-button" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Make space for<br /><span>great work.</span></h1>
          <p className="hero-copy">
            Plan your day, keep priorities clear, and move every task forward.
          </p>
        </div>
        <button className="primary-button hero-button" onClick={openCreate}>
          + New task
        </button>
      </section>

      <section className="stats">
        <div className="stat-card">
          <span className="stat-icon purple">▦</span>
          <div><strong>{counts.total}</strong><small>Total tasks</small></div>
        </div>
        <div className="stat-card">
          <span className="stat-icon blue">◷</span>
          <div><strong>{counts.active}</strong><small>In progress</small></div>
        </div>
        <div className="stat-card">
          <span className="stat-icon green">✓</span>
          <div><strong>{counts.completed}</strong><small>Completed</small></div>
        </div>
      </section>

      <section className="task-section">
        <div className="section-heading">
          <div><p className="eyebrow">OVERVIEW</p><h2>Your tasks</h2></div>
          <div className="filters">
            {(['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map(value => (
              <button
                key={value}
                className={filter === value ? 'filter active' : 'filter'}
                onClick={() => setFilter(value)}
              >
                {value === 'ALL' ? 'All' : value === 'TODO' ? 'To do' : value === 'IN_PROGRESS' ? 'In progress' : 'Completed'}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="empty-state">Loading your tasks...</div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✧</div>
            <h3>{tasks.length === 0 ? 'A fresh start' : 'No tasks in this view'}</h3>
            <p>
              {tasks.length === 0
                ? 'Create your first task and turn an idea into action.'
                : 'Choose another filter or add a new task.'}
            </p>
            {tasks.length === 0 && (
              <button className="primary-button" onClick={openCreate}>
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="task-grid">
            {visibleTasks.map(task => (
              <article
                className={`task-card ${task.status === 'COMPLETED' ? 'is-complete' : ''}`}
                key={task.id}
              >
                <div className="task-card-top">
                  <span className={`priority priority-${task.priority.toLowerCase()}`}>
                    {task.priority.toLowerCase()} priority
                  </span>
                  <button
                    className="icon-button"
                    title="Delete task"
                    onClick={() => void deleteTask(task.id)}
                  >
                    •••
                  </button>
                </div>

                <h3>{task.title}</h3>
                <p className="task-description">
                  {task.description || 'No description added.'}
                </p>

                <div className="task-meta">
                  <span className={`status status-${task.status.toLowerCase()}`}>
                    {task.status === 'TODO'
                      ? 'To do'
                      : task.status === 'IN_PROGRESS'
                        ? 'In progress'
                        : 'Completed'}
                  </span>
                  {task.dueDate && <span className="due-date">Due {task.dueDate}</span>}
                </div>

                {task.attachmentName && (
                  <p className="attachment">↳ {task.attachmentName}</p>
                )}

                <div className="task-actions">
                  <button className="text-button" onClick={() => openEdit(task)}>
                    Edit
                  </button>

                  <label className="text-button upload-label">
                    Attach file
                    <input
                      type="file"
                      onChange={e => {
                        void uploadAttachment(task.id, e.target.files?.[0])
                        e.currentTarget.value = ''
                      }}
                    />
                  </label>

                  {task.status !== 'COMPLETED' && (
                    <button
                      className="complete-button"
                      onClick={() => void completeTask(task.id)}
                    >
                      ✓ Complete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        <span>CloudTasks</span>
        <span>Simple planning. Clear progress.</span>
      </footer>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShowForm(false)
          }}
        >
          <form className="task-form" onSubmit={saveTask}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">{editing ? 'UPDATE DETAILS' : 'NEW ITEM'}</p>
                <h2>{editing ? 'Edit task' : 'Create a task'}</h2>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <label>
              Task title
              <input
                required
                maxLength={120}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="What needs to get done?"
              />
            </label>

            <label>
              Description
              <textarea
                rows={3}
                maxLength={1000}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Add a few details..."
              />
            </label>

            <div className="form-row">
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={e => setForm({
                    ...form,
                    priority: e.target.value as TaskPriority,
                  })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={e => setForm({
                    ...form,
                    status: e.target.value as TaskStatus,
                  })}
                >
                  <option value="TODO">To do</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </label>
            </div>

            <label>
              Due date
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button className="primary-button" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Create task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}

export default App
