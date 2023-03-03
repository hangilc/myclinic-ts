/**
 * 数字から桁数を指定して文字列を作成する
 * 
 * @param {number} n - 数字
 * @param {number} size - 桁数
 * @param {string} stuff - 必要であれば使用する左詰めのための文字
 * @return {string} result
 * @example
 * // return "01"
 * pad(1, 2, "0")
 */

function pad(n, size, stuff) {
  let s = n.toString();
  while(s.length < size) {
    s = stuff + s;
  }
  return s;
}

module.exports = {
  pad
}