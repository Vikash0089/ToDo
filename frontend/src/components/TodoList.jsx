import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState({ title: '', description: '' });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ title: '', description: '', completed: false });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();
    const { user, token, logout, isAdmin } = useAuth();

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const response = await api.get('/todos');
            setTodos(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch todos');
            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTodo.title.trim()) return;

        try {
            const response = await api.post('/todos', newTodo);
            setTodos([response.data, ...todos]);
            setNewTodo({ title: '', description: '' });
            setSuccess('Todo created successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setError('');
        } catch (err) {
            setError('Failed to create todo');
        }
    };

    const handleUpdate = async (id) => {
        try {
            const response = await api.put(`/todos/${id}`, editData);
            setTodos(todos.map(todo => todo._id === id ? response.data : todo));
            setEditingId(null);
            setSuccess('Todo updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update todo');
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) {
            setError('Only admins can delete todos');
            return;
        }

        if (window.confirm('Are you sure you want to delete this todo?')) {
            try {
                await api.delete(`/todos/${id}`);
                setTodos(todos.filter(todo => todo._id !== id));
                setSuccess('Todo deleted successfully!');
                setTimeout(() => setSuccess(''), 3000);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete todo');
            }
        }
    };

    const startEdit = (todo) => {
        setEditingId(todo._id);
        setEditData({
            title: todo.title,
            description: todo.description || '',
            completed: todo.completed
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({ title: '', description: '', completed: false });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStats = () => {
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const pending = total - completed;
        return { total, completed, pending };
    };

    const stats = getStats();

    if (loading) return (
        <div className="container">
            <div className="loading">Loading your todos</div>
        </div>
    );

    return (
        <div className="container">
            <div className="header">
                <h1>📝 Todo List</h1>
                <div className="user-info">
                    <span>👋 Welcome, <strong>{user?.username}</strong></span>
                    <span className={`role-badge ${isAdmin ? 'admin' : ''}`}>
                        {user?.role}
                    </span>
                    <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
                </div>
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <div className="stats">
                <div className="stat-card">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Tasks</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.completed}</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.pending}</div>
                    <div className="stat-label">Pending</div>
                </div>
            </div>

            <form onSubmit={handleCreate} className="todo-form">
                <input
                    type="text"
                    placeholder="What needs to be done? 📌"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Add some details (optional) 📝"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                />
                <button type="submit">➕ Add Todo</button>
            </form>

            <div className="todo-list">
                {todos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                        🎉 No todos yet! Create your first todo above.
                    </div>
                ) : (
                    todos.map(todo => (
                        <div key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                            {editingId === todo._id ? (
                                <>
                                    <div className="todo-header">
                                        <input
                                            type="text"
                                            value={editData.title}
                                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                            className="todo-title"
                                        />
                                    </div>
                                    <div className="todo-description">
                                        <textarea
                                            value={editData.description}
                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                            placeholder="Description"
                                        />
                                    </div>
                                    <div className="todo-meta">
                                        <label className="complete-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={editData.completed}
                                                onChange={(e) => setEditData({ ...editData, completed: e.target.checked })}
                                            />
                                            <span>Mark as completed</span>
                                        </label>
                                        <div className="todo-actions">
                                            <button onClick={() => handleUpdate(todo._id)} className="save-btn">💾 Save</button>
                                            <button onClick={cancelEdit} className="cancel-btn">❌ Cancel</button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="todo-header">
                                        <h3 className="todo-title">
                                            {todo.completed ? '✅ ' : '📌 '}{todo.title}
                                        </h3>
                                        <div className="todo-actions">
                                            <button onClick={() => startEdit(todo)} className="edit-btn">✏️ Edit</button>
                                            {isAdmin && (
                                                <button onClick={() => handleDelete(todo._id)} className="delete-btn">🗑️ Delete</button>
                                            )}
                                        </div>
                                    </div>
                                    {todo.description && (
                                        <div className="todo-description">{todo.description}</div>
                                    )}
                                    <div className="todo-meta">
                                        <span>Status: {todo.completed ? '✅ Completed' : '⏳ Pending'}</span>
                                        <span>📅 Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {isAdmin && todo.user && (
                                        <div className="user-email">
                                            👤 Created by: {todo.user.username} ({todo.user.email})
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TodoList;