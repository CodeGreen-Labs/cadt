import { genericFilterRegex, isArrayRegex } from './string-utils';
import { Sequelize } from 'sequelize';

export const getQuery = (filter, order) => {
  let whereCondition = {};
  let orderCondition = [];

  if (filter) {
    // Split the filter string by semicolon to handle multiple filters
    const filterParts = filter.split(';');
    filterParts.forEach((filterPart) => {
      const matches = filterPart.match(genericFilterRegex);
      if (matches) {
        const valueMatches = matches[2].match(isArrayRegex);
        whereCondition[matches[1]] = {
          [Sequelize.Op[matches[3]]]: valueMatches
            ? JSON.parse(matches[2].replace(/'/g, '"')) // replace single quotes with double quotes for valid JSON
            : matches[2],
        };
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
