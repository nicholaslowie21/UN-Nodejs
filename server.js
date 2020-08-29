const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require('fs');
const https = require('https');

const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');


const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to our IS4103 Node.js Backend." });
});

const PORT = process.env.PORT || 8080;
https.createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: 'node'
}, app)
.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});