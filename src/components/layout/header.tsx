import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
      <Link href="/">
        <Logo width={32} height={32} />
      </Link>
    </header>
  );
}
