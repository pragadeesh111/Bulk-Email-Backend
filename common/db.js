require("dotenv").config();

DB_NAME = "BulkMail";
DB_URL = `mongodb+srv://sankar4595:Sankar4595@cluster0.ywaztpc.mongodb.net/${DB_NAME}`;

module.exports = DB_URL;
