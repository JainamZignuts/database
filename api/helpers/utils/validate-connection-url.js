const { REGEX, DATABASE_NAMES } = sails.config.constants;

module.exports = {
  friendlyName: "Validate connection url",

  description: "",

  inputs: {
    connectionUrl: {
      type: "string",
      required: true,
    },
  },

  exits: {
    success: {
      description: "All done.",
    },
    error: {
      description: "Error",
    },
  },

  fn: async function (inputs, exits) {
    try {
      let { connectionUrl } = inputs;
      connectionUrl = connectionUrl.trim();

      // Regular expressions for matching MySQL and PostgreSQL connection URLs
      if (REGEX.MYSQL.test(connectionUrl)) {
        return exits.success(DATABASE_NAMES.MYSQL);
      } else if (REGEX.POSTGRES.test(connectionUrl)) {
        return exits.success(DATABASE_NAMES.POSTGRES);
      } else {
        return exits.success(false);
      }
    } catch (error) {
      sails.log.error(error);
      return exits.error(error);
    }
  },
};
