"use client";

import Link from "next/link";
import { useSidebar } from "./sidebar-context";

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarNavLink({ href, children, className }: Props) {
  const { close } = useSidebar();
  return (
    <Link href={href} onClick={close} className={className}>
      {children}
    </Link>
  );
}
