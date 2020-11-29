
const { Router } = require('express');

const r =  Router();

r.get('/', (req, res) => {
  res.render('home', {user: req.user._doc});
});

r.get('/login', (req, res) => {
  res.render('login')
});

/*r.get('/:page', (req, res) => {
  res.render(req.params.page);
});*/

module.exports = r;
