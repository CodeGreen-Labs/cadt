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
    res.status(200).json({
      success: true,
      data: CredentialTypes,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    await assertIfReadOnlyMode();
    await assertHomeOrgExists();
    await assertNoPendingCommits();

    const { orgUid } = await Organization.getHomeOrg();
    const existingType = await CredentialType.findOne({
      where: {
        orgUid,
        name: req.body.name,
      },
    });

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

export const update = async (req, res) => {
  try {
    await assertIfReadOnlyMode();
    await assertHomeOrgExists();
    await assertNoPendingCommits();

    const { id, ...data } = req.body;
    const { orgUid } = await Organization.getHomeOrg();
    const existingType = await CredentialType.findOne({
      where: {
        orgUid,
        id,
      },
    });

    if (!existingType)
      return res.status(400).json({
        message: 'The credential type is not existing under the organization.',
        success: false,
      });

    await CredentialType.update(
      { commit_status: 'staged', ...data },
      {
        where: {
          id,
          orgUid,
        },
      },
    );

    const credentialStagedData = {
      uuid: id,
      action: 'UPDATE',
      table: CredentialType.stagingTableName,
      data: JSON.stringify([
        {
          ...existingType.dataValues,
          ...data,
          commit_status: 'staged',
        },
      ]),
    };

    await Staging.upsert(credentialStagedData);

    res.json({
      message: 'Credential type update added to staging.',
      success: true,
      data: req.body,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error updating credential type',
      error: error.message,
      success: false,
    });
  }
};
