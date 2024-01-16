import _ from 'lodash';

export const transformStagingData = (staging) => {
  if (!staging) return staging;
  const workingData = _.cloneDeep(staging.dataValues);
  console.log('workingData', workingData);
  return {
    ...workingData,
    data: JSON.parse(workingData.data)[0],
  };
};

export const transformResult = (findAllWithCountResults) => {
  const { count, rows } = findAllWithCountResults;
  const staturesRows = rows.map((row) => {
    const staging = row.staging;
    if (!staging) return row;
    const newStagingData = transformStagingData(staging);
    return {
      ...row.dataValues,
      staging: newStagingData,
    };
  });
  return {
    count,
    rows: staturesRows,
  };
};
