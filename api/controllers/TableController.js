/**
 * TableController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { HTTP_STATUS_CODE, VALIDATOR, DATABASE_NAMES, KEYWORDS } =
  sails.config.constants;
const VALIDATION_RULES = sails.config.validationRules;

module.exports = {
  /**
   * @name createForeignKey
   * @file TableController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method will create foreign key to the table
   * @author Jainam Shah (Zignuts)
   */
  createForeignKey: async (req, res) => {
    try {
      const {
        connectionId,
        parentTable,
        childTable,
        parentColumn,
        childColumn,
        fkName,
      } = req.body;

      /* The `validationObject` is an object that defines the validation rules for the parameters used
      in the `addForeignKey` method. Each property in the `validationObject` represents a parameter,
      and its value represents the validation rule for that parameter. */
      const validationObject = {
        connectionId: VALIDATION_RULES.COMMON.STRING,
        parentTable: VALIDATION_RULES.COMMON.STRING,
        childTable: VALIDATION_RULES.COMMON.STRING,
        parentColumn: VALIDATION_RULES.COMMON.STRING,
        childColumn: VALIDATION_RULES.COMMON.STRING,
        fkName: VALIDATION_RULES.COMMON.STRING,
      };

      /* The below code is creating a constant variable called `validationData` and assigning it an object
    with one property: `connection`. */
      const validationData = {
        connectionId,
        parentTable,
        childTable,
        parentColumn,
        childColumn,
        fkName,
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
        select: ["id", "url", "databaseType"],
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

      const query = `
                     ALTER TABLE ${childTable}
                     ADD CONSTRAINT fk_${fkName}
                     FOREIGN KEY (${childColumn})
                     REFERENCES ${parentTable}(${parentColumn})
                    `;

      //if db type is postgres
      if (connectionData.databaseType === DATABASE_NAMES.POSTGRES) {
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
      } else {
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
      }

      // return success response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: true,
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
   * @name createIndex
   * @file TableController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method will create index to the table
   * @author Jainam Shah (Zignuts)
   */
  createIndex: async (req, res) => {
    try {
      const { connectionId, tableName, tableColumn, name } = req.body;

      /* The `validationObject` is an object that defines the validation rules for the parameters used
      in the `addForeignKey` method. Each property in the `validationObject` represents a parameter,
      and its value represents the validation rule for that parameter. */
      const validationObject = {
        connectionId: VALIDATION_RULES.COMMON.STRING,
        tableName: VALIDATION_RULES.COMMON.STRING,
        tableColumn: VALIDATION_RULES.COMMON.STRING,
      };

      /* The below code is creating a constant variable called `validationData` and assigning it an object
    with one property: `connection`. */
      const validationData = {
        connectionId,
        tableName,
        tableColumn,
      };

      //if name is given then validate it
      if (name) {
        validationObject.name = VALIDATION_RULES.COMMON.STRING;
        validationData.name = name;
      }

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
        select: ["id", "url", "databaseType"],
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

      const query = `
                      CREATE INDEX ${
                        name ? `idx_${name}` : `idx_${tableName}_${tableColumn}`
                      }
                        ON ${tableName}(${tableColumn})
                    `;

      //if db type is postgres
      if (connectionData.databaseType === DATABASE_NAMES.POSTGRES) {
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
      } else {
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
      }

      // return success response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: true,
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
   * @name createProcedure
   * @file TableController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method will create a procedure to the database
   * @author Jainam Shah (Zignuts)
   */
  createProcedure: async (req, res) => {
    try {
      const { connectionId, name, queryToAdd } = req.body;

      /* The `validationObject` is an object that defines the validation rules for the parameters used
      in the `addForeignKey` method. Each property in the `validationObject` represents a parameter,
      and its value represents the validation rule for that parameter. */
      const validationObject = {
        connectionId: VALIDATION_RULES.COMMON.STRING,
        name: VALIDATION_RULES.COMMON.STRING,
        queryToAdd: VALIDATION_RULES.COMMON.STRING,
      };

      /* The below code is creating a constant variable called `validationData` and assigning it an object
    with one property: `connection`. */
      const validationData = {
        connectionId,
        name,
        queryToAdd,
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
        select: ["id", "url", "databaseType"],
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

      let query = `CREATE PROCEDURE  ${name} ()`;

      //if db type is postgres
      if (connectionData.databaseType === DATABASE_NAMES.POSTGRES) {
        const createClause = `
        ${queryToAdd};  
        `;

        const languageClause = `\n  LANGUAGE sql
        AS $$`;

        const endClause = `\n  $$;`;

        query = query
          .concat(languageClause)
          .concat(createClause)
          .concat(endClause);

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
      }

      if (connectionData.databaseType === DATABASE_NAMES.MYSQL) {
        const createClause = `
        BEGIN
        ${queryToAdd};  
        `;

        const endClause = `\n  END`;

        query = query.concat(createClause).concat(endClause);

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
      }

      // return success response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: true,
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
   * @name callProcedure
   * @file TableController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method will call a procedure from the database
   * @author Jainam Shah (Zignuts)
   */
  callProcedure: async (req, res) => {
    try {
      const { connectionId, name, parameters } = req.body;

      if (!Array.isArray(parameters)) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "Please pass an array in parameters field",
          data: "",
          error: "",
        });
      }

      /* The `validationObject` is an object that defines the validation rules for the parameters used
      in the `addForeignKey` method. Each property in the `validationObject` represents a parameter,
      and its value represents the validation rule for that parameter. */
      const validationObject = {
        connectionId: VALIDATION_RULES.COMMON.STRING,
        name: VALIDATION_RULES.COMMON.STRING,
      };

      /* The below code is creating a constant variable called `validationData` and assigning it an object
    with one property: `connection`. */
      const validationData = {
        connectionId,
        name,
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
        select: ["id", "url", "databaseType"],
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

      let query;

      if (parameters && parameters.length > 0) {
        parameters = parameters.join(",");
        query = `CALL  ${name}(${parameters});`;
      } else {
        query = `CALL ${name}();`;
      }

      let queryResult;
      //if db type is postgres
      if (connectionData.databaseType === DATABASE_NAMES.POSTGRES) {
        //execute query
        queryResult = await sails.helpers.postgres.executeQuery.with({
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
      } else {
        //execute query
        queryResult = await sails.helpers.mysql.executeQuery.with({
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
      }

      // return success response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: queryResult?.data[0],
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
