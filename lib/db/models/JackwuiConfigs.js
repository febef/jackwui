const  mongoose = require('mongoose');

const JackwuiConfigsSchema = new mongoose.Schema({
  name: String
});

const JackwuiConfigs = mongoose.model('jackwuiconfigs', JackwuiConfigsSchema);

module.exports = JackwuiConfigs;
