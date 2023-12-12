import { getPicklistValues } from './data-loaders';

export const pickListValidation = (field, name) => (value, helper) => {
  const pickList = getPicklistValues();

  if (pickList[field].includes(value)) {
    return value;
  }

  return helper.message(
    `${name || field} does not include a valid option ${pickList[field].join(
      ', ',
    )} instead got '${value}'`,
  );
};

/**
 * Returns a new object that excludes the specified keys from the original object.
 *
 * @param {object} object - The object to be filtered.
 * @param {array} keys - An array of keys to be excluded.
 * @returns {object} A new object that excludes the specified keys.
 */
export const omitObjectKeys = (object, keys) =>
  Object.fromEntries(
    Object.entries(object).filter(([key]) => !keys.includes(key)),
  );
