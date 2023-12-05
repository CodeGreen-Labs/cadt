import { CoBenefit } from './co-benefits';
import { Estimation } from './estimations';
import { Issuance } from './issuances';
import { LabelUnit } from './labelUnits';
import { Label } from './labels';
import { ProjectLocation } from './locations';
import { Project } from './projects';
import { Rating } from './ratings';
import { RelatedProject } from './related-projects';
import { Rule } from './rules';
import { Unit } from './units';
import { Credential } from './credentials';
import { CredentialLevel } from './credential-levels';
import { WalletUser } from './wallet-user';

Project.associate();
CoBenefit.associate();
ProjectLocation.associate();
Label.associate();
Rating.associate();
RelatedProject.associate();
Unit.associate();
Issuance.associate();
Estimation.associate();
Credential.associate();
CredentialLevel.associate();
WalletUser.associate();
Rule.associate();

export * from './audit';
export * from './co-benefits';
export * from './estimations';
export * from './file-store';
export * from './governance';
export * from './issuances';
export * from './labelUnits';
export * from './labels';
export * from './locations';
export * from './meta';
export * from './organizations';
export * from './projects';
export * from './ratings';
export * from './related-projects';
export * from './rules';
export * from './simulator';
export * from './staging';
export * from './units';
export * from './credentials';
export * from './credential-levels';
export * from './wallet-user';

export const ModelKeys = {
  unit: Unit,
  units: Unit,
  label: Label,
  labels: Label,
  label_unit: LabelUnit,
  label_units: LabelUnit,
  labelUnit: LabelUnit,
  issuance: Issuance,
  issuances: Issuance,
  estimations: Estimation,
  coBenefits: CoBenefit,
  relatedProjects: RelatedProject,
  projects: Project,
  project: Project,
  projectRatings: Rating,
  projectLocations: ProjectLocation,
  credential: Credential,
  credentials: Credential,
  credentialLevel: CredentialLevel,
  credentialLevels: CredentialLevel,
  walletUser: WalletUser,
  walletUsers: WalletUser,
  rule: Rule,
  rules: Rule,
};
