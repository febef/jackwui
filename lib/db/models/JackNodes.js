const  mongoose = require('mongoose');
const child_process = require('child_process');

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


JackNodesSchema.methods.setupSSHKey = function(password) {
  const spawned = child_process.spawnSync("bash", [
    "-c",
    `sshpass -p ${password} ssh-copy-id -i /opt/jackwui/usr/ssh/id_rsa ${this.user}@${this.uri}`
  ]);

  if(spawned.error) {
    console.log(`[setupSSHKey] on ${this.name} ok!`)
  } else {
    console.log(`[setupSSHKey] on ${this.name} Error!`)
  }

};

JackNodesSchema.methods.checkNode = function() {
  console.log("chenking server...");
};

JackNodesSchema.methods.sync = function() {
  console.log(`[JackNode] sync: ${this.name}`);
};

const JackNodes = mongoose.model('JackNodes', JackNodesSchema);

module.exports = JackNodes;
