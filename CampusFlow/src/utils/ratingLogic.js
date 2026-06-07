// This function takes an array of numbers (e.g., noise ratings from 1 to 5) 
// and returns the exact average.
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  
  const sum = ratings.reduce((total, current) => total + current, 0);
  return (sum / ratings.length).toFixed(1); // Returns 1 decimal place (e.g., "4.5")
};