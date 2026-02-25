import Image from 'next/image';

export default function AppLogo() {
  return (
    <Image src="/logo-navbar.png" alt="VF" width={69} height={32} className="h-8 w-auto" priority />
  );
}
