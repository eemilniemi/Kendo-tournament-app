import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import UserModel from "../src/models/userModel.ts"

let mongo: any;

/*const schema = new Schema<User, UserMethods>(
  {
    email: {
      type: String,
      required: true,
      index: {
        name: "email_idx",
        unique: true,
        collation: { locale: "en", strength: 2 }
      }
    },
    userName: { type: String, set: omitEmptyString },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    inNationalTeam: { type: Boolean, default: false },
    nationality: { type: String, set: omitEmptyString },
    suomisportId: { type: String, set: omitEmptyString },
    clubName: { type: String, set: omitEmptyString },
    danRank: { type: String, set: omitEmptyString },
    underage: { type: Boolean, default: false },
    guardiansEmail: { type: String, set: omitEmptyString },

    // Internal properties 
    password: { type: String, required: true, select: false },
    refreshToken: { type: String, required: false, select: false },
    resetPasswordToken: { type: String, required: false, select: false },
    resetPasswordExpires: { type: Date, required: false, select: false }
  },
  {
    timestamps: true
  }
);*/

// Valid test user 1
const testUser = {
  email: 'test-user@gmail.com',
  userName: 'testUser',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '045123456789',
  password: 'FooBar123',
  inNationalTeam: false,
  underage: false
};

// Valid test user 2
const testUser2 = {
email: 'test-user2@gmail.com',
userName: 'testUser2',
firstName: 'Other',
lastName: 'User',
phoneNumber: '045987654321',
password: 'FooBar123',
inNationalTeam: false,
underage: false
};

// Valid underage user
const underageUser = {
  email: 'underage@gmail.com',
  userName: 'underage1',
  firstName: 'Another',
  lastName: 'User',
  phoneNumber: '045123321123',
  password: 'FooBar123',
  inNationalTeam: false,
  underage: true,
  guardiansEmail: 'guardian@gmail.com'
};

// Underage user without guardian email provided
const faultyUnderage = {
  email: 'underage@gmail.com',
  userName: 'testUser3',
  firstName: 'Another',
  lastName: 'User',
  phoneNumber: '045123321123',
  password: 'FooBar123',
  inNationalTeam: false,
  underage: true
};

// User with bad password
const badPassword = {
  email: 'test-user@gmail.com',
  userName: 'testUser',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '045123456789',
  password: 'paska_salasana'
};


async function initializeTestDb() {
  console.log('Creating test database...');
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
  console.log(`Connected to test database ${mongoUri}`);
  await UserModel.create(testUser);
  return mongo;
};

async function closeTestDb() {
  await mongoose.disconnect();
  await mongo.stop();
  console.log('Test database disconnected');
};

async function getTestUsers() {
  return await UserModel.find({});
};

async function getTestUserByEmail(email: string) {
  return await UserModel.findOne({email: email});
};

function createTestJwtToken() {
  // TODO
};

export { 
  badPassword, 
  testUser,
  testUser2,
  underageUser,
  faultyUnderage,
  getTestUsers, 
  getTestUserByEmail, 
  initializeTestDb, 
  closeTestDb,
  createTestJwtToken
};
