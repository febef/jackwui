const  mongoose = require('mongoose');

const JackServersSchema = new mongoose.Schema({
  name: String,
  url: String,
  user: String
});

const JackServers = mongoose.model('jackservers', JackServersSchema);

module.exports = JackServers;
