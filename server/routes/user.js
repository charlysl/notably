// PACKAGES //
router = require('express').Router();
path = require('path');
utils = require('../utils');
User = require('../models/User');
Course = require('../models/Course');
Session = require('../models/Session');

/**
 * Helper function to check whether the user request is valid in POST requests
 */
var isValidUserReq = function(req, res) {
    if (req.currentUser) {
        utils.sendErrResponse(res, 403, 'There is already a user logged in.');
        return false;
    } else if (!req.body.username) {
        utils.sendErrResponse(res, 400, 'Username not provided.');
        return false;
    }
    return true;
};

/**
 * GET - /api/user
 */
router.get('/', function(req, res) {
    if (req.currentUser) {
        User.findProfile(req.query.username, function(err,result) {
            if (err) {
                utils.sendErrResponse(res, 403, err);
            } else {
                Course.getCoursesByUser(result.username, function(err, courses) {
                    if (err) {
                        utils.sendErrResponse(res, 403, err);
                    } else {
                        result.courses = courses.courses;
                        Session.getSessionsByUser(result.username, function(err, sessions) {
                            if (err) {
                                utils.sendErrResponse(res, 403, err);
                            } else {
                                result.recentSessions = sessions.recentSessions;
                                utils.sendSuccessResponse(res, result);
                            }
                        });
                    }
                });
            }
        });
    } else utils.sendErrResponse(res, 403, 'Must be logged in');
});

/**
 * GET - /api/user/auth
 */
router.get('/auth', function(req, res) {
    if (req.currentUser) {
        utils.sendSuccessResponse(res, { username: req.currentUser });
    } else {
        utils.sendErrResponse(res, 403, err);
    }
});

/**
 * POST - /api/user/create
 */
router.post('/create', function(req, res) {
    if (isValidUserReq(req, res)) {
        User.createNewUser(req.body.username, req.body.password, req.body.name, req.body.email, function(err,result) {
            if (err) {
                utils.sendErrResponse(res, 403, err);
            } else {
                req.session.username = req.body.username;
                utils.sendSuccessResponse(res, { username: result.username });
            }
        });
    }
});

/**
 * POST - /api/user/login
 */
router.post('/login', function(req, res) {
    if (isValidUserReq(req, res)) {
        User.verifyPassword(req.body.username, req.body.password, function(err,result) {
            if (err) {
                utils.sendErrResponse(res, 403, err);
            } else {
                req.session.username = req.body.username;
                utils.sendSuccessResponse(res, { username: req.body.username });
            }
        });
    }
});

/**
 * POST - /api/user/logout
 */
router.post('/logout', function(req, res) {
    if (req.currentUser) {
        var user = req.currentUser;
        req.session = null;
        utils.sendSuccessResponse(res, { username: user });
    } else {
        utils.sendErrResponse(res, 403, 'There is no user currently logged in.');
    }
});

/**
 * GET - /api/user/courses
 */
router.get('/courses', function(req, res) {
    if (req.currentUser) {
        Course.getCoursesByUser(req.currentUser, function(err,result) {
            if (err) {
                utils.sendErrResponse(res, 403, err);
            } else {
                utils.sendSuccessResponse(res, result);
            }
        });
    } else utils.sendErrResponse(res, 403, 'Must be logged in');
});

/**
 * POST - /api/user/subscribe
 */
router.post('/subscribe', function(req, res) {
    if (req.currentUser) {
        Course.subscribeUser(req.currentUser, req.body.course, function(err,result) {
            if (err) {
                utils.sendErrResponse(res, 403, err);
            } else {
                utils.sendSuccessResponse(res, result);
            }
        });
    } else utils.sendErrResponse(res, 403, 'Must be logged in');
});

/**
 * POST - /api/user/unsubscribe
 */
router.post('/unsubscribe', function(req, res) {
    if (req.currentUser) {
        Course.unsubscribeUser(req.currentUser, req.body.course, function(err,result) {
            if (err) {
                utils.sendErrResponse(res, 403, err);
            } else {
                utils.sendSuccessResponse(res, result);
            }
        });
    } else utils.sendErrResponse(res, 403, 'Must be logged in');
});

module.exports = router;
