import SeedProjects from './20211209204301-add-projects';
import SeedUnits from './20211209205139-add-units';
import SeedOrgs from './20220121232631-add-test-organization';
import CredentialLevels from './add-credential-levels';

export const seeders = [
  {
    seed: SeedProjects,
    name: '20211209204301-add-projects',
  },
  {
    seed: SeedUnits,
    name: '20211209205139-add-units',
  },
  {
    seed: SeedOrgs,
    name: '20220121232631-add-test-organization',
  },
  {
    seed: CredentialLevels,
    name: 'create-credential-levels',
    isDefault: true,
  },
];
