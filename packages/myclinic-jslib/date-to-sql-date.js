const { pad } = require("./pad");

/**
 * Date を YYYY-MM-DD 型の文字列に変換する
 * @param {Date} d - 変換する Date
 * @returns {string} 文字列（YYYY-MM-DD）
 * @example
 * // returns "2023-03-02"
 * dateToSqlDate(new Date(2023, 2, 2))
 */

function dateToSqlDate(d) {
  const date = d === "string" ? new Date(d) : d;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const padm = pad(month, 2, "0");
  const padd = pad(day, 2, "0");
  return `${year}-${padm}-${padd}`;
}

module.exports = {
  dateToSqlDate
}