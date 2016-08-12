/**
 * Helper functions
 **/
let isPercentage = (n) => {
  'use strict';

  return typeof n === 'string' && n.indexOf('%') !== -1;
};

let convertPercentageToFloat = (n) => {
  'use strict';

  return parseFloat(n.slice(0, -1) / 100, 10);
};

let convertMatrixToArray = (value) => {
  'use strict';

  if (value && (value.substr(0, 6) === 'matrix')) {
    return value.replace(/^.*\((.*)\)$/g, '$1').replace(/px/g, '').split(/, +/);
  }
  return false;
};

export { isPercentage, convertPercentageToFloat, convertMatrixToArray };