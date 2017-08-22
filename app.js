var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var FacebookStrategy = require('passport-facebook');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var oauth2lib = require('oauth20-provider');
var oauth2 = new oauth2lib({
    log: {
        level: 2
    }
});




mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();


// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
    defaultLayout: 'layout'
}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());

app.use(session({
    secret: 'da illest developer',
    resave: true,
    saveUninitialized: true
}))
app.use(oauth2.inject());

//app info
var FACEBOOK_APP_ID = '694017184121381',
    FACEBOOK_APP_SECRET = '2c5467e56067a82b2505bd8f0ed57cc4'

//info for facebook call
fbOpts = {
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['emails']
}
var fbCallback = function(accessToken, refreshToken, profile, cb) {
    console.log(accessToken, refreshToken, profile, cb);
}

app.route('/dummy')
    .get(passport.authenticate('facebook', {
        scope: ['email']
    }))

app.route('/auth/facebook/callback')
    .get(passport.authenticate('facebook', function(err, user, info) {
        console.log(err, user, info);
    }))

//oauth call
passport.use(new FacebookStrategy(fbOpts, fbCallback));

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});



app.use('/', routes);
app.use('/users', users);

// Set Port
// app.set('port', (process.env.PORT || 3000));

// app.listen(app.get('port'), function() {
//     console.log('Server started on port ' + app.get('port'));
// });

module.exports = app;
