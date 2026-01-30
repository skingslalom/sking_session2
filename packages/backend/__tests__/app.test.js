const request = require('supertest');
const { app, db } = require('../src/app');

describe('Task API', () => {
  beforeEach(() => {
    // Clear the database before each test
    db.exec('DELETE FROM items');
  });

  afterAll(() => {
    // Close the database connection
    db.close();
  });

  describe('GET /api/items', () => {
    it('should return an empty array when no items exist', async () => {
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return items sorted by due date then creation date', async () => {
      // Create test items
      const insertStmt = db.prepare(`
        INSERT INTO items (name, due_date, created_at) 
        VALUES (?, ?, datetime('now', '-' || ? || ' minutes'))
      `);

      insertStmt.run('Task without due date', null, 5);
      insertStmt.run('Task due tomorrow', '2026-02-01', 10);
      insertStmt.run('Task due today', '2026-01-30', 15);

      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0].name).toBe('Task due today');
      expect(response.body[1].name).toBe('Task due tomorrow');
      expect(response.body[2].name).toBe('Task without due date');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new task with name only', async () => {
      const taskData = { name: 'Test Task' };

      const response = await request(app)
        .post('/api/items')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: 'Test Task',
        status: 'pending',
        priority: 0,
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('created_at');
    });

    it('should create a new task with all fields', async () => {
      const taskData = {
        name: 'Test Task with Due Date',
        due_date: '2026-02-01T10:00:00.000Z',
        status: 'in-progress',
        priority: 2
      };

      const response = await request(app)
        .post('/api/items')
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(taskData);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 for empty task name', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 for invalid due date', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ 
          name: 'Test Task',
          due_date: 'invalid-date'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid due date format');
    });
  });

  describe('PUT /api/items/:id', () => {
    let taskId;

    beforeEach(async () => {
      // Create a test task
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Test Task' });
      taskId = response.body.id;
    });

    it('should update task name', async () => {
      const response = await request(app)
        .put(`/api/items/${taskId}`)
        .send({ name: 'Updated Task Name' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Task Name');
      expect(response.body.id).toBe(taskId);
    });

    it('should update multiple fields', async () => {
      const updateData = {
        name: 'Updated Task',
        due_date: '2026-02-01T10:00:00.000Z',
        status: 'completed',
        priority: 1
      };

      const response = await request(app)
        .put(`/api/items/${taskId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updateData);
      expect(response.body.updated_at).toBeTruthy();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/items/999999')
        .send({ name: 'Updated Task' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 for empty name update', async () => {
      const response = await request(app)
        .put(`/api/items/${taskId}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Item name cannot be empty');
    });
  });

  describe('DELETE /api/items/:id', () => {
    let taskId;

    beforeEach(async () => {
      // Create a test task
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Test Task' });
      taskId = response.body.id;
    });

    it('should delete an existing task', async () => {
      const response = await request(app)
        .delete(`/api/items/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item deleted successfully');

      // Verify task is deleted
      const getResponse = await request(app).get('/api/items');
      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/items/999999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Item not found');
    });

    it('should return 400 for invalid task ID', async () => {
      const response = await request(app)
        .delete('/api/items/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Valid item ID is required');
    });
  });
});