const num1 = 1.0;
const num2 = 2.0;
const num3 = 3.0;
const num4 = 6.0;

const length = 4;


let easingBezier = (mX1, mY1, mX2, mY2) => {
  let a = (aA1, aA2) => {
    return num1 - num3 * aA2 + num3 * aA1;
  }

  let b = (aA1, aA2) => {
    return num3 * aA2 - num4 * aA1;
  }

  let c = (aA1) => {
    return num3 * aA1;
  }

  // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
  let calcBezier = (aT, aA1, aA2) => {
    return ((a(aA1, aA2) * aT + b(aA1, aA2)) * aT + c(aA1)) * aT;
  }

  // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
  let getSlope = (aT, aA1, aA2) => {
    return num3 * a(aA1, aA2) * aT * aT + num2 * b(aA1, aA2) * aT + c(aA1);
  }

  let getTForX = (aX) => {
    // Newton raphson iteration
    let aGuessT = aX;
    for (let i = 0; i < length; ++i) {
      let currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) {
        return aGuessT;
      }
      let currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  if (mX1 === mY1 && mX2 === mY2) {
    return {
      css: 'linear',
      fn(aX) {
        return aX;
      }
    };
  }

  return {
    css: `cubic-bezier(${mX1},${mY1},${mX2},${mY2})`,
    fn(aX) {
      return calcBezier(getTForX(aX), mY1, mY2);
    }
  }
};

export default easingBezier;
