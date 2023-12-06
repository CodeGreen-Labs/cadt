import stub from './credential-levels.stub';
const credentialLevelMock = {
  findAll: () => stub,
  findOne: (id) => {
    return stub.find((record) => record.id == id);
  },
};

export { credentialLevelMock };
