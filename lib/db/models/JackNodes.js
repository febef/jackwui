const  mongoose = require('mongoose');
const child_process = require('child_process');

const JackNodesSchema = new mongoose.Schema({
  user: {trype: String},
  name: {type: String, unique: true},
  uri: {type: String, unique: true},
  sshPort: {type: Number, default: 22},
  refrechTime: {type: Number, default: 5000},
  status: {
    sync:{
      lastUpdate: {type: Number},
      nodeOk: {type: Boolean}
    },
    jack: {type: Object},
    ssh: {type: Object},
    availability: {type: Object }
  }
});

// chmod 0600 /opt/jackwui/usr/ssh/id_rsa && ssh -i /opt/jackwui/usr/ssh/id_rsa febef@10.0.0.10 -oStrictHostKeyChecking=no
JackNodesSchema.methods.setupSSHKey = function(password) {
  const skpath = '/opt/jackwui/usr/ssh/id_rsa';
  const spawned = child_process.spawnSync("bash", ["-c", [
   // `sshpass -p ${password}`,
    `ssh-copy-id -f -i ${skpath} ${this.user}@${this.uri}`,
    `-o StrictHostKeyChecking=no`
  ].join(" ")]);

  if(!spawned.error) {
    console.log(`[setupSSHKey] on ${this.name} ok!`)
  } else {
    console.log(`[setupSSHKey] on ${this.name} Error!`)
    console.log(spawned.error, "\n", spawned.stderr);
    return false;
  }

  return true;
};

JackNodesSchema.methods.checkNode = function() {
  console.log("chenking server...");
};

JackNodesSchema.methods.sync = function() {
  //console.log(`[Jackwui] NodeSync: ${this.name}`);
  const hrTime = process.hrtime();
  const skpath = '/opt/jackwui/usr/ssh/id_rsa';
  const spawned = child_process.spawnSync("bash", ["-c", [
    //`ssh-agent`,
    `ssh`,
    `-o StrictHostKeyChecking=no`,
    `-i ${skpath} ${this.user}@${this.uri}`,
    `'bash -c echo "hola"'`
  ].join(" ")]);

  this.status.sync.lastUpdate = hrTime[0] * 1000000 + hrTime[1] / 1000;

  if(!spawned.error) {
    this.status.sync.nodeOk = true;
    console.log(`[Jackwui] NodeSync on ${this.name} ok!`)
  } else {
    this.status.sync.nodeOk = false;
    console.log(`[Jackwui] NodeSync on ${this.name} Error!`)
    console.log(spawned.error, "\n", spawned.stderr);
    return false;
  }

  this.save();
  return true;

};

const JackNodes = mongoose.model('JackNodes', JackNodesSchema);

module.exports = JackNodes;
