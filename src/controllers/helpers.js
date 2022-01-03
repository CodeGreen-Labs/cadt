'use strict';

export const paginationParams = (page, limit) => {
  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 1;
  }

  return {
    limit: limit ? limit : 15,
    offset: page ? page - 1 : 1,
  }
}

export const optionallyPaginatedResponse = ({count, rows}, page, limit) => {
  if (page) {
    return {
      page,
      pageCount: Math.max(count / (limit || 15)),
      data: rows,
    }
  } else {
    return rows;
  }
}