import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * MAIN APP for Personal Task Organizer (Todo App)
 * - Add, edit, delete tasks
 * - Mark tasks complete/incomplete
 * - Filter (all/active/completed), search
 * - Responsive, minimal, persistent with localStorage
 */

// Color palette from requirements
const COLORS = {
  primary: '#1976d2',
  accent: '#ffb300',
  secondary: '#424242',
};

/**
 * Task structure:
 * { id, text, completed }
 */

// PUBLIC_INTERFACE
function App() {
  // --- State ---
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editInput, setEditInput] = useState('');
  const inputRef = useRef();
  const editInputRef = useRef();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = window.localStorage.getItem('todo_tasks');
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  // Persist to localStorage
  useEffect(() => {
    window.localStorage.setItem('todo_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- Handlers ---

  // PUBLIC_INTERFACE
  function handleAddTask(e) {
    e.preventDefault();
    if (input.trim().length === 0) return;
    setTasks([
      ...tasks,
      { id: Date.now(), text: input.trim(), completed: false }
    ]);
    setInput('');
    inputRef.current && inputRef.current.focus();
  }

  // PUBLIC_INTERFACE
  function handleEditTask(id) {
    setEditingId(id);
    const t = tasks.find(t => t.id === id);
    setEditInput(t ? t.text : '');
    setTimeout(() => editInputRef.current && editInputRef.current.focus(), 100);
  }

  // PUBLIC_INTERFACE
  function handleUpdateTask(e) {
    e.preventDefault();
    if (editInput.trim().length === 0) {
      setEditingId(null);
      setEditInput('');
      return;
    }
    setTasks(tasks.map(t =>
      t.id === editingId ? { ...t, text: editInput.trim() } : t
    ));
    setEditingId(null);
    setEditInput('');
  }

  // PUBLIC_INTERFACE
  function handleDeleteTask(id) {
    setTasks(tasks.filter(t => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditInput('');
    }
  }

  // PUBLIC_INTERFACE
  function handleToggleComplete(id) {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  }

  // PUBLIC_INTERFACE
  function handleFilterChange(newFilter) {
    setFilter(newFilter);
  }

  // PUBLIC_INTERFACE
  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  // Filter and search logic
  function filteredTasks() {
    let list = [...tasks];
    if (filter === 'active') list = list.filter(t => !t.completed);
    if (filter === 'completed') list = list.filter(t => t.completed);
    if (search.trim().length > 0) {
      list = list.filter(t =>
        t.text.toLowerCase().includes(search.trim().toLowerCase())
      );
    }
    return list;
  }

  // Keyboard: Enter for add/edit, Esc for cancel edit
  useEffect(() => {
    if (!editingId) return;
    function handleKey(e) {
      if (e.key === "Escape") {
        setEditingId(null);
        setEditInput('');
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [editingId]);

  // Layout: Header, Main, Footer
  return (
    <div className="App">
      <header className="todo-header">
        <h1 style={{ color: COLORS.primary, letterSpacing: '1px' }}>Personal Task Organizer</h1>
        <p className="subtitle" style={{ color: COLORS.secondary }}>
          Minimal, responsive, private.
        </p>
      </header>

      <main className="todo-main">
        <form className="todo-add-form" onSubmit={handleAddTask}>
          <input
            className="todo-input"
            placeholder="What needs to be done?"
            value={input}
            ref={inputRef}
            maxLength={120}
            autoFocus
            onChange={e => setInput(e.target.value)}
            aria-label="Add a new task"
            autoComplete="off"
            style={{ borderColor: COLORS.accent }}
          />
          <button
            className="todo-btn-add"
            type="submit"
            style={{ background: COLORS.accent, color: '#fff' }}
            aria-label="Add task"
          >
            Add
          </button>
        </form>

        <div className="todo-controls">
          <div className="todo-filters">
            <button
              onClick={() => handleFilterChange('all')}
              className={`todo-filter-btn${filter === 'all' ? ' active' : ''}`}
              style={filter === 'all' ? { color: COLORS.primary } : undefined}
              aria-label="Show all tasks"
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('active')}
              className={`todo-filter-btn${filter === 'active' ? ' active' : ''}`}
              style={filter === 'active' ? { color: COLORS.primary } : undefined}
              aria-label="Show active tasks"
            >
              Active
            </button>
            <button
              onClick={() => handleFilterChange('completed')}
              className={`todo-filter-btn${filter === 'completed' ? ' active' : ''}`}
              style={filter === 'completed' ? { color: COLORS.primary } : undefined}
              aria-label="Show completed tasks"
            >
              Completed
            </button>
          </div>
          <input
            className="todo-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            maxLength={60}
          />
        </div>

        <section>
          {filteredTasks().length === 0 ? (
            <div className="todo-empty" style={{ color: COLORS.secondary, margin: "2em auto" }}>
              <em>No tasks found.</em>
            </div>
          ) : (
            <ul className="todo-list">
              {filteredTasks().map(task => (
                <li
                  key={task.id}
                  className={`todo-item${task.completed ? " completed" : ""}`}
                  style={{
                    borderColor: task.completed ? COLORS.accent : 'var(--border-color)'
                  }}
                >
                  <span
                    className="todo-checkbox"
                    role="checkbox"
                    aria-checked={task.completed}
                    tabIndex={0}
                    onClick={() => handleToggleComplete(task.id)}
                    onKeyPress={e => {
                      if (e.key === ' ' || e.key === 'Enter') handleToggleComplete(task.id);
                    }}
                    style={{
                      borderColor: task.completed ? COLORS.accent : COLORS.primary,
                      color: task.completed ? COLORS.accent : COLORS.primary
                    }}
                  >
                    {task.completed ? '✓' : '○'}
                  </span>
                  {editingId === task.id ? (
                    <form
                      className="todo-edit-form"
                      onSubmit={handleUpdateTask}
                      style={{ flex: 1, display: 'flex', gap: '0.5em', alignItems: 'center' }}
                    >
                      <input
                        ref={editInputRef}
                        className="todo-input-edit"
                        value={editInput}
                        maxLength={120}
                        onChange={e => setEditInput(e.target.value)}
                        aria-label="Edit task"
                        style={{ minWidth: 0, flex: 1 }}
                      />
                      <button
                        className="todo-btn-edit-save"
                        type="submit"
                        style={{
                          background: COLORS.primary,
                          color: '#fff',
                          border: 0,
                          borderRadius: '6px',
                          padding: '5px 13px',
                          marginRight: 0
                        }}
                        aria-label="Save"
                      >
                        Save
                      </button>
                    </form>
                  ) : (
                    <>
                      <span
                        className="todo-task-text"
                        style={{
                          textDecoration: task.completed ? "line-through" : "none",
                          color: task.completed ? COLORS.secondary : COLORS.primary,
                          opacity: task.completed ? 0.7 : 1
                        }}
                      >
                        {task.text}
                      </span>
                      <div className="todo-actions">
                        <button
                          className="todo-btn todo-btn-edit"
                          style={{ color: COLORS.primary }}
                          aria-label="Edit"
                          title="Edit"
                          onClick={() => handleEditTask(task.id)}
                        >
                          ✎
                        </button>
                        <button
                          className="todo-btn todo-btn-delete"
                          style={{ color: COLORS.accent }}
                          aria-label="Delete"
                          title="Delete"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="todo-footer">
        <small style={{ color: COLORS.secondary }}>
          {new Date().getFullYear()} &copy; Made with <b style={{ color: COLORS.accent }}>●</b> by Kavia Minimal Todo
        </small>
      </footer>
    </div>
  );
}

export default App;
