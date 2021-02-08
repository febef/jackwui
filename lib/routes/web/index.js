
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

r.get('/node/:NodeName', async (req, res) => {
  node = await db.models.JackNodes.find({name: req.params.NodeName});
  res.render('node', {user: req.user._doc, node: await node});
});

/*r.get('/:page', (req, res) => {
  res.render(req.params.page);
});*/


r.get('/addnode', (req, res) => {
  res.render('addNode', {user: req.user._doc});
});

r.post('/addnode', (req, res) => {

  const newNode = db.models.JackNodes({
    name: req.body.name,
    uri: req.body.uri,
    user: req.body.user
  });
  newNode.save(err => {
    let ret = newNode.setupSSHKey(req.body.password);
    res.json({success: ret});
  });

});

module.exports = r;
