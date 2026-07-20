"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout, searchDriversAction } from "@/app/(admin)/actions";
import { Container } from "@/components/ui/Container";
import { Text, TextMedium } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import type { DriverSearchResult } from "@/lib/data/registrations";

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

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("size-5 shrink-0", className)}>
      <path d="M7.16367 10.4277V16.4576" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M12.0006 7.54297V16.4581" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
      <path d="M16.8365 13.6143V16.4577" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.25 21.25L21.25 2.75L2.75 2.75L2.75 21.25L21.25 21.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("size-5 shrink-0", className)}>
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5 shrink-0">
      {open ? (
        <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : (
        <>
          <path d="M4 7H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function AdminNav() {
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [results, setResults] = useState<DriverSearchResult[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/prijava";

  useEffect(() => {
    const trimmed = search.trim();
    if (!trimmed) return;
    const timeout = setTimeout(() => {
      searchDriversAction(trimmed).then(setResults);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const visibleResults = search.trim() ? results : [];

  const handleSelect = (terminId: string, driverId: string) => {
    setSearch("");
    setIsFocused(false);
    setIsMobileMenuOpen(false);
    router.push(`/admin/termini/${terminId}/vozniki/${driverId}`);
  };

  const searchResultsDropdown = isFocused && search.trim() ? (
    <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded border border-divider bg-white shadow-lg lg:right-0 lg:left-auto lg:w-80">
      {visibleResults.length > 0 ? (
        visibleResults.map(({ driver, terminId, terminTitle }) => (
          <button
            key={`${terminId}-${driver.id}`}
            type="button"
            onClick={() => handleSelect(terminId, driver.id)}
            className="flex w-full cursor-pointer flex-col items-start gap-0.5 border-b border-divider px-4 py-3 text-left last:border-b-0 hover:bg-secondary-bg"
          >
            <TextMedium className="text-[14px]">{driver.driverName}</TextMedium>
            <Text className="text-[12px] text-placeholder">{terminTitle}</Text>
          </button>
        ))
      ) : (
        <div className="px-4 py-3">
          <Text className="text-[14px] text-placeholder">Ni zadetkov</Text>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="w-screen border-b border-divider bg-white ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]">
      <Container
        className={
          isLoginPage
            ? "flex items-center justify-center py-6"
            : "flex items-center justify-between py-6"
        }
      >
        {isLoginPage ? (
          <Image
            src="/logo.png"
            alt="Tahografi Cuderman"
            width={266}
            height={100}
            className="h-12 w-auto"
            priority
          />
        ) : (
          <Link href="/admin/termini" className="shrink-0">
            <Image
              src="/logo.png"
              alt="Tahografi Cuderman"
              width={266}
              height={100}
              className="h-10 w-auto lg:h-12"
              priority
            />
          </Link>
        )}
        {isLoginPage ? null : (
          <div className="flex items-center gap-4 lg:gap-8">
            <label className="relative hidden items-center gap-2 rounded border border-divider bg-secondary-bg px-[14px] py-[10px] lg:flex">
              <SearchIcon />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                placeholder="Išči voznike"
                className="w-40 border-0 bg-transparent font-body text-[16px] text-paragraph placeholder-placeholder outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              <button
                type="button"
                onClick={() => setSearch("")}
                tabIndex={search ? 0 : -1}
                className={search ? "cursor-pointer" : "invisible"}
              >
                <ClearIcon />
              </button>
              {searchResultsDropdown}
            </label>
            <Link href="/admin/obvescanje" aria-label="Obveščanje" className="flex items-center">
              <BellIcon
                className={pathname === "/admin/obvescanje" ? "text-primary" : "text-[#402E32]"}
              />
            </Link>
            <Link href="/admin/statistika" aria-label="Statistika" className="flex items-center">
              <ChartIcon
                className={pathname === "/admin/statistika" ? "text-primary" : "text-[#402E32]"}
              />
            </Link>
            <form action={logout}>
              <button
                type="submit"
                aria-label="Odjava"
                className="flex cursor-pointer items-center"
              >
                <Image src="/Logout.svg" alt="" width={20} height={20} className="size-5 shrink-0" />
              </button>
            </form>
            <button
              type="button"
              aria-label="Meni"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="flex cursor-pointer items-center text-[#402E32] lg:hidden"
            >
              <MenuIcon open={isMobileMenuOpen} />
            </button>
          </div>
        )}
      </Container>
      {!isLoginPage && isMobileMenuOpen ? (
        <div className="border-t border-divider px-4 py-4 lg:hidden">
          <label className="relative flex items-center gap-2 rounded border border-divider bg-secondary-bg px-[14px] py-[10px]">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              placeholder="Išči voznike"
              className="w-full border-0 bg-transparent font-body text-[16px] text-paragraph placeholder-placeholder outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={() => setSearch("")}
              tabIndex={search ? 0 : -1}
              className={search ? "cursor-pointer" : "invisible"}
            >
              <ClearIcon />
            </button>
            {searchResultsDropdown}
          </label>
        </div>
      ) : null}
    </div>
  );
}
