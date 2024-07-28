const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { connectToMongoDB } = require("../db");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");

const generateUserId = () => new ObjectId();

router.post("/brand_regestration", async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const {
      company_name,
      company_industry_type,
      contact_person_name,
      job_title,
      brand_or_agent,
      country,
      email_id,
      mobile_number,
      password,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await connectToMongoDB();
    const db = client.db();
    const collection = db.collection("brand_reg");

    const user_id = generateUserId();

    const store = await collection.insertOne({
      _id: user_id,
      company_name,
      company_industry_type,
      contact_person_name,
      job_title,
      brand_or_agent,
      country,
      email_id,
      mobile_number,
      password: hashedPassword,
      approve_status: 0,
      created_at: new Date(),
    });
    console.log("Store:", store);
    console.log("Document inserted successfully");

    await client.close();

    return res.json({ user_id, message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const client = await connectToMongoDB();
    const db = client.db();
    const collection = db.collection("brand_reg");
    const result = await collection.find({ approve_status: 0 }).toArray();

    await client.close();

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
    const collection = db.collection("brand_reg");
    const result = await collection.find({ approve_status: 1 }).toArray();

    await client.close();

    return res.json(result);
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/send-email", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id || !ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const client = await connectToMongoDB();
    const db = client.db();
    const collection = db.collection("brand_reg");

    const result = await collection.findOne({ _id: new ObjectId(user_id) });

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    const email_id = result.email_id;
    const approveStatus = result.approve_status;

    if (approveStatus === 1) {
      return res.status(400).json({ error: "User is already approved" });
    }

    await collection.updateOne({ _id: new ObjectId(user_id) }, { $set: { approve_status: 1 } });

    console.log("Approve_status updated successfully");

    await client.close();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nsksanjai@gmail.com",
        pass: "ocdr losu hrgn fwin",
      },
    });

    const mailOptions = {
      from: "nsksanjai@gmail.com",
      to: email_id,
      subject: "Approval Notification Bookmesocial",
      text: "Your request for Brand has been approved.",
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);
    return res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error processing email request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/new_users-count", async (req, res) => {
  try {
    const {startDate, endDate} = req.query;
    console.log(startDate, endDate);
    const client = await connectToMongoDB();
    const db = client.db();
    const collection = db.collection("brand_reg");

    const start = new Date(startDate);
    const end = new Date(endDate);

    const created_at = { $gte: start, $lte: end };
    const result = await collection.countDocuments({ created_at: created_at });
    await client.close();
    return res.json({ count: result });
  } catch (error) {
    console.error("Error fetching data from the database:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
  });

module.exports = router;
