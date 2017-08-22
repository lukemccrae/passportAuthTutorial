var express = require('express');
var router = express.Router();
var passport = require('passport');
var multerS3 = require('multer-s3');
var multer = require('multer');
var aws = require('aws-sdk');

aws.config.loadFromPath('./config.json');
aws.config.update({
    signatureVersion: 'v4'
})

var s0 = new aws.S3({});

var upload = multer({
    storage: multerS3({
        s3: s0,
        bucket: 'lukespracticebucket',
        acl: 'public-read',

        //name of file
        metadata: function(req, file, cb) {
            cb(null, {
                fieldname: file.fieldname
            });
        },
        //unique description/date for the file
        key: function(req, file, cb) {
            cb(null, Date.now() + file.originalname)
        }
    })
})

/* GET home page. */

router.get('/', ensureAuthenticated, function(req, res, next) {
    res.render('index')
});


router.get('/users/register', function(req, res, next) {
    res.render('register')
});

router.post('/profile/upload', upload.any(), function(req, res, next) {
    res.send(req.files);
    console.log(req.files)
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/users/login')
    }
}

module.exports = router;
