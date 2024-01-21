import { CredentialType } from '../models';

export const findAll = async (req, res) => {
  try {
    // create new table if it doesn't exist
    let CredentialTypes = await CredentialType.findAll();

    res.status(200).json(CredentialTypes);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
