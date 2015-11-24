// PACKAGES //
router = require('express').Router();
path = require('path');
utils = require('../utils');
Session = require('../models/Session');

/**
 * GET - /api/session
 */
router.get('/', function(req, res) {
    if (req.currentUser) {
        Session.findSession(req.query.sessionId, function(err,session) {
            if (err) {
                utils.sendErrResponse(res, 403, err);
            } else {
                Stash.findBySessionAndUsername(result._id, req.currentUser, function(err, stash) {
                    if (err) {
                        utils.sendErrResponse(res, 403, err);
                    } else {
                        session.stash = stash;
                        utils.sendSuccessResponse(res, session);
                    }
                });
            }
        });
    } else utils.sendErrResponse(res, 403, 'Must be logged in');
});


/**
 * POST - /api/session/newstash
 */
router.post('/newstash', function(req, res) {
    if (req.currentUser) {
        Session.addStash(req.body.sessionId, req.currentUser, function(err,result) {
            if (err) {
                utils.sendErrResponse(res, 403, err);
            } else {
                utils.sendSuccessResponse(res, result);
            }
        });
    } else utils.sendErrResponse(res, 403, 'Must be logged in');
});

/**
 * POST - /api/session/newsnippet
 */
router.post('/newsnippet', function(req, res) {
    if (req.currentUser) {
        Session.addSnippet(req.body.sessionId, req.currentUser, req.body.text, function(err,result) {
            if (err) {
                utils.sendErrResponse(res, 403, err);
            } else {
                utils.sendSuccessResponse(res, result);
            }
        });
    } else utils.sendErrResponse(res, 403, 'Must be logged in');
});


module.exports = router;
