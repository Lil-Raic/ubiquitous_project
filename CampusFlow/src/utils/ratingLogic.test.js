// Unit Testing that calculates the average noise or crowd rating for a room, and then write an automated test to prove it works perfectly


import { calculateAverageRating } from './ratingLogic';

describe('Rating System Logic', () => {
  
  it('calculates the correct average when given multiple ratings', () => {
    // If three students rate the noise level a 4, 5, and 3...
    const ratings = [4, 5, 3];
    // ...the average should mathematically be exactly 4.0
    expect(calculateAverageRating(ratings)).toBe("4.0");
  });

  it('returns 0 when there are no ratings submitted yet', () => {
    // If a new study spot has zero reviews, it shouldn't crash!
    expect(calculateAverageRating([])).toBe(0);
  });

});