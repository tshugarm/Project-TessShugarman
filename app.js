const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// Import middleware
const { populateUser } = require('./middleware/auth');
const { popupMiddleware } = require('./middleware/popup');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Import route modules
const mainRoutes = require('./routes/mainRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

let port = 3000;
let host = 'localhost';

// Configure view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

// MongoDB Connection
const mongoURI = 'mongodb+srv://tshugarm:graduationpass@project3.sgfhcyv.mongodb.net/?retryWrites=true&w=majority&appName=project3';
mongoose.connect(mongoURI, {})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Session configuration
app.use(session({
    secret: 'fourty-niners',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://tshugarm:graduationpass@project3.sgfhcyv.mongodb.net/?retryWrites=true&w=majority&appName=project3'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));

// Add user session data to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isLoggedIn = !!req.session.userId;
    next();
});

// Global middleware to populate user data in all views
app.use(popupMiddleware);    
app.use(populateUser);

// Add multer middleware for file uploads on event routes
app.use('/events', upload.single('image'));

// Mount route modules
app.use('/', mainRoutes);
app.use('/events', eventRoutes);
app.use('/users', userRoutes);

// 404 handler
app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

// Error handler
app.use((err, req, res, next) => {
    console.log(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }
    res.status(err.status);
    res.render('error', {error: err});
});

// Start server
app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});