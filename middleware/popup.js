const setFlashMessage = (req, type, message) => {
    if (!req.session.flash) {
        req.session.flash = {};
    }
    req.session.flash[type] = message;
};

const getFlashMessages = (req) => {
    if (req.session.flash) {
        const flash = req.session.flash;
        delete req.session.flash; // Clear flash messages after reading
        return flash;
    }
    return {};
};

// Middleware to make flash messages available in all views
const popupMiddleware = (req, res, next) => {
    res.locals.flash = getFlashMessages(req);
    
    // Helper functions for setting flash messages
    req.flash = {
        success: (message) => setFlashMessage(req, 'success', message),
        error: (message) => setFlashMessage(req, 'error', message),
        warning: (message) => setFlashMessage(req, 'warning', message),
        info: (message) => setFlashMessage(req, 'info', message)
    };
    
    next();
};

module.exports = {
    popupMiddleware,
    setFlashMessage,
    getFlashMessages
};