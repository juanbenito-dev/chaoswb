var express = require("express");
var router = express.Router();
const scoreController = require("../controllers/score-controller");

router.get("/", scoreController.getScores);
router.post("/", scoreController.postScore);

module.exports = router;
