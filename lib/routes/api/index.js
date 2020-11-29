

const { Router } = require('express');

const path = require('path');
const fs = require('fs');

const r =  Router();

fs
 .readdirSync(__dirname)
 .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js')&&(file.slice(-3) === '.js'))
 .forEach((file) => {
  const {r : router} = require(path.join(__dirname, file));
  r.use(file.split('.js')[0], router);
 });

exports.default = r;
