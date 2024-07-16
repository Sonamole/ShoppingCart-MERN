var createError = require('http-errors');//Used to create HTTP errors for Express applications.
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express(); //express() is a function provided by the Express.js framework. When called, it creates a new Express application.var app declares a variable named app and assigns the newly created Express application instance to it.

// view engine setup .configures Express to use Handlebars (hbs) as the templating engine and sets the directory where your views (templates) are located.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', exphbs.engine({ //This line sets up a new view engine for your Express app.app.engine is a method provided by Express to define a new template engine.'hbs' is the file extension for Handlebars templates that you want to use.exphbs.engine({...}) initializes the Handlebars engine with some configuration options.
  extname: 'hbs',  //specifies that the file extension for Handlebars templates will be .hbs.
  defaultLayout: 'layout', //sets the default layout template to layout.e layout template is a common structure (like a header and footer) that wraps around your main content.
  layoutsDir: __dirname + '/views/layout', //specifies the directory where your layout templates are stored.__dirname is a Node.js global variable that gives the directory name of the current module.
  partialsDir: __dirname + '/views/partials'//specifies the directory where your partial templates are stored.Partial templates are smaller pieces of a template that can be reused in different views, like a navigation bar or footer.
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
