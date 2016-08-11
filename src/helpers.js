/**
 * Helper functions
 **/
let length = 6;

let isPercentage = (n) => {
  return typeof n === 'string' && n.indexOf('%') !== -1;
}

let convertPercentageToFloat = (n) => {
  return parseFloat(n.slice(0, -1) / 100, 10);
}

let convertMatrixToArray = (value) => {
  if (value && (value.substr(0, length) === "matrix")) {
    return value.replace(/^.*\((.*)\)$/g, "$1").replace(/px/g, '').split(/, +/);
  }
  return false;
}

export { isPercentage, convertPercentageToFloat, convertMatrixToArray }
