const crypto = require('crypto');

const cloudantUrl = process.env.CLOUDANT_URL;
const usersDb = process.env.CLOUDANT_USERS_DB || 'users';
const conversationsDb = process.env.CLOUDANT_CONVERSATIONS_DB || 'conversations';

function getCloudantConfig() {
  if (!cloudantUrl) {
    throw new Error('Missing required environment variable: CLOUDANT_URL');
  }

  const url = new URL(cloudantUrl);
  const username = decodeURIComponent(url.username || '');
  const password = decodeURIComponent(url.password || '');
  url.username = '';
  url.password = '';

  return {
    baseUrl: url,
    authHeader: username || password
      ? `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
      : null,
  };
}

function buildUrl(pathname, searchParams) {
  const { baseUrl } = getCloudantConfig();
  const url = new URL(pathname, baseUrl);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url;
}

async function cloudantRequest(pathname, options = {}) {
  const {
    body,
    expectedStatus = [200],
    searchParams,
    ...fetchOptions
  } = options;

  const response = await fetch(buildUrl(pathname, searchParams), {
    ...fetchOptions,
    headers: {
      Accept: 'application/json',
      ...(getCloudantConfig().authHeader ? { Authorization: getCloudantConfig().authHeader } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(fetchOptions.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  const allowedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];

  if (!allowedStatuses.includes(response.status)) {
    const message = data?.reason || data?.error || data?.message || `Cloudant request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

function createDocumentId(prefix) {
  return `${prefix}:${crypto.randomUUID()}`;
}

function normalizeMessage(message) {
  return {
    _id: message._id || message.id || createDocumentId('message'),
    role: message.role,
    content: message.content,
    model: message.model || null,
    provider: message.provider || null,
    usage: message.usage || null,
    createdAt: message.createdAt || new Date().toISOString(),
  };
}

function normalizeConversationDocument(document) {
  return {
    _id: document._id,
    _rev: document._rev,
    userId: document.userId,
    title: document.title || 'New chat',
    settings: {
      systemPrompt: document.settings?.systemPrompt
        || 'You are NexusAI, a modern AI assistant. Be helpful, accurate, practical, and concise. Use markdown when it improves readability.',
      temperature: typeof document.settings?.temperature === 'number'
        ? document.settings.temperature
        : 0.7,
    },
    messages: Array.isArray(document.messages) ? document.messages.map(normalizeMessage) : [],
    createdAt: document.createdAt || new Date().toISOString(),
    updatedAt: document.updatedAt || document.createdAt || new Date().toISOString(),
  };
}

function normalizeUserDocument(document) {
  return {
    _id: document._id,
    username: document.username,
    email: document.email,
    password: document.password,
    createdAt: document.createdAt || new Date().toISOString(),
    updatedAt: document.updatedAt || document.createdAt || new Date().toISOString(),
  };
}

async function ensureDatabase(name) {
  await cloudantRequest(`/${encodeURIComponent(name)}`, {
    method: 'PUT',
    expectedStatus: [201, 202, 412],
  });
}

async function ensureIndexes() {
  await cloudantRequest(`/${encodeURIComponent(usersDb)}/_index`, {
    method: 'POST',
    expectedStatus: [200],
    body: {
      index: { fields: ['type', 'email'] },
      name: 'users-by-email',
      type: 'json',
    },
  });

  await cloudantRequest(`/${encodeURIComponent(usersDb)}/_index`, {
    method: 'POST',
    expectedStatus: [200],
    body: {
      index: { fields: ['type', 'username'] },
      name: 'users-by-username',
      type: 'json',
    },
  });

  await cloudantRequest(`/${encodeURIComponent(conversationsDb)}/_index`, {
    method: 'POST',
    expectedStatus: [200],
    body: {
      index: { fields: ['type', 'userId', 'updatedAt'] },
      name: 'conversations-by-user-updated',
      type: 'json',
    },
  });
}

async function initializeCloudant() {
  await ensureDatabase(usersDb);
  await ensureDatabase(conversationsDb);
  await ensureIndexes();
}

async function findOne(dbName, selector) {
  const data = await cloudantRequest(`/${encodeURIComponent(dbName)}/_find`, {
    method: 'POST',
    expectedStatus: [200],
    body: {
      selector,
      limit: 1,
    },
  });

  return data.docs?.[0] || null;
}

async function findMany(dbName, selector, sort = []) {
  const data = await cloudantRequest(`/${encodeURIComponent(dbName)}/_find`, {
    method: 'POST',
    expectedStatus: [200],
    body: {
      selector,
      sort,
      limit: 200,
    },
  });

  return Array.isArray(data.docs) ? data.docs : [];
}

async function getDocument(dbName, id) {
  try {
    return await cloudantRequest(`/${encodeURIComponent(dbName)}/${encodeURIComponent(id)}`, {
      method: 'GET',
      expectedStatus: [200],
    });
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function saveDocument(dbName, document) {
  const response = await cloudantRequest(`/${encodeURIComponent(dbName)}/${encodeURIComponent(document._id)}`, {
    method: 'PUT',
    expectedStatus: [201],
    body: document,
  });

  return {
    ...document,
    _rev: response.rev,
  };
}

async function deleteDocument(dbName, id, rev) {
  await cloudantRequest(`/${encodeURIComponent(dbName)}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    expectedStatus: [200],
    searchParams: { rev },
  });
}

async function getUserByEmail(email) {
  const document = await findOne(usersDb, { type: 'user', email });
  return document ? normalizeUserDocument(document) : null;
}

async function getUserByUsername(username) {
  const document = await findOne(usersDb, { type: 'user', username });
  return document ? normalizeUserDocument(document) : null;
}

async function getUserById(id) {
  const document = await getDocument(usersDb, id);
  if (!document || document.type !== 'user') {
    return null;
  }

  return normalizeUserDocument(document);
}

async function createUser({ username, email, password }) {
  const now = new Date().toISOString();
  const document = {
    _id: createDocumentId('user'),
    type: 'user',
    username,
    email,
    password,
    createdAt: now,
    updatedAt: now,
  };

  const saved = await saveDocument(usersDb, document);
  return normalizeUserDocument(saved);
}

async function listConversationsByUserId(userId) {
  const documents = await findMany(
    conversationsDb,
    { type: 'conversation', userId },
    [{ updatedAt: 'desc' }]
  );

  return documents.map(normalizeConversationDocument);
}

async function getConversationByIdForUser(id, userId) {
  const document = await getDocument(conversationsDb, id);
  if (!document || document.type !== 'conversation' || document.userId !== userId) {
    return null;
  }

  return normalizeConversationDocument(document);
}

async function createConversation({ userId, title, settings, messages = [] }) {
  const now = new Date().toISOString();
  const document = {
    _id: createDocumentId('conversation'),
    type: 'conversation',
    userId,
    title: title || 'New chat',
    settings: {
      systemPrompt: settings?.systemPrompt
        || 'You are NexusAI, a modern AI assistant. Be helpful, accurate, practical, and concise. Use markdown when it improves readability.',
      temperature: typeof settings?.temperature === 'number' ? settings.temperature : 0.7,
    },
    messages: messages.map(normalizeMessage),
    createdAt: now,
    updatedAt: now,
  };

  const saved = await saveDocument(conversationsDb, document);
  return normalizeConversationDocument(saved);
}

async function updateConversation(id, userId, updates) {
  const existing = await getDocument(conversationsDb, id);
  if (!existing || existing.type !== 'conversation' || existing.userId !== userId) {
    return null;
  }

  const nextDocument = {
    ...existing,
    title: updates.title ?? existing.title,
    settings: updates.settings
      ? {
          ...existing.settings,
          ...updates.settings,
        }
      : existing.settings,
    messages: Array.isArray(updates.messages)
      ? updates.messages.map(normalizeMessage)
      : existing.messages,
    updatedAt: new Date().toISOString(),
  };

  const saved = await saveDocument(conversationsDb, nextDocument);
  return normalizeConversationDocument(saved);
}

async function deleteConversation(id, userId) {
  const existing = await getDocument(conversationsDb, id);
  if (!existing || existing.type !== 'conversation' || existing.userId !== userId) {
    return false;
  }

  await deleteDocument(conversationsDb, existing._id, existing._rev);
  return true;
}

module.exports = {
  initializeCloudant,
  getUserByEmail,
  getUserByUsername,
  getUserById,
  createUser,
  listConversationsByUserId,
  getConversationByIdForUser,
  createConversation,
  updateConversation,
  deleteConversation,
  normalizeConversationDocument,
};
