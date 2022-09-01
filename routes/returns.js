const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.post("/", auth, async () => {});

module.exports = router;
