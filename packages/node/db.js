"use strict";
exports.__esModule = true;
exports.coerceShahokokuho = exports.coerceRow = void 0;
function capitalize(s) {
    if (s.length === 0) {
        return s;
    }
    else {
        return s[0].toUpperCase() + s.substring(1);
    }
}
function snakeToCamel(snake) {
    var ps = snake.split("_");
    var head = ps[0];
    var tail = ps.splice(1).map(function (s) { return capitalize(s); });
    tail.unshift(head);
    return tail.join("");
}
function coerceRow(row, override) {
    if (override === void 0) { override = {}; }
    var obj = {};
    for (var k in row) {
        if (k in override) {
            obj[override[k]] = row[k];
        }
        else {
            obj[snakeToCamel(k)] = row[k];
        }
    }
    return obj;
}
exports.coerceRow = coerceRow;
function coerceShahokokuho(row) {
    return coerceRow(row, { kourei: "koureiStore", honnin: "honninStore" });
}
exports.coerceShahokokuho = coerceShahokokuho;
