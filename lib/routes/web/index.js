
console.log(__dirname)
const db = require("../../db");
const { Router } = require('express');

const r =  Router();
r.get('/', async (req, res) => {
  servers = await db.models.JackServers.find({}).exec();
  console.log("SERVERS",servers);
  res.render('home', {user: req.user._doc, servers});
});

r.get('/login', (req, res) => {
  res.render('login')
});

/*r.get('/:page', (req, res) => {
  res.render(req.params.page);
});*/


r.get('/addServer', (req, res) => {
  res.render('addServer', {user: req.user._doc});
});

r.post('/addServer', (req, res) => {

  res.json({success: true, servers: req.body});
});

module.exports = r;
