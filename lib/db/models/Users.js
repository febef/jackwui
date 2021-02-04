const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const ldap = require('ldapjs');
let Users;

// Create Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  date: { type: Date, default: Date.now },
  ldapDN: { type: String, default: null },
  groups : [{ type: String , default: 'users'}]
}, { strict: false });


const queryLDAPSubs = function(query, filter, cb){

  const opts = { filter: filter, scope: 'sub'};
  const ret = { entrys: [], refs: [], status: {} };
  const client = ldap.createClient({
    url: 'ldap://10.0.0.2:389'
  });

  client.bind('cn=readonly,dc=artwo,dc=sytes,dc=net', 'readonly', (err) => {
    if(err) { console.log("Ldap sync error!\n", err); cb(err,null);}
  });

  client.search(query, opts, function(err, res) {
    if (err) { console.error('ERROR:',err); cb(err, null);}
    res.on('searchEntry', function(entry) {
      //console.log('ldap entry: ' + JSON.stringify(entry.object));
      ret.entrys.push(entry.object);
    });
    res.on('searchReference', function(referral) {
      //console.log('ldap referral: ' + referral.uris.join());
      ret.refs.push(referral.join())
    });
    res.on('error', function(err) {
      //console.error('ldap error: ' + err.message);
      cb(err, null)
    });
    res.on('end', function(result) {
      //console.log('ldap status: ' + result.status);
      ret.status = result;
      cb(null, ret);
    });
  });
}

UserSchema.statics.authStrategy = function UserLocalStrategy(username, password, done, syncLDAP=true) {

  Users
  .findOne({ name: username })
  .then(user => {
    if (!user) return Users.syncLDAP(() => UserLocalStrategy(username, password, done, false) );
    if (user.ldapDN) {
     // const opts = { filter: filter, scope: 'sub'};
     // const ret = { entrys: [], refs: [], status: {} };
      const client = ldap.createClient({ url: 'ldap://10.0.0.2:389' });
      client.bind(user.ldapDN, password, (err) => {
        if(err) {
          if (syncLDAP) return Users.syncLDAP(() => UserLocalStrategy(username, password, done, false));
          else return done(err, null)
        }
        return done(null, user);
      });
    } else {
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (!err && isMatch) return done(null, user);
        else return done(err, false, {});
      });
    }
  })
  .catch(err => done(null, false, { message: err }));
};

UserSchema.statics.syncLDAP = function(cb){
  queryLDAPSubs('cn=jackwui,ou=groups,dc=artwo,dc=sytes,dc=net', '(cn=*)', (err, {entrys: groups}) => {
    queryLDAPSubs('ou=users,dc=artwo,dc=sytes,dc=net', '(uid=*)', (err, {entrys: users}) => {

      if (err) cb(err);
      let gitSnackUsers = {};

      users.forEach( u => { for(g of groups) {
          if (g.memberUid == u.uid || g.memberUid.indexOf(u.uid)>-1) {
            if (!gitSnackUsers[u.uid]) gitSnackUsers[u.uid] = u;
            if(gitSnackUsers[u.uid].groups) {
              if (gitSnackUsers[u.uid].groups.indexOf(u.uid)==-1)
              gitSnackUsers[u.uid].groups.push(g.cn);
            } else gitSnackUsers[u.uid].groups = [g.cn];
          }
        }
      });

      for(p in gitSnackUsers){
        let u = gitSnackUsers[p];
        Users.findOne({name: u.uid}, (err, lu) => {
          if (lu){
            lu.ldapDN = u.dn;
            lu.groups = u.groups;
            lu.email = u.mail;
            lu.save();
            cb("ldap sync usr: " + lu.name);
          } else {
            let nu = new Users({
              name: u.uid,
              groups: u.groups,
              ldapDN: u.dn,
              email: u.mail
            });
            nu.save()
            cb("ldap sync usr: " + nu.name);
          }
        });
      }
    });
  });
};

module.exports = Users = mongoose.model("users", UserSchema);
