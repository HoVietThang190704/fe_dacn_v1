import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { LanguageSwitcher } from '@/components/ui';
import EmotionProvider from '@/shared/providers/EmotionProvider';

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <EmotionProvider>
      <NextIntlClientProvider messages={messages}>
        {/* <LanguageSwitcher /> */}
        {children}
      </NextIntlClientProvider>
    </EmotionProvider>
  );
}