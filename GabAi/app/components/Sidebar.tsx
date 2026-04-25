'use client'

import { useState, useEffect, useRef } from "react";
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const subLinks: Record<string, { name: string; href: string }[]> = {
  "/navigator/before": [
    { name: "Facility Routing", href: "/navigator/before#routing" },
    { name: "Documents Checklist", href: "/navigator/before#checklist" },
    { name: "Doctor Script", href: "/navigator/before#script" },
  ],
  "/navigator/during": [
    { name: "Patient Rights", href: "/navigator/during#rights" },
    { name: "Voice Logger", href: "/navigator/during#voice" },
    { name: "Document Scanner", href: "/navigator/during#scanner" },
  ],
  "/navigator/after": [
    { name: "WhatsApp Share", href: "/navigator/after#share" },
    { name: "Follow-up Check", href: "/navigator/after#followup" },
    { name: "Community Log", href: "/navigator/after#experience" },
  ],
};

export default function Sidebar() {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ left: number; notchLeft: number }>({ left: 0, notchLeft: 0 });
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const navItemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  // Calculate dropdown position under the active tab
  useEffect(() => {
    if (!openDropdown || !navItemRefs.current[openDropdown] || !navRef.current) return;
    const li = navItemRefs.current[openDropdown];
    const nav = navRef.current;
    if (!li) return;
    const liRect = li.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    // Center of the tab relative to the nav
    const tabCenterRelativeToNav = liRect.left + liRect.width / 2 - navRect.left;
    setDropdownPos({
      left: tabCenterRelativeToNav,
      notchLeft: tabCenterRelativeToNav,
    });
  }, [openDropdown, scrolled]);

  const links = [
    { name: "Before", href: "/navigator/before" },
    { name: "During", href: "/navigator/during" },
    { name: "After", href: "/navigator/after" },
  ];

  const handleTabEnter = (href: string) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpenDropdown(href);
  };

  const handleLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const handleDropdownEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 flex flex-col items-center outline-none focus:outline-none focus-visible:outline-none select-none ${scrolled ? "pt-6 px-8" : "pt-0"}`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <nav
        ref={navRef}
        className={`relative flex items-center transition-all duration-700 border w-full justify-between ${scrolled
          ? "bg-[#f2ecdc]/80 backdrop-blur-xl border-[#510400]/20 rounded-full px-10 py-4 shadow-2xl max-w-5xl gap-8"
          : "backdrop-blur-sm border-[rgba(81,4,0,0.06)] px-10 py-8 w-full max-w-7xl gap-12"
          }`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...(!scrolled && {
            background: 'linear-gradient(to bottom, rgba(242,236,220,0.28) 0%, rgba(242,236,220,0) 100%)'
          })
        }}
      >
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-4 transition-all duration-700 cursor-pointer group">
          <img 
            src="/GabAI-logo.png" 
            alt="GabAI Logo" 
            className={`transition-all duration-700 object-contain ${scrolled ? "h-10" : "h-14"}`}
          />
          <h1 className={`logo-container transition-all duration-700 ${scrolled ? "text-2xl mt-0.5" : "text-4xl"}`}>
            <span className="logo-gab">Gab</span>
            <span className="logo-ai">AI</span>
          </h1>
        </Link>

        {/* Navigation Tabs */}
        <ul 
          className={`hidden md:flex items-center transition-all duration-700 ${scrolled ? "gap-14" : "gap-20"}`}
          style={{ display: 'flex', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}
        >
          {links.map((link) => (
            <li
              key={link.name}
              ref={(el) => { navItemRefs.current[link.href] = el; }}
              className="relative"
              onMouseEnter={() => handleTabEnter(link.href)}
              onMouseLeave={handleLeave}
            >
              <Link
                href={link.href}
                className={`font-black uppercase tracking-[0.2em] transition-colors relative group py-2 whitespace-nowrap cursor-pointer bg-transparent border-none outline-none block ${scrolled ? "text-[10px]" : "text-[11px]"} ${openDropdown === link.href || pathname.startsWith(link.href)
                  ? "text-[#510400]"
                  : "text-[#3d1b11] hover:text-[#510400]"
                  }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#510400] transition-all duration-300 ${openDropdown === link.href || pathname.startsWith(link.href)
                  ? "w-full"
                  : "w-0 group-hover:w-full"
                  }`}></span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Link
            href="/onboarding"
            className={`bg-[#510400] text-white font-black uppercase tracking-widest hover:bg-[#5d1b1a] transition-all duration-700 shadow-xl hover:-translate-y-0.5 whitespace-nowrap ${scrolled ? "px-6 py-3 text-[10px] rounded-2xl" : "px-8 py-4 text-[11px] rounded-[30px]"}`}
          >
            Get Started
          </Link>
        </div>

        {/* Dropdown Sub-Nav — positioned under active tab */}
        <div
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleLeave}
          className="topnav-dropdown-card"
          style={{
            position: 'absolute',
            top: '100%',
            left: `${dropdownPos.left}px`,
            transform: openDropdown
              ? 'translate(-50%, 0) scale(1)'
              : 'translate(-50%, -18px) scale(0.96)',
            overflow: 'visible',
            maxHeight: openDropdown ? '320px' : '0px',
            opacity: openDropdown ? 1 : 0,
            transition: openDropdown
              ? 'max-height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), left 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'max-height 0.3s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease-in, transform 0.25s cubic-bezier(0.4, 0, 1, 1)',
            marginTop: openDropdown ? (scrolled ? '14px' : '-4px') : '0px',
            background: 'rgba(252, 250, 245, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(81, 4, 0, 0.1)',
            boxShadow: openDropdown
              ? '0 25px 70px rgba(61, 27, 17, 0.35), 0 10px 30px rgba(126, 38, 37, 0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
              : 'none',
            pointerEvents: openDropdown ? 'auto' : 'none',
            width: 'fit-content',
            minWidth: '220px',
            transformOrigin: 'top center',
            zIndex: 200,
          }}
        >
          {/* Notch / Arrow */}
          <div
            style={{
              position: 'absolute',
              top: '-7px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '14px',
              height: '14px',
              background: '#fcfaf5',
              borderRadius: '3px',
              borderLeft: '1px solid rgba(81, 4, 0, 0.1)',
              borderTop: '1px solid rgba(81, 4, 0, 0.1)',
              opacity: openDropdown ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />

          <div style={{
            padding: '22px 20px',
            overflow: 'hidden',
          }}>
            {openDropdown && subLinks[openDropdown] && (
              <>
                <Link
                  href={openDropdown}
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#3d1b11',
                    marginBottom: '16px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    paddingLeft: '12px',
                    display: 'block',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#510400';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#3d1b11';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {links.find((l) => l.href === openDropdown)?.name}
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {subLinks[openDropdown].map((sub, i) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className="topnav-subnav-link"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '11px 14px',
                        borderRadius: '12px',
                        color: 'rgba(61, 27, 17, 0.7)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: `dropdownItemIn 0.4s ${0.06 * (i + 1)}s both cubic-bezier(0.34, 1.56, 0.64, 1)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(81, 4, 0, 0.05)';
                        e.currentTarget.style.color = '#510400';
                        e.currentTarget.style.transform = 'translateX(6px)';
                        const arrow = e.currentTarget.querySelector('.subnav-arrow') as HTMLElement;
                        if (arrow) {
                          arrow.style.opacity = '1';
                          arrow.style.transform = 'translate(2px, -2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(61, 27, 17, 0.7)';
                        e.currentTarget.style.transform = 'translateX(0)';
                        const arrow = e.currentTarget.querySelector('.subnav-arrow') as HTMLElement;
                        if (arrow) {
                          arrow.style.opacity = '0.45';
                          arrow.style.transform = 'translate(0, 0)';
                        }
                      }}
                    >
                      <svg className="subnav-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.45, transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                      </svg>
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

    </div>
  );
}
