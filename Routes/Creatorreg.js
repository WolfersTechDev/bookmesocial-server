const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { connectToMongoDB } = require("../db");
const nodemailer = require("nodemailer");
const validator = require("validator");
const { ObjectId } = require("mongodb");

function isValidEmail(email) {
  return validator.isEmail(email);
}

router.post("/Register_cre_influ", async (req, res) => {
  try {
    const {
      name,
      mobile_number,
      email_id,
      channel_site_name,
      social_media,
      followers_range,
      password_creator,
    } = req.body;

    const isValid_email = isValidEmail(email_id);

    if(!isValid_email) {
      return res.status(400).json({ error: "Invalid email" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password_creator, 10);

    // Connect to MongoDB
    const client = await connectToMongoDB();
    const db = client.db();

    // Check if the creator already exists
    const existingCreator = await db.collection("creators").findOne({
      $or: [{ name }, { email_id }],
    });

    if (existingCreator) {
      return res.status(400).json({ error: "Name or email already exists" });
    }

    // Insert the new creator into the collection
    await db.collection("creators").insertOne({
      name,
      mobile_number,
      email_id,
      channel_site_name,
      social_media,
      followers_range,
      password_creator: hashedPassword,
      approve_status: 0,
    });

    return res.status(200).json({ message: "Form submitted successfully" });

  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/creater", async (req, res) => {
  try {
    const client = await connectToMongoDB();
    const db = client.db();

    const creatorsCollection = db.collection("creators");

    const result = await creatorsCollection.find({ approve_status: 0 }).toArray();

    await client.close();

    return res.status(200).json({ message: "Patner Application Data", data: result });

  } catch (error) {
    console.error("Error fetching data from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/approved", async (req, res) => {
  try {

    const client = await connectToMongoDB();
    const db = client.db();

    const creatorsCollection = db.collection("creators");

    const data = await creatorsCollection.find({ approve_status: 1 }).toArray();

    await client.close();

    return res.status(200).json({ message: "Over Pathers Data", data: data }); 

  } catch (error) {
    console.error("Error fetching data from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/aprover_creater/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;

    if(!itemId || !ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const client = await connectToMongoDB();
    const db = client.db();

    const creatorsCollection = db.collection("creators");

    const result = await creatorsCollection.findOneAndUpdate({ _id: new ObjectId(itemId) }, { $set: { approve_status: 1 } });

    await client.close();

    return res.status(200).json({ message: "Pather approved successfully", data: result });

  } catch (error) {
    console.error("Error fetching data from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
})


router.get("/reject_creater/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;

    if(!itemId || !ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const client = await connectToMongoDB();
    const db = client.db();

    const creatorsCollection = db.collection("creators");

    const result = await creatorsCollection.deleteOne({ _id: new ObjectId(itemId) });

    await client.close();

    return res.status(200).json({ message: "Patner rejected successfully", data: result });

  } catch (error) {
    console.error("Error fetching data from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
})

// cound total number of patner request
router.get("/total_patner_request", async (req, res) => {
  try {
    const client = await connectToMongoDB();
    const db = client.db();
    const collection = db.collection("creators");
    const result = await collection.countDocuments({ approve_status: 0 });

    await client.close();

    return res.json({message: "Total number of patner request", count: result });
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/Patner_details/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;

    if(!itemId || !ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const client = await connectToMongoDB();
    const db = client.db();

    const creatorsCollection = db.collection("creators");

    const result = await creatorsCollection.findOne({ _id: new ObjectId(itemId) });

    await client.close();

    return res.status(200).json({ message: "Patner approved successfully", data: result });

  } catch (error) {
    console.error("Error fetching data from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
})

router.post("/send-email", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id || typeof user_id !== "string") {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const client = await connectToMongoDB();
    const db = client.db();
    const creatorsCollection = db.collection("creators");

    const user = await creatorsCollection.findOne({ _id: user_id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const email_id = user.email_id;
    const approveStatus = user.approve_status;

    if (approveStatus === 1) {
      return res.status(400).json({ error: "User is already approved" });
    }

    await creatorsCollection.updateOne({ _id: user_id }, { $set: { approve_status: 1 } });

    console.log("Approve_status updated successfully");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nsksanjai@gmail.com",
        pass: "ocdr losu hrgn fwin",
      },
    });

    // Email content
    const mailOptions = {
      from: "nsksanjai@gmail.com",
      to: email_id,
      subject: "Approval Notification Bookmesocial",
      text: "Your request for Creator has been approved.",
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);
    res.json({ message: "Email sent successfully" });

  } catch (error) {
    console.error("Error processing email request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
