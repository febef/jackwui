const  mongoose = require('mongoose');
const child_process = require('child_process');

const fs = require('fs');

const JackwuiConfigsSchema = new mongoose.Schema({
  name: String
});

JackwuiConfigsSchema.methods.verifySSHKey = function() {
  console.log("[verifySSHKey] ...");
  const keys_files_exist =
    fs.existsSync("/opt/jackwui/usr/ssh/id_rsa.pub") &&
    fs.existsSync("/opt/jackwui/usr/ssh/id_rsa");

  if (!keys_files_exist) {
    if ( this.sshkeys &&
        this.sshkeys.public && this.sshkeys.public != "" &&
        this.sshkeys.private && this.sshkeys.private != ""
       ) {
      console.log("[verifySSHkey] recovering files from db...");
      const spawned = child_process.spawnSync("bash", [
        "-c", `mkdir -p /opt/jackwui/usr/ssh `
      ]);
      if (!spawned.error) {
        fs.writeFileSync("/opt/jackwui/usr/ssh/id_rsa.pub", this.sshkeys.public);
        fs.writeFileSync("/opt/jackwui/usr/ssh/id_rsa", this.sshkeys.private);
        const spawned = child_process.spawnSync("bash", [ "-c",
          `chmod 0600 /opt/jackwui/usr/ssh/id_rsa && chmod 0600 /opt/jackwui/usr/ssh/id_rsa.pub`
        ]);
      }else{
        console.log("[verifySSHkey] error to create route to sshkeys.");
      }
    } else {
      console.log("[verifySSHkey] don't have sshkeys.");
      return false;
    }
  } else if (!this.sshkeys || !this.sshkeys.public || !this.sshkeys.private) {
    console.log("[verifySSHkey] backup sshkeys on db...");
    const public  = fs.readFileSync('/opt/jackwui/usr/ssh/id_rsa.pub', 'utf8');
    const private = fs.readFileSync('/opt/jackwui/usr/ssh/id_rsa', 'utf8');

    const spawned = child_process.spawnSync("bash", [ "-c",
      `chmod 0600 /opt/jackwui/usr/ssh/id_rsa && chmod 0600 /opt/jackwui/usr/ssh/id_rsa.pub`
    ]);
    this.sshkeys = { private, public };
    this.save();

  }

  console.log("[verifySSHkey] ok!");
  return true;
};

JackwuiConfigsSchema.methods.createSSHKey = function() {
  console.log("[createSSHKey] meking new ssh keys...")
  const spawned = child_process.spawnSync("bash", [
    "-c",
    `mkdir -p /opt/jackwui/usr/ssh &&
     cd /opt/jackwui/usr/ssh &&
     ssh-keygen -t rsa -b 4096 -C jackwui@app -f ./id_rsa -q -P "" ;
     chmod 0600 -R /opt/jackwui/usr/ssh
    `
  ]);

  //console.log("[createSSHKey] stdout: ", spawned.stdout.toString());
  if(!spawned.error) {
    const public  = fs.readFileSync('/opt/jackwui/usr/ssh/id_rsa.pub', 'utf8');
    const private = fs.readFileSync('/opt/jackwui/usr/ssh/id_rsa', 'utf8');
    this.sshkeys = { private, public };
    this.save();
    console.log("[createSSHKey] created ok!");
  }
  else console.log("[createSSHKey] error: ", spawned.stderr.toString());
  return !spawned.error

};

const JackwuiConfigs = mongoose.model('jackwuiconfigs', JackwuiConfigsSchema);

module.exports = JackwuiConfigs;
