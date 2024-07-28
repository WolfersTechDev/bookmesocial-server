const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());

app.use(express.json());
// Require your routes

const authRoutes = require("./Routes/AuthRoutes.js");
const brandreg = require("./Routes/Brandreg.js")
const creatorreg = require("./Routes/Creatorreg.js")
const campaignRouter = require("./Routes/campaignRouter.js")

// Use your routes

app.use("/api/auth", authRoutes);
app.use("/api/brandreg",brandreg);
app.use("/api/creatorreg",creatorreg);
app.use('/api/campaign',campaignRouter); 

app.get("/", (req, res) => {
  res.send("Server is Back");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
