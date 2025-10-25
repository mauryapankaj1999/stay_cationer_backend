export const setDayEndTime = (actualDate: Date) => {
  return new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate(), 23, 59, 59);
};

export const setDayStartTime = (actualDate: Date) => {
  return new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate(), 0, 0, 0);
};
