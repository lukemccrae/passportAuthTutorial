var express = require('express');
var router = express.Router();
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user')

//post user information to database
router.post('/register', function(req, res, next) {

    //user information
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    //validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        })
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        })
        User.createUser(newUser, function(err, user) {
            if (err) throw err;
            console.log(user);
        })
        req.flash('success_msg', 'You are registered and can now login.')
        res.redirect('/users/login')
    }
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        //function from models that finds a username in the database
        User.getUserByUsername(username, function(err, user) {
            if (err) throw err;
            //if no user, return message
            if (!user) {
                return done(null, false, {
                    message: 'Unknown User'
                });
            }

            //if there is a user, this code runs and checks to see if the entered password
            //matches with the password in the database
            //
            //!!! how does this work with encryption?????
            //
            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
            });
        });
    }));

//these functions save details of the user to a session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    //these are methods from mongoose as User is defined in models/userjs
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    function(req, res) {
        res.redirect('/');
    });

router.get('/login', function(req, res, next) {
    res.render('login')
});

router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success_msg', 'You are logged out.')
    res.redirect('/users/login')
})

module.exports = router
