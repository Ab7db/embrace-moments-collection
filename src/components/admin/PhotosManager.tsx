import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { DbPhoto } from "@/lib/database.types";
import { Plus, Trash2, Edit, Check } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

export function PhotosManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<DbPhoto> | null>(null);

  const { data: photos, isLoading } = useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as DbPhoto[]) || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (photo: Partial<DbPhoto>) => {
      if (!photo.image_url) {
        throw new Error("يرجى اختيار صورة للعمل الفوتوغرافي");
      }
      if (photo.id && photos?.find((p) => p.id === photo.id)) {
        // Update
        const { error } = await supabase
          .from("photos")
          .update(photo as any)
          .eq("id", photo.id);
        if (error) throw error;
      } else {
        // Insert
        photo.id = `p_${Date.now()}`;
        const { error } = await supabase.from("photos").insert(photo as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      setEditing(null);
    },
    onError: (err: any) => {
      alert("خطأ في الحفظ: " + (err.message || "حدث خطأ غير متوقع"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("photos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photos"] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground type-meta">
        جاري تحميل الصور...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="type-meta text-accent">المعرض الفوتوغرافي / Gallery Photos ({photos?.length || 0})</h3>
          <p className="type-meta text-xs text-muted-foreground mt-0.5">
            إدارة الصور الفوتوغرافية وتفاصيلها ورفع صور أصلية بدقة عالية
          </p>
        </div>
        <button
          onClick={() =>
            setEditing({
              orientation: "landscape",
              year: new Date().getFullYear().toString(),
              country: "ye",
              category_en: "Street",
              category_ar: "حياة الشارع",
            })
          }
          className="bg-accent text-background px-4 py-2 rounded-sm type-meta flex items-center gap-2 hover:bg-foreground transition-colors text-xs font-semibold"
        >
          <Plus className="h-4 w-4" /> إضافة صورة جديدة
        </button>
      </div>

      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(editing);
          }}
          className="p-6 border border-border bg-surface/80 backdrop-blur-sm rounded-sm space-y-5"
        >
          <div className="border-b border-border pb-3">
            <h4 className="font-display text-lg text-foreground">
              {editing.id ? "تعديل بيانات الصورة" : "إضافة صورة جديدة"}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <ImageUpload
                label="ملف الصورة (من الجهاز أو عبر رابط)"
                folder="photos"
                value={editing.image_url || ""}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                aspectRatio={editing.orientation === "portrait" ? "portrait" : "video"}
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Title (EN)
              </label>
              <input
                placeholder="e.g. Whispers of Old Sana'a"
                required
                value={editing.title_en || ""}
                onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                عنوان الصورة (عربي)
              </label>
              <input
                placeholder="مثال: همسات صنعاء القديمة"
                required
                value={editing.title_ar || ""}
                onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })}
                dir="rtl"
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Country Code (رمز الدولة e.g. ye, ae, om)
              </label>
              <input
                placeholder="ye"
                required
                value={editing.country || ""}
                onChange={(e) => setEditing({ ...editing, country: e.target.value.toLowerCase() })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Year / سنة الالتقاط
              </label>
              <input
                placeholder="2024"
                required
                value={editing.year || ""}
                onChange={(e) => setEditing({ ...editing, year: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                City (EN)
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
                المدينة (عربي)
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
                Category (EN)
              </label>
              <input
                placeholder="e.g. Portrait, Street, Travel"
                required
                value={editing.category_en || ""}
                onChange={(e) => setEditing({ ...editing, category_en: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                التصنيف (عربي)
              </label>
              <input
                placeholder="مثال: بورتريه، حياة الشارع، سفر"
                required
                value={editing.category_ar || ""}
                onChange={(e) => setEditing({ ...editing, category_ar: e.target.value })}
                dir="rtl"
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Orientation / الاتجاه
              </label>
              <select
                value={editing.orientation || "landscape"}
                onChange={(e) =>
                  setEditing({ ...editing, orientation: e.target.value as any })
                }
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              >
                <option value="landscape">Landscape (أفقي)</option>
                <option value="portrait">Portrait (عمودي)</option>
              </select>
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
              {saveMutation.isPending ? "جاري الحفظ..." : "حفظ الصورة"}
            </button>
          </div>
        </form>
      )}

      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos?.map((photo) => {
          const imgSrc =
            photo.image_url.startsWith("http") ||
            photo.image_url.startsWith("/") ||
            photo.image_url.startsWith("data:")
              ? photo.image_url
              : `/${photo.image_url}`;

          return (
            <div
              key={photo.id}
              className="relative group border border-border rounded-sm overflow-hidden bg-surface flex flex-col justify-between"
            >
              <div
                className={`w-full ${
                  photo.orientation === "portrait" ? "aspect-[3/4]" : "aspect-video"
                } bg-background overflow-hidden`}
              >
                <img
                  src={imgSrc}
                  alt={photo.title_en}
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <div className="p-3 bg-surface/90">
                <p className="font-display text-sm truncate text-foreground">
                  {photo.title_en}
                </p>
                <p className="type-meta text-[11px] text-muted-foreground mt-0.5 truncate">
                  {photo.title_ar}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/50">
                  <span className="type-meta text-[10px] text-accent uppercase">
                    {photo.country} · {photo.year}
                  </span>
                  <span className="type-meta text-[10px] text-muted-foreground">
                    {photo.category_en}
                  </span>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setEditing(photo)}
                  className="p-1.5 bg-background/90 backdrop-blur-sm border border-border rounded-sm hover:text-accent text-foreground transition-colors"
                  title="تعديل"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("هل أنت متأكد من حذف هذه الصورة؟")) {
                      deleteMutation.mutate(photo.id);
                    }
                  }}
                  className="p-1.5 bg-background/90 backdrop-blur-sm border border-border rounded-sm hover:text-red-400 text-foreground transition-colors"
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
