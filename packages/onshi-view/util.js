function pad(src, size, c) {
  let s = src.toString();
  while(s.length < size){
    s = c + s;
  }
  return s;
}

function toDateArg(date) {
  const y = date.getFullYear().toString()
  const m = pad(date.getMonth() + 1, 2, "0");
  const d = pad(date.getDate(), 2, "0");
  return `${y}${m}${d}`;
}

exports = {
  pad, toDateArg
};