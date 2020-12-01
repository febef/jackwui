
const Express = require('express');
const ExpressSesion = require('express-session');
const MongoStore = require("connect-mongo")(ExpressSesion);
const ExpressRateLimitRate = require('express-rate-limit');

const sassMiddleware = require('node-sass-middleware');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const csrf = require('csurf');
const hpp = require('hpp');
const xssClean = require('xss-clean');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const db = require('./db');
const routes = require('./routes');
const { ADDRGETNETWORKPARAMS } = require('dns');

const app = Express();

const limiter = ExpressRateLimitRate({
  max: 100,// max requests
  windowMs: 60 * 60 * 1000, // 1 Hour of 'ban' / lockout
  message: 'Too many requests' // message to send
});

const csrfProtection = csrf({ cookie: true });
//app.get('/form', csrfProtection, function (req, res) {
// pass the csrfToken to the view
//  res.render('send', { csrfToken: req.csrfToken() })
//})

const expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // 1 hour

const expressSesion = ExpressSesion({
  name: 'session',
  secret: 's3cr37',
  /*keys: ['key1', 'key2'],
  cookie: { secure: true,
    httpOnly: true,
    domain: 'example.com',
    path: 'foo/bar',
    expires: expiryDate
  },*/
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: db.mongoose.connection })
});

app.use('/css', sassMiddleware({
  src: path.join(__dirname, '../usr/styles'),
  dest: path.join(__dirname,'../usr/public/css'),
  debug: true,
  outputStyle: 'expanded'
}));

app.set('db', db);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../usr/views/pages'));
app.use(Express.static(path.join(__dirname, '../usr/public')));

app.disable('x-powered-by');
app.use(expressSesion);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(Express.json({ limit: '10kb' }));
app.use(compression());
app.use(helmet());
app.use(xssClean());
app.use(hpp());

const passport = require('./passport')(app);

app.use('/', routes);

db.connect({
  host: '10.0.0.2',
  port: '27017',
  user: 'root',
  password: 'toor',
  dbName: 'jackwui'
});
db.mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
db.mongoose.connection.once('open', () => {
  console.log("mongoDB connected.")
  db.models.Users.syncLDAP(console.log);

  // let oneServer = new db.models.JackServers({
  //   name: "artwo", url: "path.tech", user: "jack"
  //});
  // oneServer.save();

});

exports.app = app;
