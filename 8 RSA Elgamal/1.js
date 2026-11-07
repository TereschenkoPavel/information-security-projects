const bigInt = require('big-integer');

function generateN(bits) {
    const min = bigInt(2).pow(bits - 1);
    const max = bigInt(2).pow(bits).subtract(1);
    return bigInt.randBetween(min, max);
}

function measureTime(a, x, n) {
    const start = process.hrtime.bigint();
    const y = bigInt(a).modPow(x, n);
    const end = process.hrtime.bigint();
    const timeNs = Number(end - start);
    return { y: y.toString(), timeMs: timeNs / 1e6 };
}

const xValues = [
    bigInt(1009),
    bigInt(100000000003),
    bigInt("1000000000000000003"),
    bigInt("10000000000000000000000001111"),
    bigInt("10000000000000000000000000000000000000002"),
    bigInt("100000000000000000000000000000000000000000000000000000004"),
    bigInt("10000000000000000000000000000000000000000000000000000000000000000000005"),
    bigInt("1000000000000000000000000000000000000000000000000000000000000000000000000000000001"),
    bigInt("10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000088")
];

const aValues = [7, 17];

console.log("-".repeat(80));
console.log("ТАБЛИЦА 1: n (1024 бита)");
console.log("-".repeat(80));
console.log(`| ${"a".padEnd(5)} | ${"x (приблизительно)".padEnd(20)} | ${"Время (мс)".padEnd(12)} | ${"y (первые 20 цифр...)".padEnd(30)} |`);
console.log("-".repeat(80));

for (const a of aValues) {
    const n1024 = generateN(1024);
    console.log(`\n--- a = ${a} ---`);
    console.log(`n = ${n1024.toString().substring(0, 50)}... (${n1024.toString().length} цифр)`);
    
    for (const x of xValues) {
        const { y, timeMs } = measureTime(a, x, n1024);
        const xApprox = `~10^${Math.floor(Math.log10(x.valueOf()))}`;
        console.log(`| ${a.toString().padEnd(5)} | ${xApprox.padEnd(20)} | ${timeMs.toFixed(3).padEnd(12)} | ${y.substring(0, 20)}... (${y.toString().length} цифр) |`);
    }
}

console.log("-".repeat(80));

console.log("");
console.log("-".repeat(80));
console.log("ТАБЛИЦА 2: n (2048 бита)");
console.log("-".repeat(80));
console.log(`| ${"a".padEnd(5)} | ${"x (приблизительно)".padEnd(20)} | ${"Время (мс)".padEnd(12)} | ${"y (первые 20 цифр...)".padEnd(30)} |`);
console.log("-".repeat(80));

for (const a of aValues) {
    const n2048 = generateN(2048);
    console.log(`\n--- a = ${a} ---`);
    console.log(`n = ${n2048.toString().substring(0, 50)}... (${n2048.toString().length} цифр)`);
    
    for (const x of xValues) {
        const { y, timeMs } = measureTime(a, x, n2048);
        const xApprox = `~10^${Math.floor(Math.log10(x.valueOf()))}`;
        console.log(`| ${a.toString().padEnd(5)} | ${xApprox.padEnd(20)} | ${timeMs.toFixed(3).padEnd(12)} | ${y.substring(0, 20)}... (${y.toString().length} цифр) |`);
    }
}