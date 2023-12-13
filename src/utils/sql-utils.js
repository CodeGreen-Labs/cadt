import {
  genericFilterRegex,
  genericSortColumnRegex,
  isArrayRegex,
} from './string-utils';
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

  // Building the order condition
  if (order?.match(genericSortColumnRegex)) {
    const matches = order.match(genericSortColumnRegex);
    orderCondition = [[matches[1], matches[2]]];
  }

  return { whereCondition, orderCondition };
};
