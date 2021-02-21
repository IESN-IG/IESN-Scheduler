const fastify = require('fastify')();
const path = require('path');
const autoload = require('fastify-autoload');
const { initDatabase } = require('./lib/db');
const { updateClassesCodes } = require('./lib/portail');
require("dotenv").config();

fastify.register(autoload,{
    dir: path.join(__dirname, 'routes')
});

fastify.register(require('fastify-axios'));

const start = async () => {
    try {
        await fastify.listen(process.env.PORT);
    } catch (err) {
        console.error(err);
        fastify.log.error(err);
        process.exit(1);
    }
};

const loadDefaultData = () => {
    initDatabase();
    updateClassesCodes(true);
};

loadDefaultData();
start();