const services = require("./lib/boilerNodemailer");
const handleTransferEvent = require("./lib/eventTracker/eventsMethod")
const socket = require("./lib/socket")

module.exports = {services , handleTransferEvent, socket};