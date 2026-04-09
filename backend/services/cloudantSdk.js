const { CloudantV1 } = require('@ibm-cloud/cloudant');

const cloudantUrl = process.env.CLOUDANT_URL;
const cloudantApiKey = process.env.CLOUDANT_APIKEY;
const databaseName = process.env.CLOUDANT_DATABASE || 'myapp';

function assertCloudantEnv() {
  if (!cloudantUrl) {
    throw new Error('Missing required environment variable: CLOUDANT_URL');
  }

  if (!cloudantApiKey) {
    throw new Error('Missing required environment variable: CLOUDANT_APIKEY');
  }
}

function createCloudantClient() {
  assertCloudantEnv();

  // The IBM Cloudant SDK reads standard Cloudant environment variables.
  process.env.CLOUDANT_URL = cloudantUrl;
  process.env.CLOUDANT_APIKEY = cloudantApiKey;

  return CloudantV1.newInstance({});
}

function createDocumentPayload(id, document) {
  return {
    _id: id,
    ...document,
    createdAt: document.createdAt || new Date().toISOString(),
  };
}

async function insertDocument(id, document) {
  const client = createCloudantClient();
  const payload = createDocumentPayload(id, document);

  const response = await client.putDocument({
    db: databaseName,
    docId: id,
    document: payload,
  });

  return {
    id: response.result.id,
    rev: response.result.rev,
    document: payload,
  };
}

async function readDocument(id) {
  const client = createCloudantClient();
  const response = await client.getDocument({
    db: databaseName,
    docId: id,
  });

  return response.result;
}

async function updateDocument(id, document) {
  const client = createCloudantClient();
  const current = await readDocument(id);

  const response = await client.putDocument({
    db: databaseName,
    docId: id,
    rev: current._rev,
    document: {
      ...current,
      ...document,
      updatedAt: new Date().toISOString(),
    },
  });

  return response.result;
}

async function deleteDocument(id) {
  const client = createCloudantClient();
  const current = await readDocument(id);

  return client.deleteDocument({
    db: databaseName,
    docId: id,
    rev: current._rev,
  });
}

module.exports = {
  createCloudantClient,
  insertDocument,
  readDocument,
  updateDocument,
  deleteDocument,
};
