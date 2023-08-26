const express = require('express');
const cors = require('cors'); // Import the cors package
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors()); // Use the cors middleware

// Connect to the SQLite database
const db = new sqlite3.Database('tasks.db');

// Create the tasks table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0
    )
  `);
});

// Create a new task
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    'INSERT INTO tasks (title, description) VALUES (?, ?)',
    [title, description],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create task' });
      }
      res.json({ id: this.lastID, title, description, completed: 0 });
    }
  );
});

// Get all tasks
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(tasks);
  });
});

// Update a task
app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, description, completed } = req.body;

  db.run(
    'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?',
    [title, description, completed, taskId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update task' });
      }
      res.json({ id: taskId, title, description, completed });
    }
  );
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;

  db.run('DELETE FROM tasks WHERE id = ?', taskId, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete task' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
