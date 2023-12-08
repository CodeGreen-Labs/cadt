import { uuid } from 'uuidv4';
import {
  Credential,
  CredentialLevel,
  WalletUser,
  Staging,
  Organization,
} from '../models';
import {
  assertHomeOrgExists,
  assertNoPendingCommits,
  assertIfReadOnlyMode,
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

    const { credential_level, wallet_user, document_id, expired_date } =
      req.body;
    const { orgUid } = await Organization.getHomeOrg();

    const primaryKey = uuid();

    const stagingData = {
      id: primaryKey,
      document_id,
      expired_date,
      orgUid,
    };

    const levelExists = await CredentialLevel.findOne({
      where: { level: credential_level },
    });

    if (!levelExists) {
      return res.status(400).send('Invalid level');
    } else {
      stagingData.credential_level = levelExists;
    }

    const userExists = await WalletUser.findByPk(wallet_user.public_key);
    if (!userExists) {
      const newWalletUser = await WalletUser.create(wallet_user);
      stagingData.wallet_user = newWalletUser;
    } else {
      stagingData.wallet_user = userExists;
    }

    await Staging.create({
      uuid: primaryKey,
      action: 'INSERT',
      table: Credential.stagingTableName,
      data: JSON.stringify([stagingData]),
    });

    res.json({
      message: 'Credential staged successfully',
      uuid,
      success: true,
      data: stagingData,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error creating new credential',
      error: error.message,
      success: false,
    });
  }
};
