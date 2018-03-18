var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('express-flash');
var session = require('express-session');
var index = require('./routes/index');
var users = require('./routes/users');
var customers = require('./routes/customers');
var expressValidator = require('express-validator');
var methodOverride = require('method-override');

var connection  = require('express-myconnection'); 
var mysql = require('mysql');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret:"secretpass123456"}));
app.use(flash());
app.use(expressValidator());
app.use(methodOverride(function(req, res){
 if (req.body && typeof req.body == 'object' && '_method' in req.body) 
  { 
      var method = req.body._method;
      delete req.body._method;
      return method;
    } 
  }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*------------------------------------------
    connection peer, register as middleware
    type koneksi : single,pool and request 
-------------------------------------------*/
app.use(
    connection(mysql,{
        host: 'localhost',
        user: 'root', // your mysql user
        password : '', // your mysql password
        port : 3306, //port mysql
        database:'db_users' // your database name
    },'pool') //or single

);

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  port     : 3306,
  database : 'db_users'
});

connection.connect()

connection.query("SELECT *from tbl_users", function (err, rows, fields) {
  if (err) throw err

  console.log('The solution is: ', rows[0].username)
})

connection.end()

app.use('/', index);
app.use('/customers', customers);
app.use('/users', users);
app.use('/watchdog/:id/:username/:password/:full_name', function (req, res, next) {

var ambil_id = req.param('id');
var username = req.param('username');
//  var t = moment.duration(parseInt(req.param('uptime')), 'milliseconds')
  //var _message = req.param('ip') + " uptime " + t.hours() + "h " + t.minutes() + "m " + t.seconds() +"s";
  console.log("watchdog from " + ambil_id + username);
  res.send("You are alive!");
});

var requestTime = function (req, res, next) {
  req.requestTime = Date.now()
  next()
}

app.use(requestTime)

app.get('/time', function (req, res) {
  var responseText = 'Hello World!<br>'
  responseText += '<small>Requested at: ' + req.requestTime + '</small>'
  res.send(responseText)
})

app.get('/halo', function (req, res) {
  res.send('hello world')
})

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
