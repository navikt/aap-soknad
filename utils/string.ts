export const getStringFromPossiblyArrayQuery = (query: string | string[] | undefined) => {
  if (Array.isArray(query)) {
    return query[0];
  }
  return query;
};

export const getCommaSeparatedStringFromStringOrArray = (array: string | string[]) => {
  if (Array.isArray(array)) {
    return array.join(',');
  }
  return array;
};
