var createError = require('http-errors');//Used to create HTTP errors for Express applications.
var express = require('express');// The main Express.js framework.
var path = require('path');//A Node.js core module used for handling file and directory paths.
var cookieParser = require('cookie-parser');//Middleware to parse cookies attached to the client request object
var logger = require('morgan');//Middleware for logging HTTP requests and errors.
var exphbs = require('express-handlebars');//Handlebars view engine for Express.js, allowing you to use Handlebars templates.
var userRouter = require('./routes/user');//These lines use Node.js require() function to import the router modules (user.js and admin.js) into your main application file (app.js).
var adminRouter = require('./routes/admin');
var app = express(); //express() is a function provided by the Express.js framework. When called, it creates a new Express application.var app declares a variable named app and assigns the newly created Express application instance to it.
var fileUpload=require('express-fileupload')// middleware for handling file uploads in Express applications. 


// view engine setup .configures Express to use Handlebars (hbs) as the templating engine and sets the directory where your views (templates) are located.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', exphbs.engine({ //This line sets up a new view engine for your Express app.app.engine is a method provided by Express to define a new template engine.'hbs' is the file extension for Handlebars templates that you want to use.exphbs.engine({...}) initializes the Handlebars engine with some configuration options.
  extname: 'hbs',  //specifies that the file extension for Handlebars templates will be .hbs.
  defaultLayout: 'layout', //sets the default layout template to layout.e layout template is a common structure (like a header and footer) that wraps around your main content.
  layoutsDir: __dirname + '/views/layout', //specifies the directory where your layout templates are stored.__dirname is a Node.js global variable that gives the directory name of the current module.
  partialsDir: __dirname + '/views/partials'//specifies the directory where your partial templates are stored.Partial templates are smaller pieces of a template that can be reused in different views, like a navigation bar or footer.
}));




app.use(logger('dev'));// Logging middleware for development environment
app.use(express.json());// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));// Middleware to parse URL-encoded bodies
app.use(cookieParser());// Middleware to parse cookies from HTTP headers
app.use(express.static(path.join(__dirname, 'public')));//Middleware to serve static files from the 'public' directory

app.use(fileUpload())


app.use('/', userRouter); //This line mounts the userRouter middleware at the root path ('/') of your application.
app.use('/admin', adminRouter);//This line mounts the adminRouter middleware at the /admin path of your application.

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
