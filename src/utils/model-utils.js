import { columnsToInclude } from './helpers.js';
import Sequelize from 'sequelize';
import { encodeHex } from '../utils/datalayer-utils.js';

export function formatModelAssociationName(model) {
  if (model == null || model.model == null) return '';

  return `${model.model.name}${model.pluralize ? 's' : ''}`;
}

/**
 * Finds the deleted sub-items (e.g. labels)
 * @param updatedItems {Array<Object>} - The projects updated by the user
 * @param primaryKeyMap {Object} - Object map containing the primary keys for all tables
 * @param model {Unit | Project} - the model to operate in
 * @param modelKeyName {string} - the name of the key correspondent in {@param primaryKeyMap} for the model
 */
export async function getDeletedItems(
  updatedItems,
  primaryKeyMap,
  model,
  modelKeyName,
) {
  const updatedUnitIds = updatedItems
    .map((record) => record[primaryKeyMap[modelKeyName]])
    .filter(Boolean);
  let originalProjects = [];
  if (updatedUnitIds.length > 0) {
    const includes = model.getAssociatedModels();
    const columns = [primaryKeyMap[modelKeyName]].concat(
      includes.map(formatModelAssociationName),
    );

    const query = {
      ...columnsToInclude(columns, includes),
    };
    originalProjects = await model.findAll({
      where: {
        [primaryKeyMap[modelKeyName]]: {
          [Sequelize.Op.in]: updatedUnitIds,
        },
      },
      ...query,
    });
  }

  const associatedColumns = model
    .getAssociatedModels()
    .map(formatModelAssociationName);

  return originalProjects.map((originalItem) => {
    const result = { ...originalItem.dataValues };

    const updatedItem = updatedItems.find(
      (item) =>
        item[primaryKeyMap[modelKeyName]] ===
        originalItem[primaryKeyMap[modelKeyName]],
    );
    if (updatedItem == null) return;

    associatedColumns.forEach((column) => {
      if (originalItem[column] == null || !Array.isArray(originalItem[column]))
        return;
      if (updatedItem[column] == null || !Array.isArray(updatedItem[column]))
        return;

      result[column] = [...originalItem[column]];
      for (let index = originalItem[column].length - 1; index >= 0; --index) {
        const item = originalItem[column][index];
        if (
          updatedItem[column].findIndex(
            (searchedItem) =>
              searchedItem[primaryKeyMap[column]] ===
              item[primaryKeyMap[column]],
          ) >= 0
        )
          result[column].splice(index, 1);
      }
    });
    return result;
  });
}

export function transformStageToCommitData(stageData, primaryKeys = {}) {
  const commitData = {};

  stageData.forEach((item) => {
    const changes = JSON.parse(item.data);
    const action = item.action.toLowerCase();
    const isDelete = action === 'delete';
    const isUpdate = action === 'update';
    const dataAction = isDelete ? 'delete' : 'insert';

    changes.forEach((change) => {
      let mainEntry = null;
      let mainTableName = item.table.toLowerCase();
      mainTableName = mainTableName.endsWith('s')
        ? mainTableName.slice(0, -1)
        : mainTableName;

      for (const key in change) {
        const excludesLowerCaseName = ['walletUser'];
        const tableName = excludesLowerCaseName.includes(key)
          ? key
          : key.toLowerCase();
        const singularTableName = tableName.endsWith('s')
          ? tableName.slice(0, -1)
          : tableName;
        const primaryKey = primaryKeys[singularTableName] || 'id';

        if (typeof change[key] === 'object' && change[key] !== null) {
          // Handle object values as separate entries
          const encodedKey = encodeHex(
            `${singularTableName}|${change[key][primaryKey]}`,
          );
          const encodedValue = encodeHex(JSON.stringify(change[key]));

          if (!commitData[singularTableName]) {
            commitData[singularTableName] = [];
          }

          if (isUpdate) {
            commitData[singularTableName].push({
              action: 'delete',
              key: encodedKey,
            });
          }

          commitData[singularTableName].push({
            action: dataAction,
            key: encodedKey,
            ...(!isDelete && { value: encodedValue }),
          });
        } else {
          // Prepare main entry
          if (!mainEntry) {
            mainEntry = {
              key: `${mainTableName}|${change[primaryKey]}`,
              action: action,
              value: {},
            };
          }
          mainEntry.value[key] = change[key];
        }
      }

      if (mainEntry) {
        if (!commitData[mainTableName]) {
          commitData[mainTableName] = [];
        }

        mainEntry.key = encodeHex(mainEntry.key);
        mainEntry.value = encodeHex(JSON.stringify(mainEntry.value));

        if (isUpdate) {
          commitData[mainTableName].push({
            key: mainEntry.key,
            action: 'delete',
          });
        }

        commitData[mainTableName].push({
          ...mainEntry,
          action: dataAction,
        });
      }
    });
  });

  return commitData;
}
