const express = require('express');
const Todo = require('../models/Todo');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all todos for authenticated user (admin gets all)
router.get('/', auth, async (req, res) => {
    try {
        let todos;
        if (req.userRole === 'admin') {
            todos = await Todo.find().populate('user', 'username email');
        } else {
            todos = await Todo.find({ user: req.userId });
        }
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new todo (user and admin)
router.post('/', auth, async (req, res) => {
    try {
        const { title, description } = req.body;
        const todo = new Todo({
            title,
            description,
            user: req.userId
        });
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update todo (user can update their own, admin can update any)
router.put('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Check authorization
        if (req.userRole !== 'admin' && todo.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'You can only edit your own todos' });
        }

        const { title, description, completed } = req.body;
        todo.title = title || todo.title;
        todo.description = description || todo.description;
        todo.completed = completed !== undefined ? completed : todo.completed;

        await todo.save();
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete todo (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        await todo.deleteOne();
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;