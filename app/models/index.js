const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

db.users = require("./users.model.js")(mongoose);
db.institution = require("./institution.model")(mongoose);
db.project = require("./project.model.js")(mongoose);
db.passwordreset = require("./passwordreset.model")(mongoose);
db.verifyrequest = require("./verifyrequest.model")(mongoose);
db.badge = require("./badge.model")(mongoose);

module.exports = db;