// Email components
export { EmailVerificationModal } from './EmailVerificationModal';
export { InviteUserModal } from './InviteUserModal';
export { ChangeEmailModal } from './ChangeEmailModal';
export { MagicLinkModal } from './MagicLinkModal';
export { EmailCallbackPage } from './EmailCallbackPage';
export { EmailTemplateConfig } from './EmailTemplateConfig';

// Email services and hooks
export { EmailService } from '../../services/EmailService';
export { useEmailAuth, useEmailTemplatesConfig, useEmailVerification } from '../../hooks/useEmailAuth';

// Types
export type { EmailTemplate, EmailConfigOptions } from '../../services/EmailService';
