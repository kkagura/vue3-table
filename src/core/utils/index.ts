//  判断两个区间是否有交集
export const isRangeIntersected = (
  range1: [number, number],
  range2: [number, number]
) => {
  const [start1, end1] = range1;
  const [start2, end2] = range2;
  return start1 <= end2 && end1 >= start2;
};
