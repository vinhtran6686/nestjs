// src/constants/message/auth.constant.ts
export const AUTH_MESSAGES = {
  ERRORS: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already exists',
    UNVERIFIED_EMAIL: 'Please verify your email first',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token',
    INVALID_VERIFICATION_TOKEN: 'Invalid or expired verification token',
    RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
    INVALID_RESET_TOKEN: 'Invalid or expired reset token',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  },
  SUCCESS: {
    REGISTERED:
      'Registration successful. Please check your email for verification',
    LOGGED_IN: 'Logged in successfully',
    LOGGED_OUT: 'Logged out successfully',
    EMAIL_VERIFIED: 'Email verified successfully',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    PASSWORD_CHANGED_SUCCESSFULLY: 'Password has been changed successfully',
    RESET_PASSWORD_EMAIL_SENT:
      'If an account exists with that email, we have sent password reset instructions',
    PASSWORD_RESET_SUCCESSFULLY: 'Your password has been reset successfully',
  },
} as const;
