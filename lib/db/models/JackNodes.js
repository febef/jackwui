const  mongoose = require('mongoose');

const JackNodesSchema = new mongoose.Schema({
  name: String,
  url: String,
  user: String
});

const JackNodes = mongoose.model('jackNodes', JackNodesSchema);

module.exports = JackNodes;
