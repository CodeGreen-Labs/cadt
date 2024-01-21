import stub from './credential-types.stub';
const CredentialTypeMock = {
  findAll: () => stub,
  findOne: (id) => {
    return stub.find((record) => record.id == id);
  },
};

export { CredentialTypeMock };
