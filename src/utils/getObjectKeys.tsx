export const getObjectKeys = <T extends Record<any, any>>(obj: T): Array<keyof T> =>
  obj ? Object.keys(obj) : [];
