import { DynamicObject } from '@common/interfaces';

export default function ExcludeProperty<
  T extends DynamicObject,
  K extends keyof T,
>(obj: T, excludedFields: K[]) {
  const serializedObject = { ...obj };

  for (const field of excludedFields) {
    delete serializedObject[field];
  }

  return serializedObject;
}
