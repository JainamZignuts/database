/**
 * Connections.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const { DATABASE_NAMES } = sails.config.constants;
module.exports = {
  attributes: {
    id: {
      type: "string",
      required: true,
      unique: true,
      columnType: "varchar(40)",
    },
    url: {
      type: "string",
      required: true,
      unique: true,
      columnType: "varchar(255)",
    },
    name: {
      type: "string",
      required: true,
      columnType: "varchar(128)",
    },
    host: {
      type: "string",
      required: true,
      columnType: "varchar(255)",
    },
    port: {
      type: "number",
      required: true,
      columnType: "int(6)",
    },
    user: {
      type: "string",
      required: true,
      columnType: "varchar(128)",
    },
    password: {
      type: "string",
      required: true,
      columnType: "varchar(255)",
    },
    databaseName: {
      type: "string",
      required: true,
      columnType: "varchar(128)",
      columnName: "database_name",
    },
    databaseType: {
      type: "string",
      required: true,
      // columnType: "enum",
      isIn: [DATABASE_NAMES.MYSQL, DATABASE_NAMES.POSTGRES],
      columnName: "database_type",
    },
  },
};
