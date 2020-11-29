const  mongoose = require('mongoose');

const JackwuiConfigsSchema = new mongoose.Schema({
  name: String
});

const JackwuiConfigs = mongoose.model('JackwuiConfigs', JackwuiConfigsSchema);

exports.default = JackwuiConfigs;
