import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { DbCountry } from "@/lib/database.types";
import { Plus, Trash2, Edit, Globe, Check } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

export function CountriesManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<DbCountry> | null>(null);

  const { data: countries, isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("countries")
        .select("*")
        .order("name_en");
      return (data as DbCountry[]) || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (country: Partial<DbCountry>) => {
      if (!country.cover_url) {
        throw new Error("يرجى اختيار صورة للموقع أو الدولة");
      }

      const parseTags = (tags: any) => {
        if (Array.isArray(tags)) return tags;
        if (typeof tags === "string")
          return tags.split(",").map((t) => t.trim()).filter(Boolean);
        return [];
      };

      const payload = {
        ...country,
        tags_en: parseTags(country.tags_en),
        tags_ar: parseTags(country.tags_ar),
      };

      if (countries?.find((c) => c.id === country.id) && editing?.id) {
        const { error } = await supabase
          .from("countries")
          .update(payload as any)
          .eq("id", country.id!);
        if (error) throw error;
      } else {
        if (!payload.id) {
          payload.id = payload.name_en?.toLowerCase().substring(0, 2) || "loc";
        }
        const { error } = await supabase.from("countries").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      setEditing(null);
    },
    onError: (err: any) => {
      alert("خطأ في الحفظ: " + (err.message || "حدث خطأ غير متوقع"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("countries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["countries"] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground type-meta">
        جاري تحميل مواقع الكرة الأرضية...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="type-meta text-accent">
            مواقع التصوير والكرة الأرضية / Globe Locations ({countries?.length || 0})
          </h3>
          <p className="type-meta text-xs text-muted-foreground mt-0.5">
            إدارة الدول والمدن والإحداثيات الجغرافية المعروضة على الكرة الأرضية التفاعلية
          </p>
        </div>
        <button
          onClick={() =>
            setEditing({
              photo_count: 1,
              campaign_count: 1,
              lat: 15.3694,
              lon: 44.191,
              tags_en: ["Architecture", "Culture"],
              tags_ar: ["عمارة", "ثقافة"],
            })
          }
          className="bg-accent text-background px-4 py-2 rounded-sm type-meta flex items-center gap-2 hover:bg-foreground transition-colors text-xs font-semibold"
        >
          <Plus className="h-4 w-4" /> إضافة موقع جغرافي
        </button>
      </div>

      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(editing);
          }}
          className="p-6 border border-border bg-surface/80 backdrop-blur-sm rounded-sm space-y-6"
        >
          <div className="border-b border-border pb-3">
            <h4 className="font-display text-lg text-foreground">
              {editing.id ? "تعديل بيانات الموقع" : "إضافة موقع تصوير جديد"}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <ImageUpload
                label="صورة الموقع / Location Cover Image"
                folder="locations"
                value={editing.cover_url || ""}
                onChange={(url) => setEditing({ ...editing, cover_url: url })}
                aspectRatio="video"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Location ID / Code (e.g. ye, ae, om, sa)
              </label>
              <input
                placeholder="ye"
                required
                disabled={!!countries?.find((c) => c.id === editing.id)}
                value={editing.id || ""}
                onChange={(e) => setEditing({ ...editing, id: e.target.value.toLowerCase() })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm disabled:opacity-50"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Country Name (EN)
              </label>
              <input
                placeholder="e.g. Yemen"
                required
                value={editing.name_en || ""}
                onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                اسم الدولة (عربي)
              </label>
              <input
                placeholder="مثال: اليمن"
                required
                value={editing.name_ar || ""}
                onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })}
                dir="rtl"
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                City Name (EN)
              </label>
              <input
                placeholder="e.g. Sana'a"
                required
                value={editing.city_en || ""}
                onChange={(e) => setEditing({ ...editing, city_en: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                اسم المدينة (عربي)
              </label>
              <input
                placeholder="مثال: صنعاء"
                required
                value={editing.city_ar || ""}
                onChange={(e) => setEditing({ ...editing, city_ar: e.target.value })}
                dir="rtl"
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Latitude (خط العرض)
              </label>
              <input
                type="number"
                step="any"
                placeholder="15.3694"
                required
                value={editing.lat !== undefined ? editing.lat : ""}
                onChange={(e) =>
                  setEditing({ ...editing, lat: parseFloat(e.target.value) })
                }
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Longitude (خط الطول)
              </label>
              <input
                type="number"
                step="any"
                placeholder="44.1910"
                required
                value={editing.lon !== undefined ? editing.lon : ""}
                onChange={(e) =>
                  setEditing({ ...editing, lon: parseFloat(e.target.value) })
                }
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                عدد الصور (Photo Count)
              </label>
              <input
                type="number"
                placeholder="12"
                required
                value={editing.photo_count || 0}
                onChange={(e) =>
                  setEditing({ ...editing, photo_count: parseInt(e.target.value) || 0 })
                }
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                عدد الحملات (Campaign Count)
              </label>
              <input
                type="number"
                placeholder="3"
                required
                value={editing.campaign_count || 0}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    campaign_count: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Tags (EN, comma separated)
              </label>
              <input
                placeholder="Architecture, Culture, History"
                value={
                  Array.isArray(editing.tags_en)
                    ? editing.tags_en.join(", ")
                    : editing.tags_en || ""
                }
                onChange={(e) => setEditing({ ...editing, tags_en: e.target.value as any })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                الوسوم (عربي، مفصولة بفواصل)
              </label>
              <input
                placeholder="عمارة قديمة، ثقافة، تراث"
                value={
                  Array.isArray(editing.tags_ar)
                    ? editing.tags_ar.join(", ")
                    : editing.tags_ar || ""
                }
                onChange={(e) => setEditing({ ...editing, tags_ar: e.target.value as any })}
                dir="rtl"
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2 text-xs type-meta text-muted-foreground hover:text-foreground"
            >
              إلغاء / Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-accent text-background px-6 py-2 rounded-sm text-xs type-meta flex items-center gap-2 hover:bg-foreground transition-colors disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {saveMutation.isPending ? "جاري الحفظ..." : "حفظ الموقع"}
            </button>
          </div>
        </form>
      )}

      {/* Locations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {countries?.map((country) => {
          const coverSrc =
            country.cover_url.startsWith("http") ||
            country.cover_url.startsWith("/") ||
            country.cover_url.startsWith("data:")
              ? country.cover_url
              : `/${country.cover_url}`;

          return (
            <div
              key={country.id}
              className="relative group border border-border rounded-sm overflow-hidden bg-surface flex items-center gap-4 p-4"
            >
              <div className="w-20 h-20 rounded-sm overflow-hidden bg-background flex-shrink-0 border border-border">
                <img
                  src={coverSrc}
                  alt={country.name_en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                  <p className="font-display text-base truncate text-foreground">
                    {country.name_en}
                  </p>
                  <span className="type-meta text-[10px] text-accent font-mono uppercase bg-accent/10 px-1.5 py-0.5 rounded">
                    {country.id}
                  </span>
                </div>
                <p className="type-meta text-xs text-muted-foreground mt-0.5">
                  {country.name_ar} · {country.city_en}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] type-meta text-muted-foreground">
                  <span>{country.photo_count} صور</span>
                  <span>·</span>
                  <span>{country.campaign_count} حملات</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(country)}
                  className="p-1.5 bg-background border border-border rounded-sm hover:text-accent text-foreground transition-colors"
                  title="تعديل"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("هل أنت متأكد من حذف هذا الموقع؟")) {
                      deleteMutation.mutate(country.id);
                    }
                  }}
                  className="p-1.5 bg-background border border-border rounded-sm hover:text-red-400 text-foreground transition-colors"
                  title="حذف"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
