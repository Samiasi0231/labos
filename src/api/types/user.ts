export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
}

export interface LabMembership {
  id: string;
  role: string;
  permissions: string[];
  lab: {
    id: string;
    name: string;
    code: string;
  };
}

export interface MeResponse {
  user: UserProfile;
  membership: LabMembership;
}

export interface UserLabItem {
  membershipId: string;
  role: string;
  lab: {
    id: string;
    name: string;
    code: string;
  };
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface CurrentUser extends User {
  emailVerified: boolean;
  status: string;
  createdAt: string;
  staff?: {
    _id: string;
    role: string;
    status: string;
    lab: string;
    joinedAt: string;
  };
  membership?: {
    id: string;
    role: string;
    permissions: string[];
    lab: {
      id: string;
      name: string;
      code: string;
    };
  };
  patient?: {
    _id: string;
    code: string;
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    dob: string;
    lab: string;
  };
}

export interface UpdateUserProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateUserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UserAccessibleLab {
  _id: string;
  name: string;
  code: string;
  status: string;
  logo?: string;
}

export interface NigeriaState {
  state: string;
  alias: string;
  lgas: string[];
}

export interface UserLab {
  _id: string;
  name: string;
  code: string;
  status: string;
  logo?: string;
  identifier: string;
  role: string;
}