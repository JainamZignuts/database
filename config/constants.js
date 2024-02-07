const VALIDATOR = require("validatorjs");
const MYSQL = require("mysql2/promise");
let { Pool } = require("pg");

const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500,
};

const REGEX = {
  MYSQL: /^mysql:\/\/\S+:\S+@\S+:\d+\/\S+$/,
  POSTGRES: /^postgresql:\/\/\S+:\S+@\S+:\d+\/\S+$/,
};

const DATABASE_NAMES = {
  MYSQL: "mysql",
  POSTGRES: "postgres",
};

const KEYWORDS = {
  BASE_TALE: "BASE TABLE",
  VIEW: "VIEW",
};

module.exports.constants = {
  HTTP_STATUS_CODE,
  VALIDATOR,
  MYSQL,
  POOL: Pool,
  REGEX,
  DATABASE_NAMES,
  KEYWORDS,
};
