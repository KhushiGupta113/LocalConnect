import type { LoginValues, RegistrationValues } from '../types/user';

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return emailPattern.test(email.trim());
}

export type PasswordCheck = {
  id: 'length' | 'upper' | 'lower' | 'number';
  label: string;
  met: boolean;
};

export function passwordChecks(password: string): PasswordCheck[] {
  return [
    {
      id: 'length',
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      id: 'upper',
      label: 'An uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lower',
      label: 'A lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'A number',
      met: /[0-9]/.test(password),
    },
  ];
}

export function metPasswordCount(password: string): number {
  return passwordChecks(password).filter((check) => {
    return check.met;
  }).length;
}

export function passwordStrengthLabel(password: string): string {
  const met = metPasswordCount(password);
  if (password.length === 0) {
    return 'Enter a password';
  }
  if (met === 4) {
    return 'Strong password';
  }
  if (met === 3) {
    return 'Good password';
  }
  return 'Weak password';
}

export function validateLogin(
  values: LoginValues,
): FieldErrors<'email' | 'password'> {
  const errors: FieldErrors<'email' | 'password'> = {};
  const email = values.email.trim();
  if (email.length === 0) {
    errors.email = 'Enter your email address.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (values.password.length === 0) {
    errors.password = 'Enter your password.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

export function validateRegistration(
  values: RegistrationValues,
): FieldErrors<
  | 'fullName'
  | 'neighborhood'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'acceptedTerms'
> {
  const errors: FieldErrors<
    | 'fullName'
    | 'neighborhood'
    | 'email'
    | 'password'
    | 'confirmPassword'
    | 'acceptedTerms'
  > = {};
  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Enter your full name.';
  }
  if (values.neighborhood.trim().length < 2) {
    errors.neighborhood = 'Choose or enter your neighborhood.';
  }
  const email = values.email.trim();
  if (email.length === 0) {
    errors.email = 'Enter your email address.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (metPasswordCount(values.password) < 4) {
    errors.password = 'Use 8 or more characters with upper, lower, and a number.';
  }
  if (values.confirmPassword.length === 0) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Agree to the guidelines to create an account.';
  }
  return errors;
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

export function nameFromEmail(email: string): string {
  const localPart = email.split('@')[0] ?? '';
  const words = localPart.replace(/[._+-]+/g, ' ').trim();
  if (words.length === 0) {
    return 'Neighbor';
  }
  return words
    .split(' ')
    .map((word) => {
      if (word.length === 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
