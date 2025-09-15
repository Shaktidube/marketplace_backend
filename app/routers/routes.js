const router = require("express").Router();

router.use("/api", [
  require("./admin/routers"),
  require("./auth/routers"),
  require("./user/routers"),
]);

module.exports = router;