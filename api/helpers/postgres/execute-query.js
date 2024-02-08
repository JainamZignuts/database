const { POOL } = sails.config.constants;
module.exports = {
  friendlyName: "Execute query",

  description: "",

  inputs: {
    connection: {
      friendlyName: "Connection",
      description: "Connection String",
      type: "string",
      required: true,
    },
    query: {
      friendlyName: "Query",
      description: "Query String",
      type: "string",
      required: true,
    },
    queryParams: {
      friendlyName: "Query Params",
      description: "Query Params",
      type: "json",
      defaultsTo: [],
    },
  },

  exits: {
    error: {
      code: "",
      errorMessage: "",
    },
    success: {
      code: "",
      data: [],
      errorMessage: "",
    },
  },

  fn: async function (inputs, exits) {
    let pool;
    try {
      const { connection, query, queryParams } = inputs;

      // Create a PostgreSQL connection pool
      pool = new POOL({ connectionString: connection });

      // Execute a sample query for PostgreSQL
      let result = await pool.query(query, queryParams);

      // Release the pool in case of an error
      if (pool) {
        await pool.end();
      }

      return exits.success({
        code: "01",
        data: result.rows.length > 0 ? result.rows : [],
      });
    } catch (error) {
      sails.log.error(error);
      // Release the pool in case of an error
      if (pool) {
        await pool.end();
      }
      return exits.success({ code: "00", errorMessage: error.message });
    }
  },
};
