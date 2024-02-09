/**
 * GetInformationController
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
   * @file GetInformationController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method will check and retrieve given connection's tables
   * @author Jainam Shah  (Zignuts)
   */
  getTables: async (req, res) => {
    try {
      //get connectionId string from body
      const { connectionId } = req.body;

      /* The `validationObject` is an object that defines the validation rules for the `connectionId`
     parameter. In this case, it specifies that the `connectionId` parameter should be a valid URL.
     This object is used later to perform validation on the `connectionId` parameter using the
     `VALIDATOR` class. */
      const validationObject = {
        connectionId: VALIDATION_RULES.COMMON.STRING,
      };

      /* The below code is creating a constant variable called `validationData` and assigning it an object
      with one property: `connectionId`. */
      const validationData = {
        connectionId,
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

      //check connection data in database
      const connectionData = await Connections.findOne({
        where: {
          id: connectionId,
          isDeleted: false,
          isActive: true,
        },
        select: ["id", "url", "databaseName", "databaseType"],
      });

      //if connection data does not exist in database then send validation response
      if (!connectionData) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "given connection details not exist in database",
          data: "",
          error: "",
        });
      }

      let result = [];

      //if db type is postgres
      if (connectionData.databaseType === DATABASE_NAMES.POSTGRES) {
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
          connection: connectionData.url,
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

        //add condition of table schema in where clause
        whereClause += `\n AND table_schema = '${connectionData.databaseName}'`;

        //construct query by combining all clauses
        const query = selectClause
          .concat(fromClause)
          .concat(whereClause)
          .concat(orderClause);

        //execute query
        const queryResult = await sails.helpers.mysql.executeQuery.with({
          connection: connectionData.url,
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
   * @name getProcedures
   * @file GetInformationController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method will check and retrieve given connection's procedures
   * @author Jainam Shah  (Zignuts)
   */
  getProcedures: async (req, res) => {
    try {
      //get connectionId string from body
      const { connectionId } = req.body;

      /*connectionId The `validationObject` is an object that defines the validation rules for the `connectionId`
     parameter. In this case, it specifies that the `connectionId` parameter should be a valid URL.
     This object is used later to perform validation on the `connectionId` parameter using the
     `VALIDATOR` class. */
      const validationObject = {
        connectionId: VALIDATION_RULES.COMMON.STRING,
      };

      /* The below code is creating a constant variable called `validationData` and assigning it an object
    with one property: `connectionId`. */
      const validationData = {
        connectionId,
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

      //check connection data in database
      const connectionData = await Connections.findOne({
        where: {
          id: connectionId,
          isDeleted: false,
          isActive: true,
        },
        select: ["id", "url", "databaseName", "databaseType"],
      });

      //if connection data does not exist in database then send validation response
      if (!connectionData) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "given connection details not exist in database",
          data: "",
          error: "",
        });
      }

      let result = [];

      //if db type is postgres
      if (connectionData.databaseType === DATABASE_NAMES.POSTGRES) {
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
          connection: connectionData.url,
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

        //add condition of routine schema in where clause
        whereClause += `\n AND routine_schema = '${connectionData.databaseName}'`;

        //construct query by combining all clauses
        const query = selectClause
          .concat(fromClause)
          .concat(whereClause)
          .concat(orderClause);

        //execute query
        const queryResult = await sails.helpers.mysql.executeQuery.with({
          connection: connectionData.url,
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
