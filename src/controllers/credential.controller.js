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
    console.log(orderCondition, whereCondition);
    // Getting the credentials with filters, ordering, and pagination
    let credentials = await Credential.findAndCountAll({
      where: { ...where, ...whereCondition },
      include: Credential.getAssociatedModels(),
      order: orderCondition,
      ...pagination,
    });

    res.status(200).json({
      success: true,
      data: credentials,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error on retrieving credentials',
      error: error.message,
      success: false,
    });
  }
};

export const findById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Credential.findByPk(id);

    res.json({
      success: true,
      data: result,
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

    const { wallet_user, credential_level, document_id, expired_date } =
      req.body;
    await assertCredentialLevelRecordExists([credential_level]);
    const { orgUid } = await Organization.getHomeOrg();

    const credentialPrimaryKey = uuid();
    const walletUserPrimaryKey = uuid();

    const walletUserExists = await WalletUser.findOne({
      where: { public_key: wallet_user.public_key, orgUid },
    });

    await Staging.create({
      uuid: credentialPrimaryKey,
      action: 'INSERT',
      table: Credential.stagingTableName,
      data: JSON.stringify([
        {
          id: credentialPrimaryKey,
          credential_level,
          document_id,
          expired_date,
          wallet_user_id: walletUserExists
            ? walletUserExists.dataValues.id
            : walletUserPrimaryKey,
          orgUid,
        },
      ]),
    });

    if (!walletUserExists) {
      await Staging.create({
        uuid: walletUserPrimaryKey,
        action: 'INSERT',
        table: WalletUser.stagingTableName,
        data: JSON.stringify([
          {
            id: walletUserPrimaryKey,
            ...wallet_user,
            orgUid,
          },
        ]),
      });
    }

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
    const { wallet_user, ...credential } = req.body;
    const { id: credentialId } = credential;
    const { walletUser } = await assertCredentialRecordExists(credentialId);
    await assertCredentialLevelRecordExists([credential.credential_level]);

    if (walletUser) {
      const { id: walletUserId } = walletUser.dataValues;
      const walletUserStagedData = {
        uuid: walletUserId,
        action: 'UPDATE',
        table: WalletUser.stagingTableName,
        data: JSON.stringify([{ id: walletUserId, ...wallet_user }]),
      };
      await Staging.upsert(walletUserStagedData);
    }
    const credentialStagedData = {
      uuid: credentialId,
      action: 'UPDATE',
      table: Credential.stagingTableName,
      data: JSON.stringify([{ id: credentialId, ...credential }]),
    };

    await Staging.upsert(credentialStagedData);

    res.json({
      message: 'Credential update added to staging',
      success: true,
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

    const walletUserStagedData = {
      uuid: walletUserId,
      action: 'DELETE',
      table: WalletUser.stagingTableName,
    };
    await Staging.upsert(walletUserStagedData);

    const credentialStagedData = {
      uuid: credentialId,
      action: 'DELETE',
      table: Credential.stagingTableName,
    };

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
