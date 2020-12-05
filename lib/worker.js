const g = {};

const start = function(params) {
  for (p in params)
    g[p] = params[p];

  g.syncNodes = true;
  syncNodes();
};

const stop = function(){
  g.syncNodes = false;
};

const syncNodes = function(){
  g.db.models.JackNodes.find({}, (err, nodes) => {
    for (node of nodes) {
      node.sync();
    }
    if(g.syncNodes) setTimeout(syncNodes, 5000);
  });
};

module.exports = {
  start,
  stop
};
