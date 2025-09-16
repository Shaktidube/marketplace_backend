const router = require("express").Router();

router.use("/api", [
  require("./auth/routers"),
  require("./user/routers"),
]);

module.exports = router;