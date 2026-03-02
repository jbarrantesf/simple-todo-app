const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory "database" for simplicity. In a real app, this would be a database.
let todos = [];
let nextId = 1;

// Helper for sending validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// GET all todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// GET a single todo by ID
app.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === parseInt(id));

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  res.json(todo);
});

// POST a new todo
app.post(
  '/todos',
  [
    body('title')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Title is required')
      .escape(),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  ],
  handleValidationErrors,
  (req, res) => {
    const { title, completed = false } = req.body; // Default to false if not provided

    const newTodo = {
      id: nextId++,
      title,
      completed,
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
  }
);

// PUT (update) an existing todo
app.put(
  '/todos/:id',
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Title cannot be empty')
      .escape(),
    body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  ],
  handleValidationErrors,
  (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;

    const todoIndex = todos.findIndex(t => t.id === parseInt(id));

    if (todoIndex === -1) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Only update provided fields
    if (title !== undefined) {
      todos[todoIndex].title = title;
    }
    if (completed !== undefined) {
      todos[todoIndex].completed = completed;
    }

    res.json(todos[todoIndex]);
  }
);

// DELETE a todo
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = todos.length;
  todos = todos.filter(t => t.id !== parseInt(id));

  if (todos.length === initialLength) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  res.status(204).send(); // No content to send back for a successful delete
});

// Catch-all for non-existent routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});