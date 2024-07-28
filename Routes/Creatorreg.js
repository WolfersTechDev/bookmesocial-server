const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { connectToMongoDB } = require("../db");
const nodemailer = require("nodemailer");
const validator = require("validator");

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
    const hashedPassword = await bcrypt.hash(password_creator, 10);

    const client = await connectToMongoDB();
    const db = client.db();

    const creatorsCollection = db.collection("creators");

    const existingCreator = await creatorsCollection.findOne({
      $or: [{ name }, { email_id }],
    });
    if (existingCreator) {
      return res.status(400).json({ error: "Name or email already exists" });
    }

    await creatorsCollection.insertOne({
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

    return res.json(result);

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

    const result = await creatorsCollection.find({ approve_status: 1 }).toArray();

    res.json(result);

  } catch (error) {
    console.error("Error fetching data from the database:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
