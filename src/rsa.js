// RSA Cryptographic Algorithm & Mathematical Engine

export class RSACryptoEngine {
  // Check if a number is prime (supports BigInt & Number)
  static isPrime(num) {
    const n = BigInt(num);
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n || n % 3n === 0n) return false;
    for (let i = 5n; i * i <= n; i += 6n) {
      if (n % i === 0n || n % (i + 2n) === 0n) {
        return false;
      }
    }
    return true;
  }

  // Calculate Greatest Common Divisor (GCD) with BigInt
  static gcd(a, b) {
    let x = BigInt(a);
    let y = BigInt(b);
    while (y !== 0n) {
      const temp = y;
      y = x % y;
      x = temp;
    }
    return x;
  }

  // Extended Euclidean Algorithm: returns { gcd, x, y, steps }
  // such that a*x + b*y = gcd(a, b)
  static extendedGCD(a, b) {
    let x0 = 1n, x1 = 0n;
    let y0 = 0n, y1 = 1n;
    let r0 = BigInt(a), r1 = BigInt(b);
    const steps = [];

    while (r1 !== 0n) {
      const q = r0 / r1;
      const r2 = r0 % r1;
      const x2 = x0 - q * x1;
      const y2 = y0 - q * y1;

      steps.push({
        q: q.toString(),
        r0: r0.toString(),
        r1: r1.toString(),
        rem: r2.toString(),
        x0: x0.toString(),
        x1: x1.toString(),
        x2: x2.toString()
      });

      r0 = r1;
      r1 = r2;
      x0 = x1;
      x1 = x2;
      y0 = y1;
      y1 = y2;
    }

    return {
      gcd: r0,
      x: x0,
      y: y0,
      steps
    };
  }

  // Modular Multiplicative Inverse: d = e^(-1) mod phi
  static modInverse(e, phi) {
    const eBig = BigInt(e);
    const phiBig = BigInt(phi);
    const egcd = this.extendedGCD(eBig, phiBig);

    if (egcd.gcd !== 1n) {
      return null; // Inverse doesn't exist
    }

    let d = egcd.x % phiBig;
    if (d < 0n) {
      d += phiBig;
    }
    return d;
  }

  // Fast Modular Exponentiation: base^exp mod mod
  // with step-by-step trace for educational animation
  static modPowWithTrace(base, exp, mod) {
    let b = BigInt(base) % BigInt(mod);
    let e = BigInt(exp);
    const m = BigInt(mod);
    let result = 1n;
    const steps = [];

    const binaryExp = e.toString(2);
    let currentPower = b;

    for (let i = binaryExp.length - 1; i >= 0; i--) {
      const bit = binaryExp[i];
      const prevResult = result;
      
      if (bit === '1') {
        result = (result * currentPower) % m;
        steps.push({
          bitIndex: binaryExp.length - 1 - i,
          bit: '1',
          power: currentPower.toString(),
          prevResult: prevResult.toString(),
          newResult: result.toString(),
          formula: `(${prevResult} × ${currentPower}) mod ${m} = ${result}`
        });
      } else {
        steps.push({
          bitIndex: binaryExp.length - 1 - i,
          bit: '0',
          power: currentPower.toString(),
          prevResult: prevResult.toString(),
          newResult: result.toString(),
          formula: `Bit 0: skip multiplication (result remains ${result})`
        });
      }
      currentPower = (currentPower * currentPower) % m;
    }

    return {
      result,
      binaryExp,
      steps
    };
  }

  // Direct fast modular exponentiation
  static modPow(base, exp, mod) {
    let b = BigInt(base) % BigInt(mod);
    let e = BigInt(exp);
    const m = BigInt(mod);
    let result = 1n;

    while (e > 0n) {
      if (e & 1n) {
        result = (result * b) % m;
      }
      b = (b * b) % m;
      e >>= 1n;
    }
    return result;
  }

  // List valid public exponent candidates for given phi
  static getCandidateExponents(phi, limit = 8) {
    const phiBig = BigInt(phi);
    const candidates = [];
    const standardPrimes = [3n, 5n, 17n, 257n, 65537n];

    for (const p of standardPrimes) {
      if (p < phiBig && this.gcd(p, phiBig) === 1n) {
        candidates.push(p);
      }
    }

    let candidate = 3n;
    while (candidates.length < limit && candidate < phiBig) {
      if (!candidates.includes(candidate) && this.isPrime(candidate) && this.gcd(candidate, phiBig) === 1n) {
        candidates.push(candidate);
      }
      candidate += 2n;
    }

    return candidates.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  // Generate a random prime within [min, max]
  static generateRandomPrime(min = 10, max = 150) {
    const range = max - min + 1;
    let attempts = 0;
    while (attempts < 500) {
      const candidate = Math.floor(Math.random() * range) + min;
      if (this.isPrime(candidate)) {
        return candidate;
      }
      attempts++;
    }
    return 61; // Fallback safe prime
  }

  // Encrypt an integer message M using public key (e, n)
  static encryptNumber(m, e, n) {
    const mBig = BigInt(m);
    const eBig = BigInt(e);
    const nBig = BigInt(n);
    if (mBig >= nBig) {
      throw new Error(`Message ${mBig} must be less than modulus n = ${nBig}`);
    }
    return this.modPow(mBig, eBig, nBig);
  }

  // Decrypt a ciphertext C using private key (d, n)
  static decryptNumber(c, d, n) {
    const cBig = BigInt(c);
    const dBig = BigInt(d);
    const nBig = BigInt(n);
    return this.modPow(cBig, dBig, nBig);
  }

  // Encrypt an array/sequence of plaintext key numbers
  static encryptNumberSequence(numbers, e, n) {
    const nBig = BigInt(n);
    const eBig = BigInt(e);
    const results = [];

    for (let i = 0; i < numbers.length; i++) {
      const mBig = BigInt(numbers[i]);
      if (mBig >= nBig || mBig < 0n) {
        throw new Error(`Key number ${mBig} at index ${i + 1} must satisfy 0 ≤ M < ${nBig}.`);
      }
      const cipher = this.modPow(mBig, eBig, nBig);
      results.push({
        index: i,
        keyNumber: mBig.toString(),
        binary: mBig.toString(2).padStart(8, '0'),
        cipher: cipher.toString()
      });
    }

    return results;
  }

  // Decrypt an array/sequence of ciphertext numbers back to key numbers
  static decryptNumberSequence(ciphers, d, n) {
    const nBig = BigInt(n);
    const dBig = BigInt(d);
    const results = [];

    for (let i = 0; i < ciphers.length; i++) {
      const c = BigInt(ciphers[i]);
      const decryptedNumber = this.modPow(c, dBig, nBig);
      results.push({
        index: i,
        cipher: c.toString(),
        decryptedNumber: decryptedNumber.toString()
      });
    }

    return results;
  }
}

