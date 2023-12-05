import { CredentialLevel } from '../models';
import stub from '../models/credential-levels/credential-levels.stub';
import {
  assertHomeOrgExists,
  assertIfReadOnlyMode,
  assertNoPendingCommits,
} from '../utils/data-assertions';

export const findAll = async (req, res) => {
  try {
    // create new table if it doesn't exist
    let credentialLevels = await CredentialLevel.findAll();
    await assertIfReadOnlyMode();
    await assertNoPendingCommits();
    await assertHomeOrgExists();

    // if no credential levels are found, insert default stub
    if (credentialLevels.length === 0) {
      // create new credential level table if it doesn't exist
      credentialLevels = [];
      for (const level of stub) {
        const newLevel = await CredentialLevel.create(level);
        credentialLevels.push(newLevel);
      }

      res.status(200).json(credentialLevels);
    }

    res.status(200).json(credentialLevels);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
