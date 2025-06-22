const db = require("../db");

const getScores = async (req, res) => {
  const scores = await db.any("SELECT * FROM scores");
  res.send(scores);
};

const postScore = async (req, res) => {
  db.none("INSERT INTO scores(name, score) VALUES($1, $2)", [
    req.body.name,
    req.body.score,
  ]);
  res.end();
};

module.exports = { getScores, postScore };
