'use client';

import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({ size = 'md', showSubtitle = true, href = '/', className = '' }: BrandLogoProps) {
  const heightClass = size === 'sm' ? 'h-8' : size === 'lg' ? 'h-14' : 'h-10';

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative overflow-hidden rounded-xl bg-white p-0.5 shadow-md border border-slate-200 transition-transform group-hover:scale-105 ${heightClass}`}>
        <img
          src="/logo.jpg"
          alt="CivicFix AI Logo"
          className="h-full w-auto object-contain rounded-lg"
        />
      </div>
      <div>
        <span className="block font-black tracking-tight text-slate-950 text-base sm:text-lg leading-tight">
          CivicFix <span className="text-teal-700">AI</span>
        </span>
        {showSubtitle && (
          <span className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:block">
            Intelligent Community Solutions
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-flex items-center" aria-label="CivicFix AI Home">
        {content}
      </Link>
    );
  }

  return content;
}
