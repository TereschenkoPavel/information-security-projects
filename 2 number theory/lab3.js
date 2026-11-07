const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function gcd(a, b) {
  if (!b) {
    return a;
  }
  return gcd(b, a % b);
}
function primeFactors(n) {
  const factors = [];
  let divisor = 2;

  while (n >= 2) {
    if (n % divisor == 0) {
      factors.push(divisor);
      n = n / divisor;
    } else {
      divisor++;
    }
  }
  return factors;
}

function isPrime(num) {
  for (let i = 2; i < num; i++) {
    if (num % i === 0) return false;
  }
  return num !== 1;
}

function questionAsync(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

(async ()=>{
  await (async ()=>{
  
  let m = 587
  
  
    let n = 621; 
    m = gcd(n,m)
  
  console.log('НОД: ',m)
  })()  
  await (async ()=>{  
    const n = 621
    let num = 0;
    for (let i = 2; i <= n; i++) {
        if (isPrime(i)){
            console.log(i);
            num++
        } 
    }
    console.log('простых чисел найдено: ',num)
    console.log('n/ln(n): ',Math.round(n/Math.log(n)))
  })()

  await (async ()=>{
      const m = 587;
      const n = 621;
      let num = 0;
      for (let i = m; i <= n; i++) {
          if (isPrime(i)){
              console.log(i);
              num++
          } 
      }
      console.log('простых чисел найдено: ',num)
      console.log('n/ln(n) - m/ln(n) - Ф: ',Math.round(n/Math.log(n)- m/Math.log(m)))
      rl.close();
  })()
  console.log('каноническая форма 587: ',primeFactors(587))
  console.log('каноническая форма 621: ',primeFactors(621))
})()
