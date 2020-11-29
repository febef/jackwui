const  mongoose = require('mongoose');

const JackSerersSchema = new mongoose.Schema({
  name: String,
  url: String,
  user: String
});

const JackSerers = mongoose.model('JackSerers', JackSerersSchema);

exports.default = JackSerers;
