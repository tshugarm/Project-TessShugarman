// Home page
exports.index = (req, res) => {
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