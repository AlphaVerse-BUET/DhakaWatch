export class PythonRandom {
  private readonly mt = new Uint32Array(624);
  private index = 624;

  constructor(seed: number) {
    this.seed(seed);
  }

  seed(seed: number) {
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < 624; i += 1) {
      const previous = this.mt[i - 1] ?? 0;
      this.mt[i] =
        (Math.imul(1812433253, previous ^ (previous >>> 30)) + i) >>> 0;
    }
    this.index = 624;
  }

  random(): number {
    const a = this.extractNumber() >>> 5;
    const b = this.extractNumber() >>> 6;
    return (a * 67_108_864 + b) / 9_007_199_254_740_992;
  }

  uniform(start: number, end: number) {
    return start + (end - start) * this.random();
  }

  randint(start: number, end: number) {
    if (end < start) {
      throw new Error("randint requires end >= start");
    }
    return start + this.randBelow(end - start + 1);
  }

  private twist() {
    for (let i = 0; i < 624; i += 1) {
      const y =
        ((this.mt[i] ?? 0) & 0x80000000) +
        ((this.mt[(i + 1) % 624] ?? 0) & 0x7fffffff);
      this.mt[i] = (this.mt[(i + 397) % 624] ?? 0) ^ (y >>> 1);
      if ((y & 1) !== 0) {
        this.mt[i] ^= 0x9908b0df;
      }
    }
    this.index = 0;
  }

  private extractNumber() {
    if (this.index >= 624) {
      this.twist();
    }

    let y = this.mt[this.index] ?? 0;
    this.index += 1;

    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;

    return y >>> 0;
  }

  private getrandbits(bitCount: number) {
    if (bitCount <= 0) {
      return 0;
    }

    let result = 0;
    let bitsRemaining = bitCount;

    while (bitsRemaining > 0) {
      const take = Math.min(bitsRemaining, 32);
      const value = this.extractNumber() >>> (32 - take);
      result = result * 2 ** take + value;
      bitsRemaining -= take;
    }

    return result;
  }

  private randBelow(limit: number) {
    if (limit <= 0) {
      throw new Error("randBelow requires a positive limit");
    }

    if (limit === 1) {
      return 0;
    }

    const bitCount = Math.ceil(Math.log2(limit));
    while (true) {
      const value = this.getrandbits(bitCount);
      if (value < limit) {
        return value;
      }
    }
  }
}
