const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/postgres");

const Task = sequelize.define("Task", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
  },

  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  status: {
    type: DataTypes.ENUM("pending", "completed"),
    defaultValue: "pending",
  },

  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = Task;
