const  mongoose = require('mongoose');
const { execSync } = require('child_process');

const JackNodesSchema = new mongoose.Schema({
  user: {trype: String},
  name: {type: String, unique: true},
  url: {type: String, unique: true},
  sshPort: {type: Number, default: 22},
  refrechTime: {type: Number, default: 5000},
  status: {
    lastUpdate: {type: Number},
    jack: {type: Object},
    ssh: {type: Object},
    availability: {type: Object }
  }
});


JackNodesSchema.methods.configureNode = function(password) {
  let sendSSHKey = `#!/bin/sh
    sshpass -p ${password} ssh-copy ${this.user}@${this.url}
  `;

};

JackNodesSchema.methods.checkNode = function() {
  console.log("chenking server...");
};


const JackNodes = mongoose.model('JackNodes', JackNodesSchema);

module.exports = JackNodes;
