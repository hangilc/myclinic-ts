const pad = require("./pad");
const dateToSqlDate = require("./date-to-sql-date");

module.exports = {
  ...pad, ...dateToSqlDate
}