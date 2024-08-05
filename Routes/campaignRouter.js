const express = require('express');
const multer = require('multer');
const { connectToMongoDB } = require('../db');
const router = express.Router();
const { ObjectId } = require('mongodb');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/create_campaign', upload.single('uploadimg'), async (req, res) => {
  try {
    const { name, brandname, description } = req.body;
    const imageBuffer = req.file.buffer;

    if (!name || !brandname || !description || !imageBuffer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await connectToMongoDB();
    const db = client.db();

    const campaignCollection = db.collection('campaign');
    const result = await campaignCollection.insertOne({
      name,
      brandname,
      description,
      image: imageBuffer,
    });
    return res.status(200).json({ success: true, message: 'Image uploaded successfully', id: result.insertedId });
  } catch (error) {
    console.error('Error processing image upload request:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/get_all_campain', async (req, res) => {
  try {
    const client = await connectToMongoDB();
    const db = client.db();

    const campaignCollection = db.collection('campaign');
    const results = await campaignCollection.find().toArray();

    const dataWithBase64Images = results.map((result) => ({
      ...result,
      image: result.image ? result.image.toString('base64') : null,
    }));
    return res.status(200).json(dataWithBase64Images);
  } catch (error) {
    console.error('Error fetching data from the database:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.delete('/delete_campaign/:campaignId', async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    if(!campaignId || !ObjectId.isValid(campaignId)) {
      return res.status(400).json({ error: "Invalid campain ID" });
    }

    

    const client = await connectToMongoDB();
    const db = client.db();

    const campaignCollection = db.collection('campaign');
    const result = await campaignCollection.deleteOne({ _id: new ObjectId(campaignId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    return res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
