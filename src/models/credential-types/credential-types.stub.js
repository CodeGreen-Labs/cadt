import { uuid as uuidv4 } from 'uuidv4';

export default [
  {
    id: uuidv4(),
    name: 'Basic Credential',
    createdAt: new Date(),
    updatedAt: new Date(),
    commit_status: 'committed',
  },

  {
    id: uuidv4(),
    name: 'Super Credential',
    createdAt: new Date(),
    updatedAt: new Date(),
    commit_status: 'committed',
  },
];
