import { describe, expect, it } from 'vitest';
import { SEED_OPPORTUNITIES } from './seed';
import { oppToRow, rowToOpp } from './remote-map';

describe('row mapping', () => {
  it('round-trips every seed opportunity', () => {
    for (const o of SEED_OPPORTUNITIES) expect(rowToOpp(oppToRow(o))).toEqual(o);
  });
});
