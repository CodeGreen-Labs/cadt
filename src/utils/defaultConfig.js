export const defaultConfig = {
  MIRROR_DB: {
    DB_USERNAME: null,
    DB_PASSWORD: null,
    DB_NAME: null,
    DB_HOST: null,
  },
  APP: {
    CW_PORT: 31310,
    BIND_ADDRESS: 'localhost',
    DATALAYER_URL: 'https://localhost:8562',
    WALLET_URL: 'https://localhost:9256',
    USE_SIMULATOR: false,
    READ_ONLY: false,
    CADT_API_KEY: null,
    CHIA_NETWORK: 'mainnet',
    USE_DEVELOPMENT_MODE: false,
    IS_GOVERNANCE_BODY: true,
    DEFAULT_FEE: 0,
    DEFAULT_COIN_AMOUNT: 0,
    CERTIFICATE_FOLDER_PATH: null,
    DATALAYER_FILE_SERVER_URL: null,
    AUTO_SUBSCRIBE_FILESTORE: false,
    TASKS: {
      GOVERNANCE_SYNC_TASK_INTERVAL: 86400,
      ORGANIZATION_META_SYNC_TASK_INTERVAL: 300,
      PICKLIST_SYNC_TASK_INTERVAL: 30,
    },
  },
  GOVERNANCE: {
    GOVERNANCE_BODY_ID: null,
  },
};
