
const controllers = require("./controllers");
const verifyToken = require("../../middleware/auth");
const authorizeRoles = require("../../middleware/roleMiddleware");
const express = require('express');
const upload = require("../../utils/lib/multer");

const Router = express.Router()

Router.post('/admin/product/add',upload.single('sPhotos'),verifyToken,authorizeRoles("admin"),controllers.addProducts);
Router.post('/admin/analytics',verifyToken,authorizeRoles("admin"),controllers.aggregationQuery);
Router.get('/',controllers.getAdmin);
Router.patch('/admin/updateproduct',verifyToken,authorizeRoles("admin"),controllers.updateProduct);

module.exports = Router;