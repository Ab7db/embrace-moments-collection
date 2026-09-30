import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import type { DbSiteProfile, DbStat } from "@/lib/database.types";
import { Save, User, BarChart3, Camera, Link as LinkIcon, CheckCircle2, RefreshCw } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

export function SettingsManager() {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "stats" | "gear" | "social">("profile");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Query
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["site_profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_profile")
        .select("*")
        .eq("id", 1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return (data as DbSiteProfile) || null;
    },
  });

  // Stats Query
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stats")
        .select("*")
        .order("id");
      if (error) throw error;
      return (data as DbStat[]) || [];
    },
  });

  const [profileForm, setProfileForm] = useState<Partial<DbSiteProfile>>({});
  const [statsForm, setStatsForm] = useState<DbStat[]>([]);

  useEffect(() => {
    if (profile) {
      setProfileForm(profile);
    }
  }, [profile]);

  useEffect(() => {
    if (stats && stats.length > 0) {
      setStatsForm(stats);
    } else if (stats && stats.length === 0) {
      // Default initial stats if table is empty
      setStatsForm([
        { id: 1, value: 250, suffix: "+", label_en: "Projects", label_ar: "مشروع" },
        { id: 2, value: 10, suffix: "+", label_en: "Cities", label_ar: "مدينة" },
        { id: 3, value: 20, suffix: "", label_en: "Campaigns", label_ar: "حملة" },
        { id: 4, value: 100, suffix: "K+", label_en: "Community", label_ar: "مجتمع ومتابع" },
      ]);
    }
  }, [stats]);

  // Profile Mutation
  const profileMutation = useMutation({
    mutationFn: async (updates: Partial<DbSiteProfile>) => {
      const payload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("site_profile")
        .upsert({ id: 1, ...payload } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_profile"] });
      showNotification("تم حفظ البيانات الشخصية وصورة البروفايل بنجاح!");
    },
    onError: (err: any) => {
      alert("خطأ أثناء حفظ البيانات: " + (err.message || "حدث خطأ"));
    },
  });

  // Stats Mutation
  const statsMutation = useMutation({
    mutationFn: async (updatedStats: DbStat[]) => {
      for (const stat of updatedStats) {
        const { error } = await supabase
          .from("stats")
          .upsert({
            id: stat.id,
            value: Number(stat.value) || 0,
            suffix: stat.suffix || "",
            label_en: stat.label_en || "",
            label_ar: stat.label_ar || "",
          } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      showNotification("تم تحديث إحصائيات (المشاريع، المدن، الحملات، المجتمع) بنجاح!");
    },
    onError: (err: any) => {
      alert("خطأ أثناء حفظ الإحصائيات: " + (err.message || "حدث خطأ"));
    },
  });

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStatChange = (
    index: number,
    field: keyof DbStat,
    val: any
  ) => {
    setStatsForm((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: val };
      }
      return copy;
    });
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    await profileMutation.mutateAsync(profileForm);
    if (statsForm.length > 0) {
      await statsMutation.mutateAsync(statsForm);
    }
  };

  if (isProfileLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground type-meta">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        جاري تحميل الإعدادات...
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Notification banner */}
      {successMessage && (
        <div className="p-4 bg-accent/15 border border-accent text-accent rounded-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="type-meta text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Sub-tabs header */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm type-meta text-xs transition-colors ${
            activeSubTab === "profile"
              ? "bg-accent text-background font-semibold"
              : "text-muted-foreground hover:bg-surface hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          البروفايل والصورة الشخصية / Bio & Portrait
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("stats")}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm type-meta text-xs transition-colors ${
            activeSubTab === "stats"
              ? "bg-accent text-background font-semibold"
              : "text-muted-foreground hover:bg-surface hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          الإحصائيات والأرقام / Stats (المشاريع، المدن، الحملات، المجتمع)
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("gear")}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm type-meta text-xs transition-colors ${
            activeSubTab === "gear"
              ? "bg-accent text-background font-semibold"
              : "text-muted-foreground hover:bg-surface hover:text-foreground"
          }`}
        >
          <Camera className="h-4 w-4" />
          المعدات ومقر العمل / Gear & Location
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("social")}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm type-meta text-xs transition-colors ${
            activeSubTab === "social"
              ? "bg-accent text-background font-semibold"
              : "text-muted-foreground hover:bg-surface hover:text-foreground"
          }`}
        >
          <LinkIcon className="h-4 w-4" />
          التواصل والروابط / Contact & Socials
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* TAB 1: Profile & Portrait Image */}
        {activeSubTab === "profile" && (
          <div className="space-y-6 animate-fade-in">
            {/* Profile Picture Upload Section */}
            <div className="p-6 border border-border bg-surface/60 rounded-sm">
              <h3 className="type-meta text-accent mb-2">صورة البروفايل الشخصية / Profile Portrait</h3>
              <p className="type-meta text-xs text-muted-foreground mb-4">
                تظهر في قسم السيرة الذاتية (About ALABAD) وبطاقة التعريف في الصفحة الرئيسية
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1">
                  <ImageUpload
                    label="صورة البروفايل (Portrait)"
                    folder="profiles"
                    value={profileForm.profile_image_url || ""}
                    onChange={(url) =>
                      setProfileForm((prev) => ({ ...prev, profile_image_url: url }))
                    }
                    aspectRatio="portrait"
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 bg-background/60 border border-border rounded-sm">
                    <h4 className="font-display text-sm text-foreground mb-1">
                      معاينة هوية المصور
                    </h4>
                    <p className="type-meta text-xs text-accent">
                      {profileForm.real_name_ar || "عبدالكريم فيصل (ALABAD)"}
                    </p>
                    <p className="type-meta text-xs text-muted-foreground mt-1">
                      {profileForm.role_ar || "صانع محتوى بصري ومصور"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                      {profileForm.bio_ar || "صانع قصص بصرية تحركه لعبة الضوء والظل..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Identity & Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 border border-border bg-surface/60 rounded-sm">
              <div className="md:col-span-2">
                <h3 className="type-meta text-accent">الاسم والصفة المهنية / Identity & Role</h3>
              </div>

              <div>
                <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                  Real Name / Brand (EN)
                </label>
                <input
                  name="real_name_en"
                  placeholder="e.g. Abdulkarim Faisal (ALABAD)"
                  value={profileForm.real_name_en || ""}
                  onChange={handleProfileChange}
                  className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
                />
              </div>

              <div>
                <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                  الاسم الكامل / الهوية (عربي)
                </label>
                <input
                  name="real_name_ar"
                  placeholder="مثال: عبدالكريم فيصل (العباد)"
                  value={profileForm.real_name_ar || ""}
                  onChange={handleProfileChange}
                  dir="rtl"
                  className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
                />
              </div>

              <div>
                <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                  Professional Role (EN)
                </label>
                <input
                  name="role_en"
                  placeholder="e.g. Visual Storyteller & Photographer"
                  value={profileForm.role_en || ""}
                  onChange={handleProfileChange}
                  className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
                />
              </div>

              <div>
                <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                  الصفة المهنية (عربي)
                </label>
                <input
                  name="role_ar"
                  placeholder="مثال: صانع قصص بصرية ومصور فوتوغرافي"
                  value={profileForm.role_ar || ""}
                  onChange={handleProfileChange}
                  dir="rtl"
                  className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
                />
              </div>
            </div>

            {/* Biography */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 border border-border bg-surface/60 rounded-sm">
              <div className="md:col-span-2">
                <h3 className="type-meta text-accent">النبذة والسيرة الذاتية / Biography</h3>
              </div>

              <div>
                <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                  Bio Paragraph 1 (EN)
                </label>
                <textarea
                  name="bio_en"
                  placeholder="A visual storyteller driven by the interplay of light and shadow..."
                  value={profileForm.bio_en || ""}
                  onChange={handleProfileChange}
                  rows={4}
                  className="w-full bg-background border border-border px-3 py-2 rounded-sm resize-none text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                  النبذة التعريفية - الفقرة الأولى (عربي)
                </label>
                <textarea
                  name="bio_ar"
                  placeholder="صانع قصص بصرية تحركه لعبة الضوء والظل وتوثيق اللحظات العابرة..."
                  value={profileForm.bio_ar || ""}
                  onChange={handleProfileChange}
                  rows={4}
                  dir="rtl"
                  className="w-full bg-background border border-border px-3 py-2 rounded-sm resize-none text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                  Bio Paragraph 2 (EN)
                </label>
                <textarea
                  name="bio2_en"
                  placeholder="Specializing in commercial, lifestyle, and travel photography..."
                  value={profileForm.bio2_en || ""}
                  onChange={handleProfileChange}
                  rows={4}
                  className="w-full bg-background border border-border px-3 py-2 rounded-sm resize-none text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                  النبذة التعريفية - الفقرة الثانية (عربي)
                </label>
                <textarea
                  name="bio2_ar"
                  placeholder="متخصص في تصوير الحملات التجارية، نمط الحياة، وثقافة السفر..."
                  value={profileForm.bio2_ar || ""}
                  onChange={handleProfileChange}
                  rows={4}
                  dir="rtl"
                  className="w-full bg-background border border-border px-3 py-2 rounded-sm resize-none text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Stats (Community, Projects, Campaigns, Cities) */}
        {activeSubTab === "stats" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 border border-border bg-surface/60 rounded-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="type-meta text-accent">
                    إحصائيات الإنجاز / Performance & Stats Counter
                  </h3>
                  <p className="type-meta text-xs text-muted-foreground mt-0.5">
                    تظهر هذه الأرقام في قسم السيرة الذاتية (About Section) بعدادات متحركة فور التمرير
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {statsForm.map((stat, idx) => (
                  <div
                    key={stat.id || idx}
                    className="p-4 bg-background/80 border border-border rounded-sm space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="type-meta text-xs text-accent font-semibold">
                        {idx === 0
                          ? "1. المشاريع / Projects"
                          : idx === 1
                          ? "2. المدن / Cities"
                          : idx === 2
                          ? "3. الحملات / Campaigns"
                          : "4. المجتمع / Community"}
                      </span>
                      <span className="type-meta text-[10px] text-muted-foreground font-mono">
                        ID: {stat.id}
                      </span>
                    </div>

                    <div>
                      <label className="type-meta text-[11px] text-muted-foreground block mb-1">
                        القيمة الرقمية / Numeric Value
                      </label>
                      <input
                        type="number"
                        required
                        value={stat.value !== undefined ? stat.value : ""}
                        onChange={(e) =>
                          handleStatChange(idx, "value", parseInt(e.target.value) || 0)
                        }
                        className="w-full bg-surface border border-border px-3 py-1.5 rounded-sm font-display text-lg text-accent"
                      />
                    </div>

                    <div>
                      <label className="type-meta text-[11px] text-muted-foreground block mb-1">
                        الرمز الإضافي / Suffix (e.g. +, K+, M+)
                      </label>
                      <input
                        placeholder="+"
                        value={stat.suffix || ""}
                        onChange={(e) => handleStatChange(idx, "suffix", e.target.value)}
                        className="w-full bg-surface border border-border px-3 py-1.5 rounded-sm text-sm"
                      />
                    </div>

                    <div>
                      <label className="type-meta text-[11px] text-muted-foreground block mb-1">
                        العنوان (EN)
                      </label>
                      <input
                        value={stat.label_en || ""}
                        onChange={(e) => handleStatChange(idx, "label_en", e.target.value)}
                        className="w-full bg-surface border border-border px-3 py-1.5 rounded-sm text-xs"
                      />
                    </div>

                    <div>
                      <label className="type-meta text-[11px] text-muted-foreground block mb-1">
                        العنوان (عربي)
                      </label>
                      <input
                        value={stat.label_ar || ""}
                        onChange={(e) => handleStatChange(idx, "label_ar", e.target.value)}
                        dir="rtl"
                        className="w-full bg-surface border border-border px-3 py-1.5 rounded-sm text-xs"
                      />
                    </div>

                    {/* Preview Badge */}
                    <div className="pt-2 border-t border-border/40 text-center">
                      <span className="font-display text-2xl text-foreground">
                        {stat.value}
                        <span className="text-accent">{stat.suffix}</span>
                      </span>
                      <p className="type-meta text-[10px] text-muted-foreground mt-0.5">
                        {stat.label_ar} / {stat.label_en}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Gear & Location */}
        {activeSubTab === "gear" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 border border-border bg-surface/60 rounded-sm animate-fade-in">
            <div className="md:col-span-2">
              <h3 className="type-meta text-accent">المعدات والمقر / Gear & Location</h3>
              <p className="type-meta text-xs text-muted-foreground mt-0.5">
                تحديد الكاميرات، العدسات، وموقع الإقامة
              </p>
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                Location (EN)
              </label>
              <input
                name="location_en"
                placeholder="e.g. Sana'a, Yemen / Based in Yemen"
                value={profileForm.location_en || ""}
                onChange={handleProfileChange}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                مقر العمل والإقامة (عربي)
              </label>
              <input
                name="location_ar"
                placeholder="مثال: صنعاء، اليمن / مقيم في اليمن"
                value={profileForm.location_ar || ""}
                onChange={handleProfileChange}
                dir="rtl"
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                Camera Gear / Equipment (EN)
              </label>
              <input
                name="gear_en"
                placeholder="e.g. Sony A7R V / GM Lenses / Drone 4K"
                value={profileForm.gear_en || ""}
                onChange={handleProfileChange}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                المعدات والكاميرات (عربي)
              </label>
              <input
                name="gear_ar"
                placeholder="مثال: Sony A7R V / عدسات GM / إضاءة سينمائية"
                value={profileForm.gear_ar || ""}
                onChange={handleProfileChange}
                dir="rtl"
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>
          </div>
        )}

        {/* TAB 4: Contact & Socials */}
        {activeSubTab === "social" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 border border-border bg-surface/60 rounded-sm animate-fade-in">
            <div className="md:col-span-3">
              <h3 className="type-meta text-accent">التواصل وحسابات التواصل / Contact & Social Media</h3>
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                البريد الإلكتروني / Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="hello@alabad.com"
                value={profileForm.email || ""}
                onChange={handleProfileChange}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                رابط واتساب / WhatsApp URL
              </label>
              <input
                name="whatsapp"
                placeholder="https://wa.me/967770000000"
                value={profileForm.whatsapp || ""}
                onChange={handleProfileChange}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                رابط إنستغرام / Instagram URL
              </label>
              <input
                name="instagram"
                placeholder="https://instagram.com/alabad"
                value={profileForm.instagram || ""}
                onChange={handleProfileChange}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                رابط بيهانس / Behance URL
              </label>
              <input
                name="behance"
                placeholder="https://behance.net/alabad"
                value={profileForm.behance || ""}
                onChange={handleProfileChange}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                منصة إكس / Twitter / X URL
              </label>
              <input
                name="twitter"
                placeholder="https://x.com/alabad"
                value={profileForm.twitter || ""}
                onChange={handleProfileChange}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1.5">
                قناة يوتيوب / YouTube URL
              </label>
              <input
                name="youtube"
                placeholder="https://youtube.com/@alabad"
                value={profileForm.youtube || ""}
                onChange={handleProfileChange}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex justify-end items-center gap-4 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={profileMutation.isPending || statsMutation.isPending}
            className="bg-accent text-background px-8 py-3 rounded-sm type-meta flex items-center gap-2 hover:bg-foreground transition-all duration-200 disabled:opacity-50 text-sm font-semibold shadow-lg shadow-accent/10"
          >
            <Save className="h-4 w-4" />
            {profileMutation.isPending || statsMutation.isPending
              ? "جاري الحفظ..."
              : "حفظ جميع الإعدادات والتغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
