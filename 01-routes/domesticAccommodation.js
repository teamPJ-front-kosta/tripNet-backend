const express = require("express");
const router = express.Router();
const hotellist = require("../04-json/hotellist.json");

router.get("/", async (req, res) => {
  console.log("hotellist 불러오는중..");
  res.json(hotellist);
});

module.exports = router;
