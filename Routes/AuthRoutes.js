
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { connectToMongoDB } = require('../db');



router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const client = await connectToMongoDB();
    const db = client.db();
    const collection = db.collection("auth");
    const existingUser = await collection.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await collection.insertOne({
      username,
      password: hashedPassword,
    });

    await client.close();

    return res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login request received for username:", username);

  if (!username || !password) {
    console.log("Login request without username or password:", username);
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const client = await connectToMongoDB();
    const db = client.db();
    const collection = db.collection("auth");

    const user = await collection.findOne({ username });

    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    await client.close();

    if (isPasswordValid) {
      return res.status(200).json({ message: "Login successful" });
    } else {
      return res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// logout route
router.get("/logout", (req, res) => {
  req.session = null;
  res.status(200).json({ message: "Logout successful" });
});

module.exports = router;
