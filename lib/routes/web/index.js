
console.log(__dirname)
const db = require("../../db");
const { Router } = require('express');

const r =  Router();
r.get('/', async (req, res) => {
  nodes = await db.models.JackNodes.find({}).exec();
  res.render('home', {user: req.user._doc, nodes: await nodes});
});

r.get('/login', (req, res) => {
  res.render('login')
});

/*r.get('/:page', (req, res) => {
  res.render(req.params.page);
});*/


r.get('/addnode', (req, res) => {
  res.render('addNode', {user: req.user._doc});
});

r.post('/addnode', (req, res) => {

//  const newNode = db.models.JackNodes({
//  });
//  newNode.save(err => {

    res.json({success: true, nodes: req.body});
//  });

});

module.exports = r;
