import {doTypeCheck} from "../utils/types";
import {randUniform01Exclusive} from "../utils/random";


/**
 * A linear function y = mx + c.
 */
export class LinearFunction {
    slope; // Number
    intercept; // Number

    constructor(slope, intercept) {
        doTypeCheck(slope, "number", "Linear Function's Slope");
        doTypeCheck(intercept, "number", "Linear Function's Intercept");

        this.slope = slope;
        this.intercept = intercept;
    }

    get(x) {
        return x * this.slope + this.intercept;
    }

    toJSON() {
        return {
            "slope": this.slope,
            "intercept": this.intercept
        };
    }

    static fromJSON(json) {
        return new LinearFunction(
            json["slope"], json["intercept"]
        );
    }
}


/**
 * Represents a gaussian distribution that is truncated
 * so that no values are generated outside the range
 * [min, max].
 */
export class TruncatedNormalDistribution {
    mean; // Number
    stdDeviation; // Number
    skewShape; // Number
    min; // Number
    max; // Number
    cdfX; // Number[]
    cdfY; // Number[]
    cdfBuckets; // Number

    constructor(mean, stdDeviation, skewShape, min, max) {
        doTypeCheck(mean, "number", "Truncated Normal Distribution's Mean");
        doTypeCheck(stdDeviation, "number", "Truncated Normal Distribution's Std. Deviation");
        doTypeCheck(skewShape, "number", "Truncated Normal Distribution's Skew Shape");
        doTypeCheck(min, "number", "Truncated Normal Distribution's Minimum Value");
        doTypeCheck(max, "number", "Truncated Normal Distribution's Maximum Value");

        this.mean = mean;
        this.stdDeviation = stdDeviation;
        this.skewShape = skewShape;
        this.min = min;
        this.max = max;

        // We generate a discrete cumulative density function for sampling,
        // as it is an easy, and accurate enough, approximation.
        this.cdfX = [];
        this.cdfY = [];
        if (stdDeviation > 0) {
            this.cdfBuckets = 500;

            // Generate the values within the truncation range.
            const effectiveMin = Math.max(min, mean - 3 * stdDeviation)
            const effectiveMax = Math.min(max, mean + 3 * stdDeviation)

            let cumulativeSum = 0.0;
            for (let index = 0; index < this.cdfBuckets; ++index) {
                const x = effectiveMin + (effectiveMax - effectiveMin) * (index / (this.cdfBuckets - 1)),
                      y = TruncatedNormalDistribution.skewNormPDF(x, mean, stdDeviation, skewShape);

                cumulativeSum += y;
                this.cdfX.push(x);
                this.cdfY.push(cumulativeSum);
            }

            // Normalise the values to [0, 1].
            for (let index = 0; index < this.cdfBuckets; ++index) {
                this.cdfY[index] = this.cdfY[index] / cumulativeSum;
            }
        } else {
            this.cdfBuckets = 0;
        }
    }

    /**
     * Creates a truncated normal distribution with a skew of zero.
     */
    static createNoSkew(mean, stdDeviation, min, max) {
        return new TruncatedNormalDistribution(
            mean, stdDeviation, 0, min, max
        )
    }

    /**
     * Retrieves a value from the probability density function of
     * a skew-normal distribution.
     */
    static skewNormPDF(x, mean, std, skew) {
        const z = (x - mean) / std;
        return 2 * TruncatedNormalDistribution.normPDF(z) * TruncatedNormalDistribution.normCDF(skew * z);
    }

    /**
     * Retrieves a value from the probability density function of a
     * standard normal distribution (mean 0, standard deviation 1).
     */
    static normPDF(x) {
        return Math.exp(-1.0 * (x*x) / 2.0) / Math.sqrt(2.0 * Math.PI)
    }

    /**
     * Retrieves a value from the cumulative density function of a
     * standard normal distribution (mean 0, standard deviation 1).
     */
    static normCDF(x) {
        // The approximation is only really accurate in the range x > 0.
        const effectiveX = Math.abs(x);

        // The Zelen & Severo approximation.
        const b0 = 0.2316419,
              b1 = 0.319381530,
              b2 = -0.356563782,
              b3 = 1.781477937,
              b4 = -1.821255978,
              b5 = 1.330274429;

        const t = 1.0 / (1 + b0 * effectiveX),
              t2 = t * t,
              t3 = t2 * t,
              t4 = t3 * t,
              t5 = t4 * t;

        let estimate = TruncatedNormalDistribution.normPDF(effectiveX) *
            (b1 * t + b2 * t2 + b3 *  t3 + b4 * t4 + b5 * t5);

        // Just in case.
        estimate = Math.max(0, Math.min(1, estimate));

        if (x < 0)
            return estimate;

        return 1.0 - estimate;
    }

    /**
     * Randomly samples this distribution.
     */
    sample() {
        if (this.stdDeviation <= 0)
            return Math.max(this.min, Math.min(this.mean, this.max));

        const y = randUniform01Exclusive();

        // Search for the corresponding value.
        for (let index = 0; index < this.cdfBuckets; ++index) {
            if (y <= this.cdfY[index])
                return this.cdfX[index];
        }

        // Just in case. This shouldn't ever be reached,
        // but you never know with floating point arithmetic.
        return this.cdfX[this.cdfX.length - 1];
    }

    toJSON() {
        return {
            "mean": this.mean,
            "stdDeviation": this.stdDeviation,
            "skewShape": this.skewShape,
            "min": this.min,
            "max": this.max
        };
    }

    static fromJSON(json) {
        const skewShape = json["skewShape"];
        return new TruncatedNormalDistribution(
            json["mean"], json["stdDeviation"],
            (skewShape === undefined ? 0 : skewShape),
            json["min"], json["max"]
        );
    }

    static exactly(value) {
        return new TruncatedNormalDistribution(value, 0, 0, value, value);
    }

    static zero() {
        return TruncatedNormalDistribution.exactly(0);
    }
}
