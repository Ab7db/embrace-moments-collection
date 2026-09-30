import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { DbCampaign } from "@/lib/database.types";
import { Plus, Trash2, Edit, Image as ImageIcon, Check } from "lucide-react";
import { ImageUpload, MultiImageUpload } from "./ImageUpload";

export function CampaignsManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<DbCampaign> | null>(null);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as DbCampaign[]) || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (campaign: Partial<DbCampaign>) => {
      if (!campaign.cover_url) {
        throw new Error("يرجى اختيار صورة الغلاف للحملة الإعلانية");
      }

      const parseUrls = (urls: any) => {
        if (Array.isArray(urls)) return urls;
        if (typeof urls === "string")
          return urls.split(",").map((t) => t.trim()).filter(Boolean);
        return [];
      };

      const payload = {
        ...campaign,
        gallery_urls: parseUrls(campaign.gallery_urls),
        bts_urls: parseUrls(campaign.bts_urls),
      };

      if (payload.id && campaigns?.find((c) => c.id === payload.id)) {
        const { error } = await supabase
          .from("campaigns")
          .update(payload as any)
          .eq("id", payload.id);
        if (error) throw error;
      } else {
        payload.id = `c_${Date.now()}`;
        const { error } = await supabase.from("campaigns").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setEditing(null);
    },
    onError: (err: any) => {
      alert("خطأ في الحفظ: " + (err.message || "حدث خطأ غير متوقع"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground type-meta">
        جاري تحميل الحملات...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="type-meta text-accent">
            الحملات الإعلانية والتجارية / Commercial Campaigns ({campaigns?.length || 0})
          </h3>
          <p className="type-meta text-xs text-muted-foreground mt-0.5">
            إدارة الحملات الإعلانية، معرض صور الحملة، وكواليس التصوير (BTS)
          </p>
        </div>
        <button
          onClick={() =>
            setEditing({
              no: `Campaign ${String((campaigns?.length || 0) + 1).padStart(2, "0")}`,
              year: new Date().getFullYear().toString(),
              gallery_urls: [],
              bts_urls: [],
              category_en: "Commercial",
              category_ar: "إعلانات تجارية",
            })
          }
          className="bg-accent text-background px-4 py-2 rounded-sm type-meta flex items-center gap-2 hover:bg-foreground transition-colors text-xs font-semibold"
        >
          <Plus className="h-4 w-4" /> إضافة حملة جديدة
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
              {editing.id ? "تعديل بيانات الحملة" : "إضافة حملة إعلانية جديدة"}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cover Image */}
            <div className="md:col-span-2">
              <ImageUpload
                label="صورة غلاف الحملة (Cover Image)"
                folder="campaigns"
                value={editing.cover_url || ""}
                onChange={(url) => setEditing({ ...editing, cover_url: url })}
                aspectRatio="video"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Campaign No / رقم الحملة
              </label>
              <input
                placeholder="e.g. Campaign 01"
                required
                value={editing.no || ""}
                onChange={(e) => setEditing({ ...editing, no: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Year / سنة الإنتاج
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
                Title (EN)
              </label>
              <input
                placeholder="e.g. Royal Gold Edition"
                required
                value={editing.title_en || ""}
                onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                عنوان الحملة (عربي)
              </label>
              <input
                placeholder="مثال: الإصدار الملكي الفاخر"
                required
                value={editing.title_ar || ""}
                onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })}
                dir="rtl"
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Client / العميل أو العلامة التجارية
              </label>
              <input
                placeholder="e.g. Luxury Brand / Brand X"
                required
                value={editing.client || ""}
                onChange={(e) => setEditing({ ...editing, client: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Category (EN)
              </label>
              <input
                placeholder="e.g. Commercial / Product"
                required
                value={editing.category_en || ""}
                onChange={(e) => setEditing({ ...editing, category_en: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Description (EN)
              </label>
              <textarea
                placeholder="Campaign narrative and creative vision in English..."
                value={editing.description_en || ""}
                onChange={(e) => setEditing({ ...editing, description_en: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm resize-none text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                وصف الحملة (عربي)
              </label>
              <textarea
                placeholder="الرؤية الإبداعية وقصة الحملة باللغة العربية..."
                value={editing.description_ar || ""}
                onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })}
                dir="rtl"
                className="w-full bg-background border border-border px-3 py-2 rounded-sm resize-none text-sm"
                rows={3}
              />
            </div>

            {/* Multi upload for gallery and BTS */}
            <div className="md:col-span-2 pt-2 border-t border-border/50">
              <MultiImageUpload
                label="معرض صور الحملة / Campaign Gallery Photos"
                folder="campaigns/gallery"
                values={
                  Array.isArray(editing.gallery_urls)
                    ? editing.gallery_urls
                    : []
                }
                onChange={(urls) => setEditing({ ...editing, gallery_urls: urls })}
              />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-border/50">
              <MultiImageUpload
                label="كواليس التصوير / Behind The Scenes (BTS)"
                folder="campaigns/bts"
                values={
                  Array.isArray(editing.bts_urls)
                    ? editing.bts_urls
                    : []
                }
                onChange={(urls) => setEditing({ ...editing, bts_urls: urls })}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border">
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
              {saveMutation.isPending ? "جاري الحفظ..." : "حفظ الحملة"}
            </button>
          </div>
        </form>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {campaigns?.map((campaign) => {
          const coverSrc =
            campaign.cover_url.startsWith("http") ||
            campaign.cover_url.startsWith("/") ||
            campaign.cover_url.startsWith("data:")
              ? campaign.cover_url
              : `/${campaign.cover_url}`;

          return (
            <div
              key={campaign.id}
              className="relative group border border-border rounded-sm overflow-hidden bg-surface flex flex-col justify-between"
            >
              <div className="w-full aspect-[16/10] bg-background overflow-hidden">
                <img
                  src={coverSrc}
                  alt={campaign.title_en}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="type-meta text-xs text-accent font-semibold uppercase">
                      {campaign.no}
                    </span>
                    <span className="type-meta text-xs text-muted-foreground">
                      {campaign.year}
                    </span>
                  </div>
                  <h4 className="font-display text-lg text-foreground mt-1 truncate">
                    {campaign.title_en}
                  </h4>
                  <p className="type-meta text-xs text-muted-foreground mt-0.5 truncate">
                    {campaign.title_ar} · {campaign.client}
                  </p>
                </div>
                <div className="type-meta text-[11px] text-muted-foreground mt-4 pt-2 border-t border-border flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3 text-accent" />
                    {campaign.gallery_urls?.length || 0} معرض
                  </span>
                  <span>·</span>
                  <span>{campaign.bts_urls?.length || 0} كواليس (BTS)</span>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setEditing(campaign)}
                  className="p-1.5 bg-background/90 backdrop-blur-sm border border-border rounded-sm hover:text-accent text-foreground transition-colors"
                  title="تعديل"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
                      deleteMutation.mutate(campaign.id);
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
