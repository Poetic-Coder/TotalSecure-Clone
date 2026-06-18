export const revenueDiff = ({thisMonthTotal, lastMonthTotal}: {thisMonthTotal: number, lastMonthTotal: number}) => {
  let differencePercent = 0;

    if (lastMonthTotal > 0) {
      differencePercent = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    } else if (thisMonthTotal > 0) {
      differencePercent = 100;
    } else {
      differencePercent = 0;
    }

    return differencePercent;
}