import {camelCase} from "lodash";

export function mapToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => mapToCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = camelCase(key);
      result[camelKey] = mapToCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}
