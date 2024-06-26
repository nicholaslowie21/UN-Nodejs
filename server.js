const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require('fs');
const https = require('https');

const createError = require('http-errors');
const path = require('path');
const logger = require('morgan'); //for logging in console, the request message
const moment = require('moment-timezone')
const multer = require('multer');

const apiRouter = require('./app/routes/api.routes')
const app = express();

moment.tz.setDefault('Asia/Singapore');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());

app.use('/public', express.static('public'));
app.use('/file', express.static('file'));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname+'/app/views');
app.set('view engine', 'ejs');

// connect to DB
const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to our IS4103 Node.js Backend." });
});

app.use('/api',apiRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("404");
  next(createError(404, "Invalid URL"));
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  return res.json({
    status: 'error',
    msg: err,
    data: {}
});
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

const altPort = 8081;
app.listen(altPort, () => {
  console.log(`Alternative server is running on port ${altPort}.`);
});