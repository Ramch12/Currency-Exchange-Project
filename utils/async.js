module.exports = (handler) => {
    return async (decoded,req, res, next) => {
        try {
            await handler(decoded,req, res);
        }
        catch (err) {
            next(err);
        }
    }
}