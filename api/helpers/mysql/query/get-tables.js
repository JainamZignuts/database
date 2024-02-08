const { KEYWORDS } = sails.config.constants;

module.exports = {
  friendlyName: "Get tables",

  description: "",

  inputs: {},

  exits: {
    error: {
      code: "",
      errorMessage: "",
    },
    success: {
      code: "",
      data: {},
      errorMessage: "",
    },
  },

  fn: async function (inputs, exits) {
    try {
      const selectClause = `
                            SELECT 
                              table_name
                          `;

      const fromClause = `\n FROM 
                              information_schema.tables
                          `;

      let whereClause = `\n WHERE 
                              table_type = '${KEYWORDS.BASE_TALE}'
                        `;

      const orderClause = `\n ORDER BY table_name`;

      return exits.success({
        code: "01",
        data: { selectClause, fromClause, whereClause, orderClause },
      });
    } catch (error) {
      sails.log.error(error);
      return exits.success({ code: "00", errorMessage: error.message });
    }
  },
};
