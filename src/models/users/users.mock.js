import stub from './users.stub';

export const UserMock = {
  findAll: () => stub,
  findOne: (public_key) => {
    return stub.find((record) => record.public_key == public_key);
  },
};
