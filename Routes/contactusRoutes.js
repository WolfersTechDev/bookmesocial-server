const express = require('express');
const router = express.Router();
const { connectToMongoDB } = require('../db');
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
  try {
    const client = await connectToMongoDB();
    const db = client.db();
    
    const contactusCollection = db.collection('contactus');
    const results = await contactusCollection.find().toArray();

   return res.json(results);
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, question, comment } = req.body;
    
    const client = await connectToMongoDB();
    const db = client.db();
    
    const contactusCollection = db.collection('contactus');
    const result = await contactusCollection.insertOne({
      name,
      email,
      question,
      comment,
    });

    return res.json({ id: result.insertedId });
  } catch (error) {
    console.error("Error inserting data into the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const contactId = req.params.id;

    const client = await connectToMongoDB();
    const db = client.db();

    const contactusCollection = db.collection('contactus');
    const result = await contactusCollection.deleteOne({ _id: ObjectId(contactId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact us entry not found' });
    }

    return res.json({ message: 'Contact us entry deleted successfully' });
  } catch (error) {
    console.error("Error deleting data from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
