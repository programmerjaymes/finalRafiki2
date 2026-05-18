import PrivacyAccountClient from '@/components/account/PrivacyAccountClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account & data requests | Rafiki',
  description:
    'Delete your Rafiki account or request deletion of your account or specific personal data.',
};

export default function AccountPrivacyPage() {
  return <PrivacyAccountClient />;
}
