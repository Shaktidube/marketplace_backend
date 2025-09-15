require('./globals/index')
const connectDB = require("./config/db");
const router = require("./app/routers");
const { contractEventListener } = require('./app/utils/lib/eventTracker/events');
const io = require('./app/utils/lib/socket');


// mongoDb connect
connectDB()

// contract event tracker
contractEventListener(io);

// api
router.initialize()