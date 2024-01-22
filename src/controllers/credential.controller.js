import { uuid } from 'uuidv4';
import { Credential, WalletUser, Staging, Organization } from '../models';
import {
  assertHomeOrgExists,
  assertNoPendingCommits,
  assertIfReadOnlyMode,
  assertCredentialLevelRecordExists,
  assertCredentialRecordExists,
} from '../utils/data-assertions';
import { Sequelize } from 'sequelize';
import { paginationParams } from '../utils/helpers';
import { getQuery } from '../utils/sql-utils';
import { transformResult, transformStagingData } from '../utils/format-utils';

export const findAll = async (req, res) => {
  try {
    let { page, limit, search, orgUid, filter, order } = req.query;

    let where = {};
    if (search) {
      where = {
        [Sequelize.Op.or]: [
          { '$walletUser.name$': { [Sequelize.Op.like]: `%${search}%` } },
          { '$walletUser.public_key$': { [Sequelize.Op.like]: `%${search}%` } },
        ],
      };
    }
    if (orgUid) {
      where.orgUid = orgUid;
    }

    const { orderCondition, whereCondition } = getQuery(filter, order);

    const pagination = paginationParams(page, limit);

    let credentials = await Credential.findAndCountAll({
      where: { ...where, ...whereCondition },
      include: Credential.getAssociatedModels(),
      order: orderCondition,
      ...pagination,
    });
    res.status(200).json({
      success: true,
      data: transformResult(credentials),
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error on retrieving credentials',
      error: error.message,
      success: false,
    });
  }
};

export const findByWalletAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const result = await Credential.findOne({
      include: Credential.getAssociatedModels(),
      where: { '$walletUser.public_key$': address },
    });

    res.json({
      success: true,
      data: {
        ...result.dataValues,
        staging: transformStagingData(result.staging),
      },
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error on retrieving credential',
      error: error.message,
      success: false,
    });
  }
};

export const create = async (req, res) => {
  try {
    await assertIfReadOnlyMode();
    await assertHomeOrgExists();
    await assertNoPendingCommits();

    const { walletUser, credential_level, document_id, expired_date } =
      req.body;
    await assertCredentialLevelRecordExists([credential_level]);
    const { orgUid } = await Organization.getHomeOrg();

    const credentialPrimaryKey = uuid();
    const walletUserPrimaryKey = uuid();

    const walletUserExists = await WalletUser.findOne({
      where: { public_key: walletUser.public_key, orgUid },
    });

    let newWalletUser;

    if (!walletUserExists) {
      newWalletUser = { id: walletUserPrimaryKey, ...walletUser, orgUid };
      await WalletUser.create(newWalletUser);
    }

    const newCredential = {
      id: credentialPrimaryKey,
      credential_level,
      document_id,
      expired_date,
      wallet_user_id: walletUserExists
        ? walletUserExists.dataValues.id
        : walletUserPrimaryKey,
      orgUid,
    };

    await Credential.create(newCredential);

    await Staging.upsert({
      uuid: credentialPrimaryKey,
      action: 'INSERT',
      table: Credential.stagingTableName,
      data: JSON.stringify([
        {
          ...newCredential,
          commit_status: 'staged',
          ...(newWalletUser && {
            walletUser: newWalletUser,
          }),
        },
      ]),
    });

    res.json({
      message: 'Credential staged successfully',
      uuid,
      success: true,
      data: req.body,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error creating new credential',
      error: error.message,
      success: false,
    });
  }
};

export const update = async (req, res) => {
  try {
    await assertIfReadOnlyMode();
    await assertHomeOrgExists();
    await assertNoPendingCommits();
    const { walletUser, ...credential } = req.body;
    const { id: credentialId, credential_level } = credential;
    const { walletUser: existWalletUserRecord, ...existCredentialRecord } =
      await assertCredentialRecordExists(credentialId);

    if (credential_level) {
      await assertCredentialLevelRecordExists([credential.credential_level]);
    }

    await Credential.update(
      { commit_status: 'staged' },
      {
        where: {
          id: credentialId,
        },
      },
    );

    const credentialStagedData = {
      uuid: credentialId,
      action: 'UPDATE',
      table: Credential.stagingTableName,
      data: JSON.stringify([
        {
          ...existCredentialRecord,
          ...credential,
          commit_status: 'staged',
          ...(walletUser && {
            walletUser: {
              ...existWalletUserRecord.dataValues,
              ...walletUser,
            },
          }),
        },
      ]),
    };

    await Staging.upsert(credentialStagedData);

    res.json({
      message: 'Credential update added to staging',
      success: true,
      data: req.body,
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error updating credential',
      error: err.message,
      success: false,
    });
  }
};

export const destroy = async (req, res) => {
  try {
    await assertIfReadOnlyMode();
    await assertHomeOrgExists();
    await assertNoPendingCommits();

    const { id: credentialId } = req.body;

    const { walletUser } = await assertCredentialRecordExists(credentialId);

    const { id: walletUserId } = walletUser.dataValues;

    const credentialStagedData = {
      uuid: credentialId,
      action: 'DELETE',
      table: Credential.stagingTableName,
      data: JSON.stringify([
        {
          id: credentialId,
          walletUser: {
            id: walletUserId,
          },
        },
      ]),
    };

    await Credential.update(
      { commit_status: 'staged' },
      {
        where: {
          id: credentialId,
        },
      },
    );

    await Staging.upsert(credentialStagedData);

    res.json({
      message: 'Credential delete added to staging',
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      message: 'Error delete credential',
      error: err.message,
      success: false,
    });
  }
};
