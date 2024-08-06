const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');


const allowedOrigins = [
    'http://bookmesocial.com', 
    'http://admindashboard.bookmesocial.com', 
    'https://bookmesocial.com', 
    'https://admindashboard.bookmesocial.com',
    'http://localhost:3000',
  ];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.error('Blocked by CORS:', origin); // Log blocked origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, './Routes/uploads')));


app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Adjust the limit as needed


// Middleware to handle file uploads
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  createParentPath: true
}));

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
