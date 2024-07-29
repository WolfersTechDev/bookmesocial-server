const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");


const allowedOrigins = ['https://bookmesocial.com', 'https://admindashboard.bookmesocial.com'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

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
