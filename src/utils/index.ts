export const splitObject = <T extends Record<string, any>>(
  obj: T,
  keysToExtract: (keyof T)[]
) => {
  const extracted: Partial<T> = {};
  const remaining: Partial<T> = {};

  Object.keys(obj).forEach((key) => {
    if (keysToExtract.includes(key as keyof T)) {
      extracted[key as keyof T] = obj[key as keyof T];
    } else {
      remaining[key as keyof T] = obj[key as keyof T];
    }
  });

  return { extracted, remaining };
};
