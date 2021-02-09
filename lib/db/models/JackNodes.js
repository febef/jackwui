const  mongoose = require('mongoose');
const child_process = require('child_process');

const JackNodesSchema = new mongoose.Schema({
  user: {type: String},
  name: {type: String, unique: true},
  uri: {type: String, unique: true},
  refrechTime: {type: Number, default: 5000},
  status: {
    sync:{
      lastUpdate: {type: Number},
      nodeOk: {type: Boolean}
    },
    jack: {
      connections: [{
        type: { type: String},
        src: {type: String},
        dst: {type: String}
      }]
    },
    ssh: {
      sshPort: {type: Number, default: 22},
      key: {type: Boolean, default: false},
      keyUpdated: {type: Number}
    },
    availability: {type: Object }
  }
});

// chmod 0600 /opt/jackwui/usr/ssh/id_rsa && ssh -i /opt/jackwui/usr/ssh/id_rsa febef@10.0.0.10 -oStrictHostKeyChecking=no
JackNodesSchema.methods.setupSSHKey = function(password) {
  let hrTime = process.hrtime();
  hrtime = hrTime[0] * 1000000 + hrTime[1] / 1000;
  const skpath = '/opt/jackwui/usr/ssh/id_rsa';
  const spawned = child_process.spawnSync("bash", ["-c", [
    `sshpass -p ${password}`,
    `ssh-copy-id -f -i ${skpath} ${this.user}@${this.uri}`,
    `-o StrictHostKeyChecking=no`,
    `2>&1`
  ].join(" ")], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8'
  });

  console.log("REGISTY SSHKEY stdout:", ...spawned.output);

  this.status.ssh.keyUpdated = hrtime;

  if(!spawned.error) {

    console.log(`[Jackwui] Setup SSHKey on ${this.name} ok!`)
    this.status.ssh.key = true;
  } else {
    this.status.ssh.key = false;

    console.log(`[Jackwui] Setup SSHKey on ${this.name} Error!`)
    console.log(spawned.error, "\n", spawned.stderr);
  }

  return this.status.ssh.key;
};

JackNodesSchema.methods.getConnections = function() {
  console.log("get connections...");
  let connections = [];

  const skpath = '/opt/jackwui/usr/ssh/id_rsa';
  const spawned = child_process.spawnSync("bash", ["-c", [
    //`ssh-agent`,
    `ssh`,
    `-o StrictHostKeyChecking=no`,
    `-i ${skpath} ${this.user}@${this.uri}`,
    `jack_lsp -c -A`,
    `2>&1`
  ].join(" ")], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8'
  });

  console.log("GETCONNECTION stdout:", ...spawned.output);


  if(!spawned.error) {

    connections.push(...spawned.output);

    this.connections = connections;
    console.log(`[Jackwui] Sync Connections on ${this.name} ok!`)
  } else {
    this.connections = [];
    console.log(`[Jackwui] Sync Conenctions on ${this.name} Error!`)
    console.log(spawned.error, "\n", spawned.stderr);
    return false;
  }


};


JackNodesSchema.methods.checkNode = function() {
  console.log("chenking server...");
};

JackNodesSchema.methods.sync = function() {
  //console.log(`[Jackwui] NodeSync: ${this.name}`);
  let hrTime = process.hrtime();
  let hrtime = hrTime[0] * 1000000 + hrTime[1] / 1000;
  const skpath = '/opt/jackwui/usr/ssh/id_rsa';
  const spawned = child_process.spawnSync("bash", ["-c", [
    //`ssh-agent`,
    `ssh`,
    `-o StrictHostKeyChecking=no`,
    `-i ${skpath} ${this.user}@${this.uri}`,
    `'bash -c echo "hola mundo"'`,
    `2>&1`
  ].join(" ")], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8'
  });

  console.log("SYNC stdout:", ...spawned.output);

  this.getConnections();
  this.status.sync.lastUpdate = hrtime;

  if(!spawned.error) {
    this.status.sync.nodeOk = true;
    this.status.ssh.key = true;
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
