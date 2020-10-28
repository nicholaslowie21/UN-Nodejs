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
db.contribution = require("./contribution.model")(mongoose);
db.projectreq = require("./projectreq.model")(mongoose);
db.resourcereq = require("./resourcereq.model")(mongoose);
db.profilefeed = require("./profilefeed.model")(mongoose);
db.projectpost = require("./projectpost.model")(mongoose);
db.postcomment = require("./postcomment.model")(mongoose);
db.discoverweekly = require("./discoverweekly.model")(mongoose);
db.reward = require("./reward.model")(mongoose);
db.contactcard = require("./contactcard.model")(mongoose);
db.projectevent = require("./projectevent.model")(mongoose);
db.voucher = require("./voucher.model")(mongoose);

module.exports = db;