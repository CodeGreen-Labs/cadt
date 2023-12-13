import { uuid } from 'uuidv4';
import { Credential, WalletUser, Staging, Organization, Rule } from '../models';
import {
  assertHomeOrgExists,
  assertNoPendingCommits,
  assertIfReadOnlyMode,
  assertCredentialLevelRecordExists,
  assertCredentialRecordExists,
} from '../utils/data-assertions';

export const findAll = async (req, res) => {
  try {
    let credentials = await Credential.findAll();

    res.status(200).json(credentials);
  } catch (error) {
    res.status(500).send(error.message);
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
