/**
 * HG38 intervals from gosling.js 'computeChromSizes' function
 */
function computeForAssembly(assembly?: 'hg38') {
  if (assembly === 'hg38') {
    return {
      interval: {
        chr1: [0, 248956422],
        chr2: [248956422, 491149951],
        chr3: [491149951, 689445510],
        chr4: [689445510, 879660065],
        chr5: [879660065, 1061198324],
        chr6: [1061198324, 1232004303],
        chr7: [1232004303, 1391350276],
        chr8: [1391350276, 1536488912],
        chr9: [1536488912, 1674883629],
        chr10: [1674883629, 1808681051],
        chr11: [1808681051, 1943767673],
        chr12: [1943767673, 2077042982],
        chr13: [2077042982, 2191407310],
        chr14: [2191407310, 2298451028],
        chr15: [2298451028, 2400442217],
        chr16: [2400442217, 2490780562],
        chr17: [2490780562, 2574038003],
        chr18: [2574038003, 2654411288],
        chr19: [2654411288, 2713028904],
        chr20: [2713028904, 2777473071],
        chr21: [2777473071, 2824183054],
        chr22: [2824183054, 2875001522],
        chrX: [2875001522, 3031042417],
        chrY: [3031042417, 3088269832],
      },
      size: {
        chr1: 248956422,
        chr2: 242193529,
        chr3: 198295559,
        chr4: 190214555,
        chr5: 181538259,
        chr6: 170805979,
        chr7: 159345973,
        chr8: 145138636,
        chr9: 138394717,
        chr10: 133797422,
        chr11: 135086622,
        chr12: 133275309,
        chr13: 114364328,
        chr14: 107043718,
        chr15: 101991189,
        chr16: 90338345,
        chr17: 83257441,
        chr18: 80373285,
        chr19: 58617616,
        chr20: 64444167,
        chr21: 46709983,
        chr22: 50818468,
        chrX: 156040895,
        chrY: 57227415,
      },
      total: 3088269832,
    };
  }

  throw new Error('Assembly not supported');
}

export type ChromKey =
  | 'chr1'
  | 'chr2'
  | 'chr3'
  | 'chr4'
  | 'chr5'
  | 'chr6'
  | 'chr7'
  | 'chr8'
  | 'chr9'
  | 'chr10'
  | 'chr11'
  | 'chr12'
  | 'chr13'
  | 'chr14'
  | 'chr15'
  | 'chr16'
  | 'chr17'
  | 'chr18'
  | 'chr19'
  | 'chr20'
  | 'chr21'
  | 'chr22'
  | 'chrX'
  | 'chrY';

/**
 * Utility class to convert different types of genomic positions.
 *
 * Usage:
 *
 * ```ts
 * const nav = new GenomeNavigation('hg38');
 * const absolutePosition = nav.relativeToAbsolutePosition('chr1', 100);
 * ```
 */
export class GenomeNavigation {
  private chromosomesInOrder = [...Array.from({ length: 22 }, (_, i) => `chr${i + 1}`), 'chrX', 'chrY'] as ChromKey[];

  private chromosomeSizes: Record<string, number> = {};

  private totalSize = 0;

  private averageSize = 0;

  private interval: Record<ChromKey, [number, number]>;

  constructor(assembly: 'hg38' = 'hg38') {
    const stats = computeForAssembly(assembly);

    this.chromosomeSizes = stats.size;
    this.totalSize = stats.total;

    this.interval = stats.interval as Record<ChromKey, [number, number]>;

    this.averageSize = this.totalSize / this.chromosomesInOrder.length;
  }

  getStartOfChromosome(chrom: string) {
    return this.interval[chrom as ChromKey]![0];
  }

  getEndOfChromosome(chrom: string) {
    return this.interval[chrom as ChromKey]![1];
  }

  getTotalGenomeSize() {
    return this.totalSize;
  }

  relativeToAbsolutePosition(chrom: string, pos: number) {
    console.log(chrom, pos);
    return this.interval[chrom as ChromKey]![0] + pos;
  }

  getFirstRelativePosition() {
    return {
      chromosome: this.chromosomesInOrder[0],
      position: 0,
    };
  }

  getLastRelativePosition() {
    return {
      chromosome: this.chromosomesInOrder[this.chromosomesInOrder.length - 1],
      position: this.chromosomeSizes[this.chromosomesInOrder[this.chromosomesInOrder.length - 1]!]! - 1,
    };
  }

  absoluteToRelativePosition(pos: number) {
    if (pos <= 0) {
      return this.getFirstRelativePosition();
    }
    if (pos >= this.totalSize) {
      return this.getLastRelativePosition();
    }

    // Replace with binary search for faster lookup
    for (let i = 0; i < this.chromosomesInOrder.length; i++) {
      const chromosome = this.chromosomesInOrder[i]!;

      if (this.interval[chromosome]![0] <= pos && pos < this.interval[chromosome]![1]) {
        return {
          chromosome,
          position: pos - this.interval[chromosome]![0],
        };
      }
    }

    throw new Error('Could not find the chromosome');
  }
}
