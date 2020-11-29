
const  mongoose = require('mongoose');

const  path = require('path');
const  fs = require('fs');

const modelsRoot = path.join(__dirname, 'models');

let db = {
  mongoose, modelsRoot, models: {},
};

db.connect = function({ user, password, host, port, dbName }){
  const connectionString =
    "mongodb://" + user + ":" + password + "@" + host + ":" + port
    + "/" + dbName +"?retryWrites=true&w=majority&authSource=admin";
  mongoose.connect( connectionString, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

fs
 .readdirSync(modelsRoot)
 .filter(file => (file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))
 .forEach((file) => {
  const model = require(path.join(modelsRoot, file));
  db.models[file.split('.js')[0]] = model;
 });

 module.exports = db;
