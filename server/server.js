// PACKAGES //
var express = require('express');
var fs = require('fs');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var favicon = require('serve-favicon');
var mongoose = require('mongoose');

// SERVER FILES //
var routes = require('./routes')
var config = require('./config');

// APP //
var app = express();

// DATABASE //
mongoose.connect(config.mongoURI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
    console.log("database connected");
});

// VIEW ENGINE //
app.set('view engine', 'html');
app.engine('html', function(path, options, callback) {
    fs.readFile(path, 'utf-8', callback);
});

// MIDDLEWARE //
app.use(morgan('dev')); // logger
app.use(express.static(__dirname + '/../client')); // set static folder
app.use(favicon(__dirname + '/../client/assets/img/favicon.ico')); // favicon
app.use(cookieSession({secret: config.cookieSecret}))
app.use(bodyParser.json()); // parse json
app.use(bodyParser.urlencoded({ extended: true })); // parse forms
app.use('/', routes); // index routes
app.use(function(err, req, res, next) { res.status(err.status || 500); }); // general error handler

module.exports = app;