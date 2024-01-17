import { genericFilterRegex, isArrayRegex } from './string-utils';
import { Sequelize } from 'sequelize';

export const getQuery = (filter, order) => {
  let whereCondition = {};
  let orderCondition = [];

  if (filter) {
    const filterParts = filter.split(';');
    filterParts.forEach((filterPart) => {
      const matches = filterPart.match(genericFilterRegex);
      if (matches) {
        const keyParts = filterPart.split(':')[0];
        let value = matches[2];
        const operator = Sequelize.Op[matches[3]];
        // Convert 'true'/'false' strings to boolean values
        if (value === 'true') value = true;
        if (value === 'false') value = false;

        if (keyParts?.split('.').length === 2) {
          whereCondition[`$${keyParts}$`] = {
            [operator]: Boolean(value),
          };
        } else {
          // Non-associated table filter
          whereCondition[matches[1]] = {
            [operator]: value,
          };
        }
      }
    });
  }
  if (order) {
    // Fallback for associated table ordering
    const orderParts = order.split('.');
    if (orderParts.length === 2) {
      const fieldParts = orderParts[1].split(':');
      if (fieldParts.length === 2) {
        orderCondition = [
          [orderParts[0], fieldParts[0], fieldParts[1].toUpperCase()],
        ];
      }
    } else {
      // Fallback for non-associated table ordering
      const fieldParts = order.split(':');
      if (fieldParts.length === 2) {
        orderCondition = [[fieldParts[0], fieldParts[1].toUpperCase()]];
      }
    }
  }

  return { whereCondition, orderCondition };
};
