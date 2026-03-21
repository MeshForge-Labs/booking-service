const { pool } = require('./db');
const logger = require('../utils/logger');

const TABLE = 'bookings';

async function create(client, { id, userId, eventId, quantity, status }) {
  const query = `
    INSERT INTO ${TABLE} (id, user_id, event_id, quantity, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, user_id AS "userId", event_id AS "eventId", quantity, status, created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  const result = await client.query(query, [id, userId, eventId, quantity, status || 'CONFIRMED']);
  return result.rows[0];
}

async function findById(client, id) {
  const query = `
    SELECT id, user_id AS "userId", event_id AS "eventId", quantity, status, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM ${TABLE}
    WHERE id = $1
  `;
  const result = await client.query(query, [id]);
  return result.rows[0] || null;
}

async function findByUserId(client, userId) {
  const query = `
    SELECT id, user_id AS "userId", event_id AS "eventId", quantity, status, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM ${TABLE}
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  const result = await client.query(query, [userId]);
  return result.rows;
}

async function updateStatus(client, id, status) {
  const query = `
    UPDATE ${TABLE}
    SET status = $2, updated_at = NOW()
    WHERE id = $1
    RETURNING id, user_id AS "userId", event_id AS "eventId", quantity, status, created_at AS "createdAt", updated_at AS "updatedAt"
  `;
  const result = await client.query(query, [id, status]);
  return result.rows[0] || null;
}

async function getPool() {
  return pool;
}

module.exports = {
  create,
  findById,
  findByUserId,
  updateStatus,
  getPool,
};
