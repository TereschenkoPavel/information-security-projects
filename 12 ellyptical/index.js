const p = 751;      
const a = -1;       
const b = 1;        

const a_mod = ((a % p) + p) % p;

function modInverse(a, mod) {
    a = ((a % mod) + mod) % mod;
    let [old_r, r] = [a, mod];
    let [old_s, s] = [1, 0];
    let [old_t, t] = [0, 1];
    
    while (r !== 0) {
        const quotient = Math.floor(old_r / r);
        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
        [old_t, t] = [t, old_t - quotient * t];
    }
    
    return ((old_s % mod) + mod) % mod;
}


function isQuadraticResidue(n, mod) {
    
    const exp = (mod - 1) / 2;
    let result = 1n;
    let base = BigInt(n);
    let expBig = BigInt(exp);
    let modBig = BigInt(mod);
    
    while (expBig > 0) {
        if (expBig & 1n) result = (result * base) % modBig;
        base = (base * base) % modBig;
        expBig >>= 1n;
    }
    
    return Number(result) === 1 || Number(result) === mod - 1;
}


function modSqrt(n, mod) {
    
    const exp = (mod + 1) / 4;
    let result = 1n;
    let base = BigInt(n);
    let expBig = BigInt(exp);
    let modBig = BigInt(mod);
    
    while (expBig > 0) {
        if (expBig & 1n) result = (result * base) % modBig;
        base = (base * base) % modBig;
        expBig >>= 1n;
    }
    
    return Number(result);
}


function findCurvePoints(xMin, xMax) {
    const points = [];
    
    for (let x = xMin; x <= xMax; x++) {
        
        let rightSide = (BigInt(x) ** 3n - BigInt(x) + 1n) % BigInt(p);
        rightSide = Number((rightSide + BigInt(p)) % BigInt(p));
        
        
        if (isQuadraticResidue(rightSide, p)) {
            if (rightSide === 0) {
                points.push({ x, y: 0 });
            } else {
                const sqrt = modSqrt(rightSide, p);
                points.push({ x, y: sqrt });
                if (sqrt !== 0 && sqrt !== p - sqrt) {
                    points.push({ x, y: p - sqrt });
                }
            }
        }
    }
    
    return points;
}


class Point {
    constructor(x, y, isInfinity = false) {
        this.x = x;
        this.y = y;
        this.isInfinity = isInfinity; 
    }
    
    
    equals(other) {
        if (this.isInfinity && other.isInfinity) return true;
        if (this.isInfinity || other.isInfinity) return false;
        return this.x === other.x && this.y === other.y;
    }
    
    
    toString() {
        if (this.isInfinity) return "∞";
        return `(${this.x}, ${this.y})`;
    }
}


function pointAdd(P, Q) {
    
    if (P.isInfinity) return Q;
    
    if (Q.isInfinity) return P;
    
    
    if (P.x === Q.x && (P.y + Q.y) % p === 0) {
        return new Point(null, null, true);
    }
    
    let λ;
    
    if (P.x === Q.x && P.y === Q.y) {
        
        if (P.y === 0) {
            return new Point(null, null, true); 
        }
        const numerator = (3 * P.x ** 2 + a_mod) % p;
        const denominator = (2 * P.y) % p;
        λ = (numerator * modInverse(denominator, p)) % p;
    } else {
        
        const numerator = (Q.y - P.y) % p;
        const denominator = (Q.x - P.x) % p;
        λ = (numerator * modInverse(denominator, p)) % p;
    }
    
    const x3 = (λ ** 2 - P.x - Q.x) % p;
    const y3 = (λ * (P.x - x3) - P.y) % p;
    
    return new Point(
        (x3 + p) % p,
        (y3 + p) % p
    );
}


function scalarMultiply(P, k) {
    let result = new Point(null, null, true); 
    let temp = P;
    let multiplier = Math.abs(k);
    
    
    while (multiplier > 0) {
        if (multiplier & 1) {
            result = pointAdd(result, temp);
        }
        temp = pointAdd(temp, temp);
        multiplier >>= 1;
    }
    
    
    if (k < 0) {
        if (!result.isInfinity) {
            result.y = (-result.y % p + p) % p;
        }
    }
    
    return result;
}


function pointSub(P, Q) {
    const negQ = new Point(Q.x, (-Q.y % p + p) % p, Q.isInfinity);
    return pointAdd(P, negQ);
}


function combinedOperation(P, Q, R, k, l) {
    const kP = scalarMultiply(P, k);
    const lQ = scalarMultiply(Q, l);
    const kP_plus_lQ = pointAdd(kP, lQ);
    return pointSub(kP_plus_lQ, R);
}


async function main() {
    console.log("=".repeat(60));
    console.log("Лабораторная работа №13 (Задание 1)");
    console.log("Эллиптическая кривая: y² = x³ - x + 1 (mod 751)");
    console.log("Вариант 2");
    console.log("=".repeat(60));

    const xMin = 36;
    const xMax = 70;
    const k = 6;   
    const l = 10;  
    
    const P = new Point(37, findY(37));   
    const Q = new Point(45, findY(45));
    const R = new Point(50, findY(50));
    
    console.log("\n1.1. Поиск точек эллиптической кривой");
    console.log(`Диапазон x: [${xMin}, ${xMax}]`);
    console.log("-".repeat(40));
    
    const points = findCurvePoints(xMin, xMax);
    console.log(`\nНайдено точек: ${points.length}`);
    console.log("\nСписок найденных точек:");
    console.log("x\ty");
    console.log("-".repeat(30));
    
    
    points.forEach(point => {
        console.log(`${point.x}\t${point.y}`);
    });
    
    console.log("\n" + "=".repeat(60));
    console.log("1.2. Операции над точками");
    console.log(`Параметры: k = ${k}, l = ${l}`);
    console.log("-".repeat(40));
    
    
    console.log(`\nИсходные точки:`);
    console.log(`P = ${P.toString()}`);
    console.log(`Q = ${Q.toString()}`);
    console.log(`R = ${R.toString()}`);
    
    
    const kP = scalarMultiply(P, k);
    console.log(`\nа) k*P = ${k} * ${P.toString()} = ${kP.toString()}`);
    
    
    const P_plus_Q = pointAdd(P, Q);
    console.log(`б) P + Q = ${P.toString()} + ${Q.toString()} = ${P_plus_Q.toString()}`);
    
    
    const kP_plus_lQ_minus_R = combinedOperation(P, Q, R, k, l);
    console.log(`в) k*P + l*Q - R = ${k}*${P.toString()} + ${l}*${Q.toString()} - ${R.toString()} = ${kP_plus_lQ_minus_R.toString()}`);
    
    
    const P_minus_Q_plus_R = pointAdd(pointSub(P, Q), R);
    console.log(`г) P - Q + R = ${P.toString()} - ${Q.toString()} + ${R.toString()} = ${P_minus_Q_plus_R.toString()}`);
    
    
    console.log("\n" + "=".repeat(60));
    console.log("Результаты (табличная форма):");
    console.log("-".repeat(60));
    console.log("| Операция | Результат |");
    console.log("|----------|-----------|");
    console.log(`| k·P (k=${k}) | ${kP.toString()} |`);
    console.log(`| P + Q | ${P_plus_Q.toString()} |`);
    console.log(`| k·P + l·Q - R | ${kP_plus_lQ_minus_R.toString()} |`);
    console.log(`| P - Q + R | ${P_minus_Q_plus_R.toString()} |`);
    console.log("-".repeat(60));
    
    
    function findY(x) {
        const rightSide = (BigInt(x) ** 3n - BigInt(x) + 1n) % BigInt(p);
        const rs = Number((rightSide + BigInt(p)) % BigInt(p));
        if (isQuadraticResidue(rs, p)) {
            if (rs === 0) return 0;
            return modSqrt(rs, p);
        }
        return null;
    }
}


main().catch(console.error);