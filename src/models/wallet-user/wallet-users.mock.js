import stub from './wallet-users.stub';

export const WalletUserMock = {
  findAll: () => stub,
  findOne: (public_key) => {
    return stub.find((record) => record.public_key == public_key);
  },
};
