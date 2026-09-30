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

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "photos" | "campaigns" | "countries" | "social" | "settings"
  >("photos");
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const tabLabels: Record<string, { en: string; ar: string }> = {
    photos: { en: "Works & Photos", ar: "المعرض والصور الفوتوغرافية" },
    campaigns: { en: "Campaigns", ar: "الحملات الإعلانية والتجارية" },
    countries: { en: "Globe Locations & Cities", ar: "المدن والمواقع (الكرة الأرضية)" },
    social: { en: "Instagram & Social Feed", ar: "تابع الرحلة وإنستغرام (Social Feed)" },
    settings: { en: "Settings, Profile & Stats", ar: "الإعدادات والبيانات الشخصية والإحصائيات" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border bg-surface flex flex-col justify-between">
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
            <button
              onClick={() => setActiveTab("photos")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-sm type-meta text-xs transition-colors ${
                activeTab === "photos"
                  ? "bg-accent/15 text-accent border border-accent/30 font-semibold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <ImageIcon className="h-4 w-4" />
                المعرض والصور
              </span>
              <span className="text-[10px] opacity-70">Photos</span>
            </button>

            <button
              onClick={() => setActiveTab("campaigns")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-sm type-meta text-xs transition-colors ${
                activeTab === "campaigns"
                  ? "bg-accent/15 text-accent border border-accent/30 font-semibold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Briefcase className="h-4 w-4" />
                الحملات والمشاريع
              </span>
              <span className="text-[10px] opacity-70">Campaigns</span>
            </button>

            <button
              onClick={() => setActiveTab("countries")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-sm type-meta text-xs transition-colors ${
                activeTab === "countries"
                  ? "bg-accent/15 text-accent border border-accent/30 font-semibold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                المدن والمواقع (الكرة الأرضية)
              </span>
              <span className="text-[10px] opacity-70">Locations</span>
            </button>

            <button
              onClick={() => setActiveTab("social")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-sm type-meta text-xs transition-colors ${
                activeTab === "social"
                  ? "bg-accent/15 text-accent border border-accent/30 font-semibold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Instagram className="h-4 w-4" />
                تابع الرحلة (إنستغرام)
              </span>
              <span className="text-[10px] opacity-70">Social</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-sm type-meta text-xs transition-colors ${
                activeTab === "settings"
                  ? "bg-accent/15 text-accent border border-accent/30 font-semibold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                الإعدادات والبروفايل والإحصائيات
              </span>
              <span className="text-[10px] opacity-70">Settings</span>
            </button>
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
      <main className="flex-1 overflow-y-auto bg-background/40">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-8 py-5 flex items-center justify-between">
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

        <div className="p-8">
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
