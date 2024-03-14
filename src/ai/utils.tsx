export const parseArrayString = (arrayString) => {
  const array = arrayString.replace(/[[\]\s]/g, '').split(',');
  const lowerCaseFirstLetter = (str) => {
    // Remove surrounding quotes if present
    return str.replace(/^"|"$/g, '');
  };
  return array.filter((item) => item).map(lowerCaseFirstLetter);
};
