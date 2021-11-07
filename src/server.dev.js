"use strict";

var _mongodb = require("mongodb");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var express = require('express');

var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();
app.use(express["static"](_path["default"].join(__dirname, '/build')));
app.use(bodyParser.json());
app.use(cors());

var withDB = function withDB(operations, res) {
  var client, db;
  return regeneratorRuntime.async(function withDB$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(_mongodb.MongoClient.connect('mongodb://localhost:27017', {
            useNewUrlParser: true
          }));

        case 3:
          client = _context.sent;
          //create a client with the connection address
          db = client.db('my-bloc'); //create database object

          _context.next = 7;
          return regeneratorRuntime.awrap(operations(db));

        case 7:
          client.close(); //to close the client

          _context.next = 13;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            message: 'something went wrong',
            error: _context.t0
          });

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

app.get('/api/articles/:name', function _callee2(req, res, next) {
  return regeneratorRuntime.async(function _callee2$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          withDB(function _callee(db) {
            var articleName, articleInfo;
            return regeneratorRuntime.async(function _callee$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    //takes callback 'operations function' defined below on db
                    articleName = req.params.name;
                    _context2.next = 3;
                    return regeneratorRuntime.awrap(db.collection('articles').findOne({
                      name: articleName
                    }));

                  case 3:
                    articleInfo = _context2.sent;
                    //queries the db object specific collection 'articles' to find a name matching the one given (in this cae the params variable set up )
                    res.status(200).json(articleInfo); //to return in json      

                  case 5:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          }, res); //note res object as per our withDB function. need to pass it anywhere that withDB(operations, res) is used.

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
});
app.post('/api/articles/:name/upvote', function _callee4(req, res, next) {
  return regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          withDB(function _callee3(db) {
            var articleName, articleInfo, updatedArticleInfo;
            return regeneratorRuntime.async(function _callee3$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    articleName = req.params.name;
                    _context4.next = 3;
                    return regeneratorRuntime.awrap(db.collection('articles').findOne({
                      name: articleName
                    }));

                  case 3:
                    articleInfo = _context4.sent;
                    _context4.next = 6;
                    return regeneratorRuntime.awrap(db.collection('articles').updateOne({
                      name: articleName
                    }, //update the valule of the 'upvotes' property use updateOne() method
                    {
                      '$set': {
                        //'$set' in single quotes is specific syntax for mongodb to update item. which is added as second argument in the updateOne() parameter
                        upvotes: articleInfo.upvotes + 1
                      }
                    }));

                  case 6:
                    _context4.next = 8;
                    return regeneratorRuntime.awrap(db.collection('articles').findOne({
                      name: articleName
                    }));

                  case 8:
                    updatedArticleInfo = _context4.sent;
                    res.status(200).json(updatedArticleInfo);

                  case 10:
                  case "end":
                    return _context4.stop();
                }
              }
            });
          }, res);

        case 1:
        case "end":
          return _context5.stop();
      }
    }
  });
});
app.post('/api/articles/:name/add-comment', function (req, res, next) {
  var _req$body = req.body,
      username = _req$body.username,
      text = _req$body.text;
  var articleName = req.params.name;
  withDB(function _callee5(db) {
    var articleInfo, updatedArticleInfo;
    return regeneratorRuntime.async(function _callee5$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return regeneratorRuntime.awrap(db.collection('articles').findOne({
              name: articleName
            }));

          case 2:
            articleInfo = _context6.sent;
            _context6.next = 5;
            return regeneratorRuntime.awrap(db.collection('articles').updateOne({
              name: articleName
            }, {
              '$set': {
                comments: articleInfo.comments.concat({
                  username: username,
                  text: text
                })
              }
            }));

          case 5:
            _context6.next = 7;
            return regeneratorRuntime.awrap(db.collection('articles').findOne({
              name: articleName
            }));

          case 7:
            updatedArticleInfo = _context6.sent;
            res.status(200).json(updatedArticleInfo);

          case 9:
          case "end":
            return _context6.stop();
        }
      }
    });
  }, res);
});
app.post('/hello', function (req, res, next) {
  res.send("Hello ".concat(req.body.name, "!"));
});
app.get('*', function (req, res, next) {
  res.sendFile(_path["default"].join(__dirname + '/build/index.html'));
});
app.listen(8000, function () {
  console.log('listening on port 8000');
});