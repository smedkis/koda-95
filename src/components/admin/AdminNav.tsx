"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/(admin)/actions";
import { Container } from "@/components/ui/Container";
import { TextMedium } from "@/components/ui/Typography";

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-4 shrink-0"
    >
      <path
        d="M5.81186 8.93778C5.81186 5.52036 8.58222 2.75 11.9996 2.75C15.417 2.75 18.1874 5.52036 18.1874 8.93777V13.5184L19.8 17.8572H4.19922L5.81186 13.5184V8.93778Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M15.1673 17.8574V18.0834C15.1673 19.8323 13.7496 21.2501 12.0007 21.2501C10.2517 21.2501 8.83398 19.8323 8.83398 18.0834V17.8574"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="size-4 shrink-0 text-placeholder"
    >
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 14L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4 shrink-0">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AdminNav() {
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const isLoginPage = pathname === "/prijava";

  return (
    <div className="w-screen border-b border-divider bg-white ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <Container
        className={
          isLoginPage
            ? "flex items-center justify-center py-6"
            : "flex items-center justify-between py-6"
        }
      >
        <Image
          src="/logo.png"
          alt="Tahografi Cuderman"
          width={266}
          height={100}
          className="h-12 w-auto"
          priority
        />
        {isLoginPage ? null : (
          <div className="flex items-center gap-8">
            <Link href="/admin/obvescanje" className="flex items-center gap-2 text-paragraph">
              <BellIcon />
              <TextMedium as="span">Obveščanje</TextMedium>
            </Link>
            <label className="flex items-center gap-2 rounded border border-divider bg-secondary-bg px-[14px] py-[10px]">
              <SearchIcon />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Išči voznike ali termine"
                className="w-56 border-0 bg-transparent font-body text-[16px] text-paragraph placeholder-placeholder outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              <button
                type="button"
                onClick={() => setSearch("")}
                tabIndex={search ? 0 : -1}
                className={search ? "cursor-pointer" : "invisible"}
              >
                <ClearIcon />
              </button>
            </label>
            <form action={logout}>
              <button
                type="submit"
                aria-label="Odjava"
                className="flex cursor-pointer items-center"
              >
                <Image src="/Logout.svg" alt="" width={24} height={24} className="size-4 shrink-0" />
              </button>
            </form>
          </div>
        )}
      </Container>
    </div>
  );
}
