/**
 * 
 * @param {*} n takes a number n as input
 * @returns true or false
 */
function isInt(n){
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

function isNumber(n){
    return isInt(n) && isFloat(n);
}