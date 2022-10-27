const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const { validate } = require("../models/return");

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
});

module.exports = router;
