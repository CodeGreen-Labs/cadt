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

    const body = req.body;
    const { orgUid } = await Organization.getHomeOrg();

    const credentialPrimaryKey = uuid();
    const walletUserPrimaryKey = uuid();

    const levelExists = await CredentialLevel.findOne({
      where: { level: body.credential_level },
    });

    if (!levelExists) {
      return res.status(400).send('Invalid level');
    }

    await Staging.create({
      uuid: credentialPrimaryKey,
      action: 'INSERT',
      table: Credential.stagingTableName,
      data: JSON.stringify([
        {
          ...body,
          id: credentialPrimaryKey,
          wallet_user: body.wallet_user.public_key,
          orgUid,
        },
      ]),
    });

    const walletUserExists = await WalletUser.findOne({
      where: { public_key: body.wallet_user.public_key, orgUid },
    });

    if (!walletUserExists) {
      await Staging.create({
        uuid: walletUserPrimaryKey,
        action: 'INSERT',
        table: WalletUser.stagingTableName,
        data: JSON.stringify([
          {
            id: walletUserPrimaryKey,
            ...body.wallet_user,
            orgUid,
          },
        ]),
      });
    }

    res.json({
      message: 'Credential staged successfully',
      uuid,
      success: true,
      data: body,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error creating new credential',
      error: error.message,
      success: false,
    });
  }
};
