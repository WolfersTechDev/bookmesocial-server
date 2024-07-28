const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const url = process.env.MONGODB_URI;

async function connectToMongoDB() {
  const client = new MongoClient(url);
  await client.connect();
  return client;
}

async function createCollections(client) {
  const db = client.db(); 
  try {
    await createCollection(db, "auth");
    await createCollection(db, "creators");
    await createCollection(db, "brand_reg");
    await createCollection(db, "campaign");
    await createCollection(db, "contactus");

    console.log("All collections created successfully");
  } catch (err) {
    console.error("Error creating collections:", err.message || err);
  }
}

async function createCollection(db, collectionName) {
  try {
    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      console.log(`Collection '${collectionName}' created successfully`);
    } else {
      console.log(`Collection '${collectionName}' already exists`);
    }
  } catch (err) {
    console.error(`Error creating or checking '${collectionName}' collection:`, err.message || err);
    throw err;
  }
}

async function checkUsername(client, username) {
  const db = client.db();
  try {
    const collection = db.collection("auth");
    const result = await collection.findOne({ username });
    return result;
  } catch (err) {
    console.error("Error checking username:", err.message || err);
    throw err;
  }
}

async function run() {
  const client = await connectToMongoDB();

  try {
    await createCollections(client);
  } finally {
    await client.close();
  }
}

run();

module.exports = {
  connectToMongoDB,
  createCollections,
  checkUsername,
};
