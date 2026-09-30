import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LogOut,
  Image as ImageIcon,
  MapPin,
  Briefcase,
  Settings,
  ExternalLink,
  Instagram,
} from "lucide-react";

import { SettingsManager } from "@/components/admin/SettingsManager";
import { PhotosManager } from "@/components/admin/PhotosManager";
import { CountriesManager } from "@/components/admin/CountriesManager";
import { CampaignsManager } from "@/components/admin/CampaignsManager";
import { SocialManager } from "@/components/admin/SocialManager";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "photos" | "campaigns" | "countries" | "social" | "settings"
  >("photos");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const tabs = [
    { id: "photos" as const, labelAr: "المعرض والصور", shortAr: "الصور", labelEn: "Photos", icon: ImageIcon },
    { id: "campaigns" as const, labelAr: "الحملات والمشاريع", shortAr: "الحملات", labelEn: "Campaigns", icon: Briefcase },
    { id: "countries" as const, labelAr: "المدن والمواقع", shortAr: "المدن", labelEn: "Locations", icon: MapPin },
    { id: "social" as const, labelAr: "تابع الرحلة", shortAr: "الرحلة", labelEn: "Social", icon: Instagram },
    { id: "settings" as const, labelAr: "الإعدادات والبروفايل", shortAr: "الإعدادات", labelEn: "Settings", icon: Settings },
  ];

  const tabLabels: Record<string, { en: string; ar: string }> = {
    photos: { en: "Works & Photos", ar: "المعرض والصور الفوتوغرافية" },
    campaigns: { en: "Campaigns", ar: "الحملات الإعلانية والتجارية" },
    countries: { en: "Globe Locations & Cities", ar: "المدن والمواقع (الكرة الأرضية)" },
    social: { en: "Instagram & Social Feed", ar: "تابع الرحلة وإنستغرام (Social Feed)" },
    settings: { en: "Settings, Profile & Stats", ar: "الإعدادات والبيانات الشخصية والإحصائيات" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Top Navigation & Header - All 5 Tabs Visible */}
      <div className="md:hidden sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border shadow-lg">
        {/* Top bar with Brand, View Live Site, and Logout */}
        <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-border/50">
          <div>
            <h1 className="font-display text-base tracking-wider text-foreground">
              ALABAD
            </h1>
            <p className="type-meta text-accent text-[9px] tracking-wide">
              لوحة التحكم / CMS
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2 py-1 rounded-sm bg-surface-2 hover:bg-accent/20 text-muted-foreground hover:text-accent type-meta text-[10px] transition-colors border border-border/40"
              title="عرض الموقع / View Live Site"
            >
              <span>الموقع</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2 py-1 rounded-sm type-meta text-[10px] text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20"
              title="تسجيل الخروج / Sign Out"
            >
              <LogOut className="h-2.5 w-2.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* 5-Column Responsive All-Visible Tabs Grid */}
        <nav className="grid grid-cols-5 gap-1 p-1.5 bg-surface-2/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-sm text-center transition-all duration-200 min-h-[46px] ${
                  isActive
                    ? "bg-accent text-background font-semibold shadow-md ring-1 ring-accent scale-[1.02]"
                    : "bg-surface/70 text-muted-foreground hover:bg-surface hover:text-foreground border border-border/40"
                }`}
              >
                <Icon className={`h-4 w-4 mb-0.5 shrink-0 ${isActive ? "text-background" : "text-accent"}`} />
                <span className="text-[10px] sm:text-[11px] font-medium leading-none tracking-tight truncate max-w-full px-0.5">
                  {tab.shortAr}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Active Section Title Header */}
        <div className="px-3.5 py-2 bg-surface/80 border-t border-border/40 flex items-center justify-between text-xs">
          <span className="text-muted-foreground text-[11px] font-sans">
            القسم: <strong className="text-accent font-semibold">{tabLabels[activeTab]?.ar}</strong>
          </span>
          <span className="text-[9px] type-meta text-muted-foreground/80">
            {tabLabels[activeTab]?.en}
          </span>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-border bg-surface flex-col justify-between flex-shrink-0">
        <div>
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl tracking-widest text-foreground">
                ALABAD
              </h1>
              <p className="type-meta text-accent text-xs mt-1">
                لوحة التحكم الإدارية / CMS
              </p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-sm bg-surface-2 hover:bg-accent/20 text-muted-foreground hover:text-accent transition-colors"
              title="عرض الموقع / View Live Site"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-sm type-meta text-xs transition-colors ${
                    isActive
                      ? "bg-accent/15 text-accent border border-accent/30 font-semibold"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {tab.labelAr}
                  </span>
                  <span className="text-[10px] opacity-70">{tab.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <div className="px-4 py-2 text-xs type-meta text-muted-foreground bg-background/50 rounded-sm">
            <span className="text-accent block font-mono text-[11px]">alabade@gmail.com</span>
            <span className="text-[10px]">Super Administrator</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm type-meta text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج / Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background/40 min-w-0">
        {/* Desktop Header */}
        <header className="hidden md:flex sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-8 py-5 items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-foreground">
              {tabLabels[activeTab]?.ar}
            </h2>
            <p className="type-meta text-xs text-muted-foreground">
              {tabLabels[activeTab]?.en}
            </p>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="type-meta text-xs text-accent hover:underline flex items-center gap-1.5"
          >
            معاينة الموقع المباشر <ExternalLink className="h-3 w-3" />
          </a>
        </header>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {activeTab === "photos" && <PhotosManager />}
          {activeTab === "campaigns" && <CampaignsManager />}
          {activeTab === "countries" && <CountriesManager />}
          {activeTab === "social" && <SocialManager />}
          {activeTab === "settings" && <SettingsManager />}
        </div>
      </main>
    </div>
  );
}
