
const { Router } = require('express');

const r =  Router();

//r.use('/api', require('./api'));
r.use('/', require('./web'));

module.exports = r;
