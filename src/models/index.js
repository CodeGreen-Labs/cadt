import { Project } from './projects';
import { CoBenefit } from './co-benefits';
import { ProjectLocation } from './locations';
import { Label } from './labels';
import { Rating } from './ratings';
import { RelatedProject } from './related-projects';
import { Unit } from './units';
import { Issuance } from './issuances';
import { Estimation } from './estimations';
import { LabelUnit } from './labelUnits';
import { Credential } from './credentials';
import { CredentialLevel } from './credential-levels';
import { User } from './users';

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
User.associate();

export * from './projects';
export * from './co-benefits';
export * from './locations';
export * from './ratings';
export * from './labels';
export * from './related-projects';
export * from './units';
export * from './issuances';
export * from './staging';
export * from './organizations';
export * from './meta';
export * from './simulator';
export * from './labelUnits';
export * from './estimations';
export * from './audit';
export * from './governance';
export * from './file-store';
export * from './credentials';
export * from './credential-levels';
export * from './users';

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
  user: User,
  users: User,
};
