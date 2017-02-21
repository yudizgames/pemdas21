//Core Module
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer'); //For Send Mail
var cors = require('cors');
expressValidator = require('express-validator');
//Core Module


//Custom Module
var database = require("./config/database");
var cli = require("./config/config").console;
//Custom Module End

var app = express();
//Call Socket.io to this app
app.io = require('socket.io')();
// view engine setup
app.set('views', path.join(__dirname+'/client/'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//Access-Control-Allow-Origin
app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials",true);
    res.header("Access-Control-Allow-Methods","POST,GET,OPTIONS");
    next();
});

app.use(cors());
//nodemailer setup
var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'chetan.yadav@yudiz.com',
        pass: 'yudiz108'
    }
};
var mail = nodemailer.createTransport(smtpConfig);
//nodemailer setup end


//Add Super Secret Key
app.set('superSecret', 'premdasapp');

//Form body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(expressValidator());
//Game API
require("./server/routes/game")(app,cli,mail);
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.static(path.join(__dirname, 'node_modules')));

//Web API

require("./server/routes/web")(app,cli,mail);
// require("./server/modules/socket_test")(app,app.io);
require("./server/modules/socket_test_v1")(app,app.io);

//Running Code for Application Socket
// app.io.on('connection', function(socket){
//     console.log(socket);
//     cli.blue("User Socket Connected");
//     console.log('a user connected');
// });
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
