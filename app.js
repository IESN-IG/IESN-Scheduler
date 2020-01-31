const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('express-flash');
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

const http = require('http');
const indexRouter = require('./routes/index');
const calendarRouter = require('./routes/calendar');
const helpRouter = require('./routes/help');
const sectionRouter = require('./routes/section');
const serverWebPort = require('./settings.json').serverWebPort;
const utils = require('./utils.js');
const cron = require('node-cron');
const credentials = require('./credentials');

// Update des codes pour les requêtes toutes les 5minutes entre 6h et 6h30
cron.schedule('0-30/1 6 * * *', utils.updateClassesCodes);
utils.load();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('tiny'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    secret: credentials.secretCookieString,
    resave: false,
    saveUninitialized: false,
}));

app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/calendar', calendarRouter);
app.use('/help', helpRouter);
app.use('/section', sectionRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    utils.renderTemplate(res, req, 'error', {title: 'Erreur ' + err.status, error: err});
});

http.createServer(app).listen(serverWebPort, function () {
    console.log(`Webserver started on port ${serverWebPort}`);
});

module.exports = app;
