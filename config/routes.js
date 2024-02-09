/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  "POST /connection/create": "ConnectionController.create",
  "POST /tables/get": "GetInformationController.getTables",
  "POST /procedures/get": "GetInformationController.getProcedures",
  "POST /foreign-key/create": "TableController.createForeignKey",
  "POST /index/create": "TableController.createIndex",
  "POST /procedure/create": "TableController.createProcedure",
};
