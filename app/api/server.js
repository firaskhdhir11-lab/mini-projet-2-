
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'tasksdb',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD,
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (error) {
    console.error('Database readiness check failed:', error.message);
    res.status(503).json({ status: 'not ready' });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, completed, created_at FROM tasks ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GET /api/tasks failed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed, created_at',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('POST /api/tasks failed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { title, completed } = req.body;

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  if (title === undefined && completed === undefined) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'Invalid title' });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be boolean' });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           completed = COALESCE($2, completed)
       WHERE id = $3
       RETURNING id, title, completed, created_at`,
      [title === undefined ? null : title.trim(), completed ?? null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('PATCH /api/tasks/:id failed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('DELETE /api/tasks/:id failed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`);
});

