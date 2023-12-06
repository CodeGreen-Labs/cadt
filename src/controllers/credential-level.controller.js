import { CredentialLevel } from '../models';

export const findAll = async (req, res) => {
  try {
    // create new table if it doesn't exist
    let credentialLevels = await CredentialLevel.findAll();

    res.status(200).json(credentialLevels);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
