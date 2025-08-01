// Home page
exports.index = (req, res) => {
    // Check for logout success message
    if (req.query.logout === 'success') {
        // Since session is destroyed during logout, we need to manually set the flash
        res.locals.flash = { success: 'You have been successfully logged out. Thanks for using Campus Sports Hub!' };
    }
    res.render('index');
};

// About page
exports.about = (req, res) => {
    res.render('about');
};

// Contact page
exports.contact = (req, res) => {
    res.render('contact');
};