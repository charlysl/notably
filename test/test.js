var assert = require('assert');
var mongoose = require('mongoose');
var Course = require('../server/models/Course');
var Session = require('../server/models/Session');
var Snippet = require('../server/models/Snippet');
var Stash = require('../server/models/Stash');
var User = require('../server/models/User');

var courseId1 = null; //6.170
var courseId2 = null; //6.005
var sessionId1 = null; //for 6.170
var sessionId2 = null; //for 6.005
var stashId1 = null; //for user kim
var stashId2 = null; //for user 123
var snippetId1 = null; //author kim
var snippetId2 = null; //author kim

describe('Init', function() {

    before(function (done) {
        mongoose.connect('mongodb://localhost/model_test',function(){
            mongoose.connection.db.dropDatabase();
            User.createNewUser('kim', 'pass123', 'Kim Zhong', 'kimberli@mit.edu', function() {
                User.createNewUser('123', 'pass12', 'Ben Bitdiddle', 'bendit@mit.edu', function(){
                    //user 456 may have some fields breaking rep invariants since this user is used to test submethods
                    // e.g. invalid numSubmitted where the field doesn't correspond to real snippets
                    User.createNewUser('456', 'pa1242412ss2', 'Alyssa Hacker', 'alyssa@mit.edu', function(){
                        (new Course({
                            name: 'Software Studio',
                            number: '6.170',
                            professor: 'Daniel Jackson',
                            description: 'This is a class about JavaScript',
                            sessions: []
                        })).save(function(err, result) {
                            if (!err) {
                                courseId1 = result._id;
                            }
                            (new Course({
                                name: 'Elements of Software Construction',
                                number: '6.005',
                                professor: 'Robert Miller',
                                description: 'This is a class about Java',
                                sessions: []
                            })).save(function(err, result) {
                                if (!err) {
                                    courseId2 = result._id;
                                }
                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    // test user model
    describe('User', function() {

        //test auth
        describe('#auth', function () {
            // test nonexistent user
            it('should return error when user does not exist', function (done) {
                User.auth('hello', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test existent user
            it('should not return error when user exists', function (done) {
                User.auth('kim', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.username, 'kim');
                    done();
                });
            });
        });

        //test findProfile
        describe('#findProfile', function () {
            // test nonexistent user
            it('should return error when user does not exist', function (done) {
                User.findProfile('hello', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test created user
            it('should return username when user exists', function (done) {
                User.findProfile('kim', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.username, 'kim');
                    done();
                });
            });

            // test created user capitalized
            it('should return username when user exists even if capitalized', function (done) {
                User.findProfile('Kim', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.username, 'kim');
                    done();
                });
            });

        });

        //test verifyPassword
        describe('#verifyPassword', function () {

            // test nonexistent user
            it('should return error when user does not exist', function (done) {
                User.verifyPassword('hello', 'hoo', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test incorrect pass
            it('should return error when incorrect password', function (done) {
                User.verifyPassword('kim', 'pass', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test existing user
            it('should not return error when user exists', function (done) {
                User.verifyPassword('kim', 'pass123', function(err, result) {
                    assert.equal(err, null);
                    done();
                });
            });

            // test existing user different capitalization
            it('should not return error when user exists with different capitalization', function (done) {
                User.verifyPassword('Kim', 'pass123', function(err, result) {
                    assert.equal(err, null);
                    done();
                });
            });

        });

        //test createNewUser
        describe('#createNewUser', function () {
            // test nonexistent user
            it('should return error when user exists', function (done) {
                User.createNewUser('kim', 'password', 'name', 'email@mit.edu', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test username min length
            it('should return error when username too short', function (done) {
                User.createNewUser('ki', 'password', 'name', 'email@mit.edu', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test username max length
            it('should return error when username too long', function (done) {
                User.createNewUser('kewfewfweewfefwgi', 'password', 'name', 'email@mit.edu', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test username invalid characters
            it('should return error when username has invalid chars', function (done) {
                User.createNewUser('hi<>mi', 'password', 'name', 'email@mit.edu', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test non-MIT email
            it('should return error when email is non-mit', function (done) {
                User.createNewUser('hief', 'password', 'name', 'email@test.com', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test non-unique email
            it('should return error when email taken', function (done) {
                User.createNewUser('balggw', 'password', 'name', 'kimberli@mit.edu', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test short password
            it('should return error when password too short', function (done) {
                User.createNewUser('balggw', 'pass', 'name', 'wrgre@mit.edu', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test new user
            it('should not return error when user does not exist', function (done) {
                User.createNewUser('eek', 'password', 'name', 'email@mit.edu', function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result, {username: 'eek'});
                    done();
                });
            });

            // test new user capitalized
            it('should not return error when username capitalized', function (done) {
                User.createNewUser('Blah', 'password', 'name', 'email1@mit.edu', function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result, {username: 'blah'});
                    done();
                });
            });
        });

        //test addCourse
        describe('#addCourse', function () {
            // test adding course
            it('should not return error when course exists', function (done) {
                User.addCourse('kim', courseId1, function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.courses.length, 1);
                    assert.deepEqual(result.courses[0], courseId1);
                    done();
                });
            });

            // test adding duplicate course
            it('should return error when course already subscribed to', function (done) {
                User.addCourse('kim', courseId1, function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

        });

        //test removeCourse
        describe('#removeCourse', function () {
            // test adding nonexistent course
            it('should return error when course not found', function (done) {
                User.removeCourse('kim', 'bllablabh', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test removing course
            it('should not return error when course exists (if User.addCourse worked)', function (done) {
                User.removeCourse('kim', courseId1, function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.courses.length, 0);
                    done();
                });
            });
        });

        //test incrementSubmitted
        describe('#incrementSubmitted', function () {
            // test incrementing from 0 to 1
            it('should not return error when called', function (done) {
                User.incrementSubmitted('456', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.numSubmitted, 1);
                    User.findProfile('456', function(err, result) {
                        assert.equal(result.stats.numSubmitted, 1);
                        done();
                    });
                });
            });
        });

        //test incrementSaved
        describe('#incrementSaved', function () {
            // test incrementing from 0 to 1
            it('should not return error when called', function (done) {
                User.incrementSaved('kim', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.numSaved, 1);
                    User.findProfile('kim', function(err, result) {
                        assert.equal(result.stats.numSaved, 1);
                        done();
                    });
                });
            });
        });

        //test decrementSaved
        describe('#decrementSaved', function () {
            // test decrementing from 1 to 0
            it('should not return error when called on valid numSaved', function (done) {
                User.decrementSaved('kim', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.numSaved, 0);
                    User.findProfile('kim', function(err, result) {
                        assert.equal(result.stats.numSaved, 0);
                        done();
                    });
                });
            });

            // test decrementing from 0
            it('should return error when called on invalid numSaved', function (done) {
                User.decrementSaved('kim', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
        });

        //test addRecentSession
        describe('#addRecentSession', function () {
            var sessionIds = [];

            // test creating 11 sessions to use for tests
            it('should create fake sessions to use for this method test', function (done) {
                for (var i = 1; i <= 6; i++) {
                    Session.create('fakecoursenum', 'session'+i.toString(), '456', function(err, result) {
                        sessionIds.push(result._id);
                    });
                }
                Session.find({}, function(err, result) {
                    assert.equal(result.length, 6);
                    done();
                });
            });
            // test adding first recent session
            it('should not return error when adding first session', function (done) {
                User.addRecentSession('456', sessionIds[0], function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.recentSessions.length, 1);
                    assert.deepEqual(result.recentSessions[0], sessionIds[0]);
                    done();
                });
            });
            // test adding second recent session
            it('should not return error when adding second session', function (done) {
                User.addRecentSession('456', sessionIds[1], function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.recentSessions.length, 2);
                    assert.deepEqual(result.recentSessions[0], sessionIds[1]);
                    assert.deepEqual(result.recentSessions[1], sessionIds[0]);
                    done();
                });
            });
            // test adding duplicate recent session
            it('should not return error when adding duplicate session', function (done) {
                User.addRecentSession('456', sessionIds[0], function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.recentSessions.length, 2);
                    assert.deepEqual(result.recentSessions[0], sessionIds[0]);
                    assert.deepEqual(result.recentSessions[1], sessionIds[1]);
                    done();
                });
            });
            // test adding more than max recent sessions
            it('should not return error when adding more than max num of sessions', function (done) {
                User.addRecentSession('456', sessionIds[0], function(err, result) {
                    User.addRecentSession('456', sessionIds[1], function(err, result) {
                        User.addRecentSession('456', sessionIds[2], function(err, result) {
                            User.addRecentSession('456', sessionIds[3], function(err, result) {
                                User.addRecentSession('456', sessionIds[4], function(err, result) {
                                    assert.equal(result.recentSessions.length, 5);
                                    assert.deepEqual(result.recentSessions[0], sessionIds[4]);
                                    User.addRecentSession('456', sessionIds[5], function(err, result) {
                                        assert.equal(result.recentSessions.length, 5);
                                        assert.deepEqual(result.recentSessions[0], sessionIds[5]);
                                        assert.deepEqual(result.recentSessions[4], sessionIds[1]);
                                        assert.equal(result.recentSessions.indexOf(sessionIds[0]), -1);
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });

            // test deleting fake sessions
            it('should delete fake sessions used', function (done) {
                Session.remove({number: 'fakecoursenum'}, function(err, result) {
                    assert.equal(err, null);
                    done();
                });
            });
        });
    });


    // test course model
    describe('Course', function() {

        //test findCourse
        describe('#findCourse', function () {
            // test nonexistent course
            it('should return error when course does not exist', function (done) {
                Course.findCourse('hello', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test existing course
            it('should not return error when course exists', function (done) {
                Course.findCourse('6.170', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.meta.name, 'Software Studio');
                    assert.deepEqual(result.sessions, []);
                    done();
                });
            });
        });

        //test getAllCourses
        describe('#getAllCourses', function () {
            // test correct
            it('should not return error', function (done) {
                Course.getAllCourses(function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.courses.length, 2);
                    done();
                });
            });
        });

        //test getCoursesByUser (also tested indirectly by subscribe and unsubscribe)
        describe('#getCoursesByUser', function () {
            // test invalid user
            it('should return error when nonexistent user', function (done) {
                Course.getCoursesByUser('blahblh', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test valid user
            it('should return courses when valid user', function (done) {
                Course.getCoursesByUser('kim', function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result.courses, {});
                    done();
                });
            });
        });

        //test subscribeUser
        describe('#subscribeUser', function () {
            // test invalid username
            it('should return error when nonexistent user', function (done) {
                Course.subscribeUser('baba', '6.170', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test invalid course
            it('should return error when nonexistent course', function (done) {
                Course.subscribeUser('kim', '6.173', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test valid subscription
            it('should not return error when valid', function (done) {
                Course.subscribeUser('kim', '6.170', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.courses.length, 1);
                    assert.equal(result.courses[0].name, 'Software Studio');
                    User.findProfile('kim', function(err, result) {
                        assert.equal(result.courses.length, 1);
                        assert.deepEqual(result.courses[0], courseId1);
                        done();
                    });
                });
            });
        });

        //test unsubscribeUser
        describe('#unsubscribeUser', function () {
            // test invalid username
            it('should return error when nonexistent user', function (done) {
                Course.unsubscribeUser('baba', '6.170', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test invalid course
            it('should return error when nonexistent course', function (done) {
                Course.unsubscribeUser('kim', '6.173', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test invalid course
            it('should return error when user not subscribed to course', function (done) {
                Course.unsubscribeUser('kim', '6.005', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test valid unsubscribe
            it('should not return error when valid', function (done) {
                Course.subscribeUser('kim', '6.005', function(err, result) {
                    Course.unsubscribeUser('kim', '6.005', function(err, result) {
                        assert.equal(err, null);
                        assert.equal(result.courses.length, 1);
                        assert.equal(result.courses[0].name, 'Software Studio');
                        done();
                    });
                });
            });
        });

        //test addSession
        describe('#addSession', function () {
            // test new session
            it('should not return error when adding valid session', function (done) {
                Course.addSession('6.170', 'Lecture 1', 'kim', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.title, 'Lecture 1');
                    assert.equal(result.number, '6.170');
                    sessionId1 = result._id;
                    Course.findCourse('6.170', function(err, result) {
                        assert.equal(result.sessions.length, 1);
                        done();
                    })
                });
            });
        });
    });

    // test session model
    describe('Session', function() {

        //test create
        describe('#create', function () {
            it('should not return error when creating', function (done) {
                Session.create('6.005', 'Lecture 3', 'kim', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.title, 'Lecture 3');
                    sessionId2 = result._id;
                    done();
                });
            });
        });

        //test findSession
        describe('#findSession', function () {
            // test nonexistent session
            it('should return error when session does not exist', function (done) {
                Session.findSession('blah', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });

            // test existing session; depends on addSession of Course tests
            it('should not return error when session exists', function (done) {
                Session.findSession(sessionId1, function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.meta.title, 'Lecture 1');
                    assert.deepEqual(result.feed, []);
                    done();
                });
            });
        });

        //test getSessionsByUser
        describe('#getSessionsByUser', function () {
            //test invalid username
            it('should return error when invalid username', function (done) {
                Session.getSessionsByUser('fakeuser', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            //test valid user
            it('should return error when invalid username', function (done) {
                User.addRecentSession('kim', sessionId1, function(err, result) {
                    User.addRecentSession('kim', sessionId2, function(err, result) {
                        Session.getSessionsByUser('kim', function(err, result) {
                            assert.equal(err, null);
                            assert.equal(result.recentSessions.length, 2);
                            assert.equal(result.recentSessions.filter(function(item) {
                                return item.meta.number === '6.005' && item.index === 0
                            }).length, 1);
                            assert.equal(result.recentSessions.filter(function(item) {
                                return item.meta.number === '6.170' && item.index === 1
                            }).length, 1);
                            done();
                        });
                    });
                });
            });
         });

        //test addStash
        describe('#addStash', function () {
            // test adding stash with invalid session id
            it('should return error when invalid session id', function (done) {
                Session.addStash('blah', 'kim', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test adding stash with valid session id and user
            it('should not return error when valid user', function (done) {
                Session.addStash(sessionId1, 'kim', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.creator, 'kim');
                    assert.equal(result.snippets.length, 0);
                    stashId1 = result._id;
                    done();
                });
            });

            // test existing stash
            it('should return error when user stash exists', function (done) {
                Session.addStash(sessionId1, 'kim', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
        });

        //test addSnippet
        describe('#addSnippet', function () {
            // test adding with invalid session id
            it('should return error when invalid session id', function (done) {
                Session.addSnippet('blah', 'kim', 'hihihsnippet 123', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test adding when user has no stash
            it('should return error when user has no stash', function (done) {
                Session.addSnippet(sessionId1, '123', 'hihihsnippet 123', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test adding valid snippet 1
            it('should not return error when valid session', function (done) {
                Session.addSnippet(sessionId1, 'kim', 'snippet test text', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.author, 'kim');
                    assert.equal(result.text, 'snippet test text');
                    snippetId1 = result._id;
                    Session.findSession(sessionId1, function(err, result) {
                        assert.equal(result.feed.length, 1);
                        assert.equal(result.feed[0].author, 'kim');
                        assert.equal(result.feed[0].sessionId, sessionId1);
                        User.findProfile('kim', function(err, result) {
                            assert.equal(result.stats.numSubmitted, 1);
                            assert.equal(result.stats.numSaved, 1);
                            done();
                        });
                    });
                });
            });
            // test adding valid snippet 2 and saving snippet to stash
            it('should not return error and should save snippet to user stash', function (done) {
                Session.addSnippet(sessionId1, 'kim', 'snippet 2', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.author, 'kim');
                    assert.equal(result.text, 'snippet 2');
                    assert.equal(result.savedBy.length, 1);
                    assert.equal(result.savedBy[0], 'kim');
                    snippetId2 = result._id;
                    Session.findSession(sessionId1, function(err, result) {
                        assert.equal(result.feed.length, 2);
                        assert.notEqual(result.feed[0]._id, result.feed[1]._id);
                        User.findProfile('kim', function(err, result) {
                            assert.equal(result.stats.numSubmitted, 2);
                            done();
                        });
                    });
                });
            });
        });
    });

    // test stash model
    describe('Stash', function() {

        //test getStash
        describe('#getStash', function () {
            // test nonexistent stash
            it('should return error when stash does not exist', function (done) {
                Stash.getStash('blah', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test existing stash
            it('should not return error when stash exists', function (done) {
                Stash.getStash(stashId1, function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.creator, 'kim');
                    assert.equal(result.snippets.length, 2);
                    done();
                });
            });
        });

        //test create
        describe('#create', function () {
            // test valid new stash
            it('should not return error when stash does not exist', function (done) {
                Stash.create('123', sessionId1, 'Lecture 1', '6.170', function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.creator, '123');
                    assert.equal(result.snippets.length, 0);
                    stashId2 = result._id;
                    done();
                });
            });
        });

        //test findByStashId
        describe('#findByStashId', function () {
            // test invalid session
            it('should return error when invalid id', function (done) {
                Stash.findByStashId('fakeid', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test valid stash id
            it('should not return error when valid stash id', function (done) {
                Stash.findByStashId(stashId2, function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result._id, stashId2);
                    done();
                });
            });
        });

        //test findBySessionAndUsername
        describe('#findBySessionAndUsername', function () {
            // test invalid session
            it('should return error when invalid session', function (done) {
                Stash.findBySessionAndUsername('blah', 'kim', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test invalid user
            it('should return error when invalid username', function (done) {
                Stash.findBySessionAndUsername(sessionId1, '456', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test valid stash
            it('should not return error when valid username-session pair', function (done) {
                Stash.findBySessionAndUsername(sessionId1, '123', function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result._id, stashId2);
                    done();
                });
            });
        });

        //test saveSnippet
        describe('#saveSnippet', function () {
            // test invalid snippet id
            it('should return error when invalid snippet id', function (done) {
                Stash.saveSnippet('blah', stashId2, function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test invalid stash id
            it('should return error when invalid stash id', function (done) {
                Stash.saveSnippet(snippetId1, 'blah', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test duplicate save
            it('should return error when snippet already in stash', function (done) {
                Stash.saveSnippet(snippetId1, stashId1, function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test valid save
            it('should not return error when valid save', function (done) {
                Stash.saveSnippet(snippetId1, stashId2, function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result._id, stashId2);
                    Snippet.findSnippet(snippetId1, function(err, result) {
                        assert.equal(result.savedBy.length,2);
                        assert.notEqual(result.savedBy[0], result.savedBy[1]);
                        User.findProfile('123', function(err, result) {
                            assert.equal(result.stats.numSaved, 1);
                            done();
                        });
                    });
                });
            });
        });

        //test removeSnippet
        describe('#removeSnippet', function () {
            // test invalid snippet id
            it('should return error when invalid snippet id', function (done) {
                Stash.removeSnippet('blah', stashId2, function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test invalid stash id
            it('should return error when invalid stash id', function (done) {
                Stash.removeSnippet(snippetId1, 'blah', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test nonexistent snippet in stash
            it('should return error when snippet not in stash', function (done) {
                Stash.removeSnippet(snippetId2, stashId2, function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test valid remove
            it('should not return error when valid removal', function (done) {
                Stash.removeSnippet(snippetId1, stashId2, function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result._id, stashId2);
                    Snippet.findSnippet(snippetId1, function(err, result) {
                        assert.equal(result.savedBy.length,1);
                        assert.equal(result.savedBy[0], 'kim');
                        User.findProfile('123', function(err, result) {
                            assert.equal(result.stats.numSaved, 0);
                            done();
                        });
                    });
                });
            });
        });
    });

    // test snippet model
    describe('Snippet', function() {

        //test findSnippet
        describe('#findSnippet', function () {
            // test nonexistent snippet
            it('should return error when snippet does not exist', function (done) {
                Snippet.findSnippet('blah', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test snippet1
            it('should not return error when snippet does exist', function (done) {
                Snippet.findSnippet(snippetId1, function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.text, 'snippet test text');
                    assert.equal(result.sessionId, sessionId1)
                    done();
                });
            });
            // test snippet2
            it('should return correct snippet', function (done) {
                Snippet.findSnippet(snippetId2, function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result.text, 'snippet 2');
                    assert.equal(result.sessionId, sessionId1)
                    done();
                });
            });
        });

        //test create
        describe('#create', function () {
            // test nonexistent snippet
            it('should be tested in Session.addSnippet', function (done) {
                done();
            });
        });

        //test flagSnippet
        describe('#flagSnippet', function() {
            // test invalid snippet id
            it('should return error when invalid snippet id', function(done) {
                Snippet.flagSnippet('blah', 'kim', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test user attempt to flag own snippet
            it('should return error when user tries to flag own snippet', function(done) {
                Snippet.flagSnippet(snippetId1, 'kim', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
            // test non-author user flag a snippet
            it('should not return error when valid flag', function(done) {
                Snippet.flagSnippet(snippetId1, '123', function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result._id, snippetId1);
                    Snippet.findSnippet(snippetId1, function(err, result) {
                        assert.equal(result.flaggedBy.length, 1);
                        assert.equal(result.flaggedBy[0], '123');
                        done();
                    });
                });
            });
            // test another valid flag
            it('should not return error when valid flag', function(done) {
                Snippet.flagSnippet(snippetId1, '456', function(err, result) {
                    assert.equal(err, null);
                    assert.deepEqual(result._id, snippetId1);
                    Snippet.findSnippet(snippetId1, function(err, result) {
                        assert.equal(result.flaggedBy.length, 2);
                        assert.equal(result.flaggedBy[1], '456');
                        assert.notEqual(result.flaggedBy[0], result.flaggedBy[1]);
                        done();
                    });
                });
            });
            // test duplicate flag
            it('should return error when snippet already flagged by user', function(done) {
                 Snippet.flagSnippet(snippetId1, '456', function(err, result) {
                    assert.notEqual(err, null);
                    done();
                });
            });
        });
    });

    // visually inspect model
    describe.skip('Model', function() {
        // view users
        it('display all users', function (done) {
            User.find({}, function(err, result) {
                console.log('------ USERS ------');
                console.log(result);
                done();
            })
        });
        // view courses
        it('display all courses', function (done) {
            Course.find({}, function(err, result) {
                console.log('------ COURSES ------');
                console.log(result);
                done();
            })
        });
        // view sessions
        it('display all sessions', function (done) {
            Session.find({}, function(err, result) {
                console.log('------ SESSIONS ------');
                console.log(result);
                done();
            })
        });
        // view stashes
        it('display all stashes', function (done) {
            console.log('------ STASHES ------');
            Stash.find({}, function(err, result) {
                console.log(result);
                done();
            })
        });
        // view snippets
        it('display all snippets', function (done) {
            console.log('------ SNIPPETS ------');
            Snippet.find({}, function(err, result) {
                console.log(result);
                done();
            })
        });
    });
});
