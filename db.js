const pgp = require("pg-promise")();

const db = pgp(process.env.POSTGRESQL_URI);

module.exports = db;
