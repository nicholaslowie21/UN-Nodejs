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
db.item = require("./item.model")(mongoose);
db.knowledge = require("./knowledge.model")(mongoose);
db.manpower = require("./manpower.model")(mongoose);
db.money = require("./money.model")(mongoose);
db.venue = require("./venue.model")(mongoose);
db.kpi = require("./kpi.model")(mongoose);
db.resourceneed = require("./resourceneed.model")(mongoose);

module.exports = db;