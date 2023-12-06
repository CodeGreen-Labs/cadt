import { uuid as uuidv4 } from 'uuidv4';

export default [
  {
    id: uuidv4(),
    level: 1,
    name: 'Basic Credential',
    createdAt: new Date(),
  },

  {
    id: uuidv4(),
    level: 2,
    name: 'Super Credential',
    createdAt: new Date(),
  },
];
