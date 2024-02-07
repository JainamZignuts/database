/**
 * DatabaseController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { HTTP_STATUS_CODE, MYSQL, POOL, DATABASE_NAMES, KEYWORDS } =
  sails.config.constants;

module.exports = {
  /**
   * @name getTables
   * @file DatabaseController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method will check and retrieve given connection's table
   * @author Jainam Shah  (Zignuts)
   */
  getTables: async (req, res) => {
    let pool;
    try {
      const { connection } = req.body;

      // Validate the connection parameter
      if (!connection) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "connection is required",
          data: "",
          error: "",
        });
      }

      const dbType = await sails.helpers.utils.validateConnectionUrl(
        connection
      );

      if (!dbType) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message:
            "given connection url is not of postgres or mysql connection",
          data: "",
          error: "",
        });
      }

      let selectClause = `
            SELECT table_name
            FROM information_schema.tables
          `;

      let whereClause = `WHERE table_type = '${KEYWORDS.BASE_TALE}'`;
      const orderClause = "\n ORDER BY table_name";
      let result = [];

      if (dbType === DATABASE_NAMES.POSTGRES) {
        // Create a PostgreSQL connection pool
        pool = new POOL({ connectionString: connection });
        whereClause += `\n AND table_schema = 'public'`;
        // Execute a sample query for PostgreSQL
        result = await pool.query(selectClause + whereClause + orderClause);
        // Release the pool in case of an error
        if (pool) {
          await pool.end();
        }

        result = result.rows;
      } else {
        // Create a MySQL connection pool
        pool = MYSQL.createPool(connection);
        const connectionParts = connection.split("/");
        const dbName =
          connectionParts[connectionParts.length - 1].split("?")[0];
        whereClause += `\n AND table_schema = '${dbName}'`;

        // Execute a sample query for MySQL
        result = await pool.query(selectClause + whereClause + orderClause);
        // Release the pool in case of an error
        if (pool) {
          await pool.end();
        }

        result = result[0];
      }

      // return success response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: result,
        error: "",
      });
    } catch (error) {
      console.log(error);
      // Release the pool in case of an error
      if (pool) {
        await pool.end();
      }

      //return error response
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: "",
        error: error.message,
      });
    }
  },

  /**
   * @name getTables
   * @file DatabaseController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method will check and retrieve given connection's procedures
   * @author Jainam Shah  (Zignuts)
   */
  getProcedures: async (req, res) => {
    let pool;
    try {
      const { connection } = req.body;

      // Validate the connection parameter
      if (!connection) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "connection is required",
          data: "",
          error: "",
        });
      }

      const dbType = await sails.helpers.utils.validateConnectionUrl(
        connection
      );

      if (!dbType) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message:
            "given connection url is not of postgres or mysql connection",
          data: "",
          error: "",
        });
      }

      let selectClause = `
              SELECT routine_name
              FROM information_schema.routines
          `;

      let whereClause = `WHERE routine_type = '${KEYWORDS.PROCEDURE}'`;
      const orderClause = "\n ORDER BY routine_name";
      let result = [];

      if (dbType === DATABASE_NAMES.POSTGRES) {
        // Create a PostgreSQL connection pool
        pool = new POOL({ connectionString: connection });

        // Execute a sample query for PostgreSQL
        result = await pool.query(selectClause + whereClause + orderClause);
        // Release the pool in case of an error
        if (pool) {
          await pool.end();
        }

        result = result.rows;
      } else {
        // Create a MySQL connection pool
        pool = MYSQL.createPool(connection);
        const connectionParts = connection.split("/");
        const dbName =
          connectionParts[connectionParts.length - 1].split("?")[0];
        whereClause += `\n AND routine_schema = '${dbName}'`;

        // Execute a sample query for MySQL
        result = await pool.query(selectClause + whereClause + orderClause);
        // Release the pool in case of an error
        if (pool) {
          await pool.end();
        }

        result = result[0];
      }

      // return success response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: result,
        error: "",
      });
    } catch (error) {
      console.log(error);
      // Release the pool in case of an error
      if (pool) {
        await pool.end();
      }

      //return error response
      return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.SERVER_ERROR,
        message: "",
        data: "",
        error: error.message,
      });
    }
  },
};
