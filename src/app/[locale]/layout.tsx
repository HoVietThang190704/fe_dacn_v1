import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { LanguageSwitcher } from '@/components/ui';

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LanguageSwitcher />
      {children}
    </NextIntlClientProvider>
  );
}