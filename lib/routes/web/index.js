
console.log(__dirname)
const db = require("../../db");
const { Router } = require('express');

const r =  Router();
r.get('/', async (req, res) => {
  let nodes = await db.models.JackNodes.find({}).exec();
  res.render('home', {user: req.user._doc, nodes: await nodes});
});

r.get('/login', (req, res) => {
  res.render('login')
});

r.get('/node/:NodeName', async (req, res) => {
  let nodes = await db.models.JackNodes.find({name: req.params.NodeName});
  let node = (await nodes)[0];
  res.render('node', {user: req.user._doc, node});
});

r.get('/node/:NodeName/connections', async (req, res) => {
  let nodes = await db.models.JackNodes.find({name: req.params.NodeName});
  let node = (await nodes)[0];
  console.log(node);
  let connections = node.connections;
  res.render('nodeConnections', {user: req.user._doc, node, connections});
});

/*r.get('/:page', (req, res) => {
  res.render(req.params.page);
});*/


r.get('/addnode', (req, res) => {
  res.render('addNode', {user: req.user._doc});
});

r.post('/addnode', (req, res) => {

  console.log("BODY:", req.body);

  let newNode = db.models.JackNodes({
    name: req.body.name,
    uri: req.body.uri,
    user: req.body.user
  });
  newNode.save(err => {
    let ret;
    if(!err){
      ret = newNode.setupSSHKey(req.body.password);
    } else {
      console.log(err);
      ret = false;
    }
    res.json({success: ret});
  });

});

module.exports = r;
