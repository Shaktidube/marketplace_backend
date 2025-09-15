const _ = {};

_.catchServerError = (name, error, res) => {
    console.error(name, error);
    if (process.env.NODE_ENV !== 'dev') Sentry.captureMessage(name, error);
    return res.reply(messages.server_error());
};

module.exports = _;
