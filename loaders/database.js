const mysql = require("mysql");

function getWarns(guildID, userID) {
  return new Promise((resolve, reject) => {
    const db = module.exports.db;
    if (!db) return resolve([]);
    db.query(
      "SELECT * FROM warning WHERE guildID = ? AND userID = ? ORDER BY date DESC",
      [guildID, userID],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

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
  module.exports.db = db; // So getWarns can access it
};

module.exports.getWarns = getWarns;
