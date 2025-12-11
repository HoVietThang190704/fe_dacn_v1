import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { LanguageSwitcher } from '@/components/ui';
import EmotionProvider from '@/shared/providers/EmotionProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AiAssistantMount from '@/presentation/components/ai-assistant/AiAssistantMount';

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <EmotionProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <NextIntlClientProvider messages={messages}>
          {/* <LanguageSwitcher /> */}
          {children}
          <AiAssistantMount />
        </NextIntlClientProvider>
      </GoogleOAuthProvider>
    </EmotionProvider>
  );
}