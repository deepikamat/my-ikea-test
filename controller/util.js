export const initializeMonthArray = () => {
    const monthlyArray = [];
    for (let month = 0; month < 12; month++) {
      monthlyArray[month] = 0;
    }
    return monthlyArray;
  }