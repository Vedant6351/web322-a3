const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    port: process.env.PGPORT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false, // remove noisy SQL logs
  }
);

async function connectPostgres() {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected (Sequelize)");
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err.message);
  }
}

module.exports = { sequelize, connectPostgres };
