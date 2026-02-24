import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacts',
};

export default function ContactsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className={`${lusitana.className} mb-8 text-4xl font-bold`}>Contacts</h1>
      <div className="space-y-6">
        <ContactItem label="Email" value="sevas727@gmail.com" href="mailto:sevas727@gmail.com" />
        <ContactItem label="GitHub" value="github.com/fedotov" href="https://github.com/fedotov" />
        <ContactItem
          label="LinkedIn"
          value="linkedin.com/in/vsevolod-fedotov"
          href="https://www.linkedin.com/in/vsevolod-fedotov/"
        />
      </div>
    </main>
  );
}

function ContactItem({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
      <span className="w-24 text-sm font-medium text-gray-500">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {value}
      </a>
    </div>
  );
}
