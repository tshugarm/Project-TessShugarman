const express = require('express');
const morgan = require('morgan');

const app = express();

let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/index.ejs', (req, res) => {
    res.render('index');
});
app.get('/events.ejs', (req, res) => {
    res.render('events');
});
app.get('/event.ejs', (req, res) => {
    res.render('event');
})
app.get('/newEvent.ejs', (req, res) => {
    res.render('newEvent');
});


app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});