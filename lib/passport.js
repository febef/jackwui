module.exports = function(app) {
  const Users = require("./db/models/Users.js");
  const passport = require("passport");
  const LocalStrategy = require("passport-local").Strategy;

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {  app.use(passport.initialize());
    app.use(passport.session());
    app.get('db').models.Users.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use( new LocalStrategy({
    usernameField: "user",
    userpasswordField: "password"
  }, (u, p, d) => Users.authStrategy(u, p, d) ));

  app.post('/login', passport.authenticate('local',  { failureRedirect: '/login' }),
    function(req, res){
      res.redirect('/');
    }
  );

  app.use((req, res, next) => {
   console.log("SES:",req.session)
    if (!req.user && req.path != "/login")
      res.redirect("/login");
    else next();
  });

  //app.use(passport.initialize());
  //app.use(passport.session());

  return passport;
};
