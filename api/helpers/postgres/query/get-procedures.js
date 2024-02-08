const { KEYWORDS } = sails.config.constants;

module.exports = {
  friendlyName: "Get procedures",

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
                              routine_name
                          `;

      const fromClause = `\n FROM 
                              information_schema.routines
                          `;

      let whereClause = `\n WHERE 
                              routine_type = '${KEYWORDS.PROCEDURE}'
                        `;

      const orderClause = `\n ORDER BY routine_name`;

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
