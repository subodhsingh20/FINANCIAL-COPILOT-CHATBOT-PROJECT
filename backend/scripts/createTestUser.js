require('dotenv').config();
const bcrypt = require('bcrypt');
const { initializeCloudant, createUser, getUserByEmail } = require('../services/cloudantService');

async function createTestUser() {
  try {
    await initializeCloudant();
    console.log('Connected to Cloudant');

    const existingUser = await getUserByEmail('testuser@example.com');
    if (existingUser) {
      console.log('Test user already exists with ID:', existingUser._id);
      return;
    }

    const hashedPassword = await bcrypt.hash('testpassword', 10);

    const savedUser = await createUser({
      username: 'testuser',
      email: 'testuser@example.com',
      password: hashedPassword
    });

    console.log('Test User created with ID:', savedUser._id.toString());
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

createTestUser();
