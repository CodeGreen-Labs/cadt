import { CredentialType, Organization, Staging } from '../models';
import {
  assertHomeOrgExists,
  assertNoPendingCommits,
  assertIfReadOnlyMode,
} from '../utils/data-assertions';

export const findAll = async (req, res) => {
  try {
    // create new table if it doesn't exist
    let CredentialTypes = await CredentialType.findAll();

    res.status(200).json(CredentialTypes);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const create = async (req, res) => {
  try {
    await assertIfReadOnlyMode();
    await assertHomeOrgExists();
    await assertNoPendingCommits();

    const { orgUid } = await Organization.getHomeOrg();
    console.log(req.body);
    const existingType = await CredentialType.findOne({
      where: {
        orgUid,
        name: req.body.name,
      },
    });

    console.log(existingType);

    if (existingType)
      return res.status(400).json({
        message: 'The credential type is already in use under the organization',
        success: false,
      });

    const newCredentialType = await CredentialType.create({
      ...req.body,
      orgUid,
      commit_status: 'staged',
    });

    await Staging.upsert({
      uuid: newCredentialType.dataValues.id,
      action: 'INSERT',
      table: CredentialType.stagingTableName,
      data: JSON.stringify([newCredentialType.dataValues]),
    });

    res.json({
      message: 'Credential type staged successfully',
      success: true,
      data: newCredentialType.dataValues,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error creating new credential type',
      error: error.message,
      success: false,
    });
  }
};
