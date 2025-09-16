  const express = require("express");
  // const app = express();
  const routes = require("./routes");
  const configObj = require("../../config/config");
  const cors = require("cors")
  const ethers = require("ethers");

  function Router (){
    this.app = express();

    // app.use(express.json());

    // app.use("/", routes);

    // app.listen(configObj.PORT, () => {
    //   console.log(`server is running on http://localhost:${configObj.PORT} `);
    // });

  };
  Router.prototype.initialize = function () {
    this.setupMiddleware(); 
    this.setupRouter()
    return this.app;
  };

  Router.prototype.setupMiddleware = function () {
    this.app.use(this.routeConfig)
  }

  Router.prototype.setupRouter =  function (){

    this.app.use(cors({origin:'*',methods:['GET','POST','PATCH','DELETE','PUT'],credentials:true}))
    
    this.app.use(express.json());
    this.app.use("/", routes);

    this.app.listen(configObj.PORT, () => {
      console.log(`devServer is running on http://localhost:${configObj.PORT} `);
    });

    this.app.listen(configObj.TESTPORT, () => {
      console.log(`test server is running on http://localhost:${configObj.TESTPORT} `);
    });

  }

  Router.prototype.routeConfig = function (req, res, next) {
    req.sRemoteAddress =
        req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (req.path === '/healthcheck') return res.status(200).send({ message: '200' });
    res.reply = ({ code, message }, data = {}, header = undefined) => {
        res.status(code).header(header).json({ message, data });
    };
    next();
  };

  module.exports = new Router();
