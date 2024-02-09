/**
 * ConnectionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { HTTP_STATUS_CODE, UUID, VALIDATOR, KEYWORDS } = sails.config.constants;
const VALIDATION_RULES = sails.config.validationRules;
module.exports = {
  /**
   * @name create
   * @file ConnectionController.js
   * @param {Request} req
   * @param {Response} res
   * @throwsF
   * @description This method will create connection in database
   * @author Jainam Shah  (Zignuts)
   */
  create: async (req, res) => {
    try {
      //get connection string from body
      const { connection, name } = req.body;

      /* The `validationObject` is an object that defines the validation rules for the `connection`
     parameter. In this case, it specifies that the `connection` parameter should be a valid URL.
     This object is used later to perform validation on the `connection` parameter using the
     `VALIDATOR` class. */
      const validationObject = {
        connection: VALIDATION_RULES.CONNECTION.URL,
        name: VALIDATION_RULES.CONNECTION.NAME,
      };

      /* The below code is creating a constant variable called `validationData` and assigning it an object
      with one property: `connection`. */
      const validationData = {
        connection,
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

      //check for existing data with same url in database
      const checkUniqueUrl = await Connections.find({
        where: {
          url: connection,
          isDeleted: false,
        },
        select: "id",
      }).limit(1);

      //if same url exists in database then send validation response
      if (checkUniqueUrl.length > 0) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: "url already exists in database",
          data: "",
          error: "",
        });
      }

      /**
       * The function `parseConnectionUrl` takes a connection URL as input and extracts the database
       * name, user, host, port, and password from it.
       * @param connectionUrl - The connectionUrl is a string that represents the URL of a database
       * connection. It typically includes information such as the protocol, host, port, username,
       * password, and database name.
       * @returns an object with the following properties: dbName, user, host, port, and password.
       */
      async function parseConnectionUrl(connectionUrl) {
        const parsedUrl = new URL(connectionUrl);

        // Extracting database name from path
        const pathSegments = parsedUrl.pathname.split("/");
        const dbName = pathSegments[pathSegments.length - 1];

        // Extracting user, host, and port
        const user = parsedUrl.username;
        const host = parsedUrl.hostname;
        const port = parsedUrl.port;

        // Extracting password from auth
        const password = parsedUrl.password;

        return {
          dbName,
          user,
          host,
          port,
          password,
        };
      }

      //calling url parse function to extract db info from url
      const connectionInfo = await parseConnectionUrl(connection);

      const connectionId = UUID();

      //creates connection in database
      await Connections.create({
        id: connectionId,
        url: connection,
        name,
        host: connectionInfo.host,
        port: connectionInfo.port,
        user: connectionInfo.user,
        password: connectionInfo.password,
        databaseName: connectionInfo.dbName,
        databaseType: dbType,
        createdAt: Math.floor(Date.now() / 1000),
      });

      // return success response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: "",
        data: connectionId,
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
