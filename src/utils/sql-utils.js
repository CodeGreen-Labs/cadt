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
    const matches = filter.match(genericFilterRegex);
    if (matches) {
      // check if the value param is an array so we can parse it
      const valueMatches = matches[2].match(isArrayRegex);
      whereCondition[matches[1]] = {
        [Sequelize.Op[matches[3]]]: valueMatches
          ? JSON.parse(matches[2].replace(/'/g, '"')) // replace single quotes with double quotes for valid JSON
          : matches[2],
      };
    }
  }

  // Building the order condition
  if (order?.match(genericSortColumnRegex)) {
    const matches = order.match(genericSortColumnRegex);
    orderCondition = [[matches[1], matches[2]]];
  }

  return { whereCondition, orderCondition };
};
