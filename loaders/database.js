const mysql = require("mysql");

module.exports = (client) => {
  const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nioufbot",
  });

  db.connect(function () {
    console.log("Connected to the database successfully!");
  });

  client.db = db;
};
