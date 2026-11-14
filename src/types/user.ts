export type SessionUser = {
  fullName: string;
  email: string;
  neighborhood: string;
  neighborhoodDetail: string;
  handle: string;
  bio: string;
  role: string;
  street: string;
  photoUri?: string;
  neighborCount: number;
  followingCount: number;
  streetPrivate: boolean;
  showContact: boolean;
  urgentAlerts: boolean;
};

export type RegisteredAccount = SessionUser & {
  password: string;
};

export type LoginValues = {
  email: string;
  password: string;
};

export type RegistrationValues = {
  fullName: string;
  neighborhood: string;
  neighborhoodDetail: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};
