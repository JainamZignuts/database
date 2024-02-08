/**
 * DatabaseController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { HTTP_STATUS_CODE, VALIDATOR, DATABASE_NAMES, KEYWORDS } =
  sails.config.constants;
const VALIDATION_RULES = sails.config.validationRules;

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
    try {
      //get connection string from body
      const { connection } = req.body;

      /* The `validationObject` is an object that defines the validation rules for the `connection`
     parameter. In this case, it specifies that the `connection` parameter should be a valid URL.
     This object is used later to perform validation on the `connection` parameter using the
     `VALIDATOR` class. */
      const validationObject = {
        connection: VALIDATION_RULES.CONNECTION.URL,
      };

      /* The below code is creating a constant variable called `validationData` and assigning it an object
      with one property: `connection`. */
      const validationData = {
        connection,
      };

      // perform validation method
      const validation = new VALIDATOR(validationData, validationObject);

      // if any rule is violated send validation response
      if (validation.fails()) {
        //if any rule is violated send validation response
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "",
          data: "",
          error: validation.errors.all(),
        });
      }

      //this helper validates collection url and return its database name
      const dbType = await sails.helpers.utils.validateConnectionUrl(
        connection
      );

      //if given connection url does not match our defined database then send validation response
      if (!dbType) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message:
            "given connection url is not of postgres or mysql connection",
          data: "",
          error: "",
        });
      }

      let result = [];

      //if db type is postgres
      if (dbType === DATABASE_NAMES.POSTGRES) {
        //construct get tables query for postgres
        const queryClauses = await sails.helpers.postgres.query.getTables();

        //if there is any error in helper then send error response
        if (queryClauses.code === "00") {
          return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            status: HTTP_STATUS_CODE.SERVER_ERROR,
            message: "",
            data: "",
            error: queryClauses.errorMessage,
          });
        }

        //get different clauses from query helper to construct query
        let { selectClause, fromClause, whereClause, orderClause } =
          queryClauses.data;

        //add condition of table schema in where clause
        whereClause += `\n AND table_schema = 'public'`;

        //construct query by combining all clauses
        const query = selectClause
          .concat(fromClause)
          .concat(whereClause)
          .concat(orderClause);

        //execute query
        const queryResult = await sails.helpers.postgres.executeQuery.with({
          connection,
          query,
        });

        //if there is any error in helper then send error response
        if (queryResult.code === "00") {
          return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            status: HTTP_STATUS_CODE.SERVER_ERROR,
            message: "",
            data: "",
            error: queryResult.errorMessage,
          });
        }

        //add result of query in result variable
        result = queryResult.data;
      } else {
        //construct get tables query for mysql
        const queryClauses = await sails.helpers.mysql.query.getTables();

        //if there is any error in helper then send error response
        if (queryClauses.code === "00") {
          return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            status: HTTP_STATUS_CODE.SERVER_ERROR,
            message: "",
            data: "",
            error: queryClauses.errorMessage,
          });
        }

        //get different clauses from query helper to construct query
        let { selectClause, fromClause, whereClause, orderClause } =
          queryClauses.data;

        //extract db name from connection url
        const connectionParts = connection.split("/");
        const dbName =
          connectionParts[connectionParts.length - 1].split("?")[0];

        //add condition of table schema in where clause
        whereClause += `\n AND table_schema = '${dbName}'`;

        //construct query by combining all clauses
        const query = selectClause
          .concat(fromClause)
          .concat(whereClause)
          .concat(orderClause);

        //execute query
        const queryResult = await sails.helpers.mysql.executeQuery.with({
          connection,
          query,
        });

        //if there is any error in helper then send error response
        if (queryResult.code === "00") {
          return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            status: HTTP_STATUS_CODE.SERVER_ERROR,
            message: "",
            data: "",
            error: queryResult.errorMessage,
          });
        }

        //add result of query in result variable
        result = queryResult.data;
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
    try {
      //get connection string from body
      const { connection } = req.body;

      /* The `validationObject` is an object that defines the validation rules for the `connection`
     parameter. In this case, it specifies that the `connection` parameter should be a valid URL.
     This object is used later to perform validation on the `connection` parameter using the
     `VALIDATOR` class. */
      const validationObject = {
        connection: VALIDATION_RULES.CONNECTION.URL,
      };

      /* The below code is creating a constant variable called `validationData` and assigning it an object
    with one property: `connection`. */
      const validationData = {
        connection,
      };

      // perform validation method
      const validation = new VALIDATOR(validationData, validationObject);

      // if any rule is violated send validation response
      if (validation.fails()) {
        //if any rule is violated send validation response
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "",
          data: "",
          error: validation.errors.all(),
        });
      }

      //this helper validates collection url and return its database name
      const dbType = await sails.helpers.utils.validateConnectionUrl(
        connection
      );

      //if given connection url does not match our defined database then send validation response
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

      //if db type is postgres
      if (dbType === DATABASE_NAMES.POSTGRES) {
        //construct get tables query for postgres
        const queryClauses = await sails.helpers.postgres.query.getProcedures();

        //if there is any error in helper then send error response
        if (queryClauses.code === "00") {
          return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            status: HTTP_STATUS_CODE.SERVER_ERROR,
            message: "",
            data: "",
            error: queryClauses.errorMessage,
          });
        }

        //get different clauses from query helper to construct query
        let { selectClause, fromClause, whereClause, orderClause } =
          queryClauses.data;

        //construct query by combining all clauses
        const query = selectClause
          .concat(fromClause)
          .concat(whereClause)
          .concat(orderClause);

        //execute query
        const queryResult = await sails.helpers.postgres.executeQuery.with({
          connection,
          query,
        });

        //if there is any error in helper then send error response
        if (queryResult.code === "00") {
          return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            status: HTTP_STATUS_CODE.SERVER_ERROR,
            message: "",
            data: "",
            error: queryResult.errorMessage,
          });
        }

        //add result of query in result variable
        result = queryResult.data;
      } else {
        //construct get tables query for mysql
        const queryClauses = await sails.helpers.mysql.query.getProcedures();

        //if there is any error in helper then send error response
        if (queryClauses.code === "00") {
          return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            status: HTTP_STATUS_CODE.SERVER_ERROR,
            message: "",
            data: "",
            error: queryClauses.errorMessage,
          });
        }

        //get different clauses from query helper to construct query
        let { selectClause, fromClause, whereClause, orderClause } =
          queryClauses.data;

        //extract db name from connection url
        const connectionParts = connection.split("/");
        const dbName =
          connectionParts[connectionParts.length - 1].split("?")[0];

        //add condition of routine schema in where clause
        whereClause += `\n AND routine_schema = '${dbName}'`;

        //construct query by combining all clauses
        const query = selectClause
          .concat(fromClause)
          .concat(whereClause)
          .concat(orderClause);

        //execute query
        const queryResult = await sails.helpers.mysql.executeQuery.with({
          connection,
          query,
        });

        //if there is any error in helper then send error response
        if (queryResult.code === "00") {
          return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
            status: HTTP_STATUS_CODE.SERVER_ERROR,
            message: "",
            data: "",
            error: queryResult.errorMessage,
          });
        }

        //add result of query in result variable
        result = queryResult.data;
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
