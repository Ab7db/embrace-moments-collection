import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { DbSocialPost, DbSiteProfile } from "@/lib/database.types";
import { Plus, Trash2, Edit, Instagram, ExternalLink, Check, MoveUp, MoveDown } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { formatImgUrl } from "@/lib/utils";

export function SocialManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<DbSocialPost> | null>(null);

  // Fetch social posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["social_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data as DbSocialPost[]) || [];
    },
  });

  // Fetch profile for instagram handle
  const { data: profile } = useQuery({
    queryKey: ["site_profile"],
    queryFn: async () => {
      const { data } = await supabase.from("site_profile").select("*").single();
      return (data as DbSiteProfile) || null;
    },
  });

  const [igUrl, setIgUrl] = useState("");
  useState(() => {
    if (profile?.instagram) setIgUrl(profile.instagram);
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await supabase
        .from("site_profile")
        .update({ instagram: url } as any)
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_profile"] });
      alert("تم تحديث رابط حساب إنستغرام بنجاح!");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (post: Partial<DbSocialPost>) => {
      if (!post.image_url) {
        throw new Error("يرجى اختيار صورة للريل أو المنشور");
      }

      if (post.id && posts?.find((p) => p.id === post.id)) {
        // Update
        const { error } = await supabase
          .from("social_posts")
          .update(post as any)
          .eq("id", post.id);
        if (error) throw error;
      } else {
        // Insert
        post.id = `sp_${Date.now()}`;
        if (post.display_order === undefined) {
          post.display_order = (posts?.length || 0) + 1;
        }
        const { error } = await supabase.from("social_posts").insert(post as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social_posts"] });
      setEditing(null);
    },
    onError: (err: any) => {
      alert("خطأ أثناء الحفظ: " + (err.message || "حدث خطأ"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social_posts"] }),
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from("social_posts")
        .update({ display_order: newOrder })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social_posts"] }),
  });

  const handleMove = (idx: number, direction: "up" | "down") => {
    if (!posts) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= posts.length) return;

    const currentPost = posts[idx];
    const targetPost = posts[targetIdx];
    if (!currentPost || !targetPost) return;

    const currentOrder = currentPost.display_order;
    const targetOrder = targetPost.display_order;

    reorderMutation.mutate({ id: currentPost.id, newOrder: targetOrder });
    reorderMutation.mutate({ id: targetPost.id, newOrder: currentOrder });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground type-meta">
        جاري تحميل منشورات إنستغرام...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Account Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border border-border bg-surface/60 rounded-sm">
        <div>
          <div className="flex items-center gap-2 text-accent">
            <Instagram className="h-5 w-5" />
            <h3 className="type-meta text-sm font-semibold">
              إدارة قسم «تابع الرحلة» / Instagram & Social Feed
            </h3>
          </div>
          <p className="type-meta text-xs text-muted-foreground mt-1">
            إدارة الصور والمقاطع العمودية (9:16) المعروضة في قسم إنستغرام بالصفحة الرئيسية
          </p>
        </div>

        <button
          onClick={() =>
            setEditing({
              display_order: (posts?.length || 0) + 1,
              post_url: profile?.instagram || "https://www.instagram.com/3_exh_",
              caption_en: "Visual Story",
              caption_ar: "قصة بصرية سينمائية",
            })
          }
          className="bg-accent text-background px-4 py-2 rounded-sm type-meta flex items-center gap-2 hover:bg-foreground transition-colors text-xs font-semibold self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> إضافة منشور / صورة جديدة
        </button>
      </div>

      {/* Instagram Account Link Quick Edit */}
      <div className="p-4 border border-border bg-background/50 rounded-sm flex flex-col sm:flex-row items-center gap-3">
        <label className="type-meta text-xs text-muted-foreground whitespace-nowrap">
          رابط حساب إنستغرام الرئيسي:
        </label>
        <input
          type="text"
          value={igUrl || profile?.instagram || ""}
          onChange={(e) => setIgUrl(e.target.value)}
          placeholder="https://www.instagram.com/your_handle"
          className="flex-1 bg-surface border border-border px-3 py-1.5 text-xs rounded-sm focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => saveProfileMutation.mutate(igUrl)}
          disabled={saveProfileMutation.isPending}
          className="bg-surface hover:bg-surface-2 border border-border text-foreground px-4 py-1.5 rounded-sm text-xs type-meta transition-colors whitespace-nowrap"
        >
          {saveProfileMutation.isPending ? "جاري الحفظ..." : "تحديث الرابط"}
        </button>
      </div>

      {/* Form modal/editor */}
      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(editing);
          }}
          className="p-6 border border-border bg-surface/90 backdrop-blur-sm rounded-sm space-y-5 animate-fade-in"
        >
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <h4 className="font-display text-lg text-foreground">
              {editing.id ? "تعديل منشور إنستغرام" : "إضافة صورة / ريل جديد لقسم تابع الرحلة"}
            </h4>
            <span className="type-meta text-xs text-accent">نسبة العرض 9:16 (عمودي)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 max-w-sm mx-auto w-full">
              <ImageUpload
                label="صورة المنشور / الريل (9:16 Vertical)"
                folder="social"
                value={editing.image_url || ""}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
                aspectRatio="portrait"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                Caption (EN)
              </label>
              <input
                placeholder="e.g. Portrait Series in Old Sana'a"
                value={editing.caption_en || ""}
                onChange={(e) => setEditing({ ...editing, caption_en: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                الوصف / العنوان (عربي)
              </label>
              <input
                placeholder="مثال: لقطات من شوارع صنعاء القديمة"
                value={editing.caption_ar || ""}
                onChange={(e) => setEditing({ ...editing, caption_ar: e.target.value })}
                dir="rtl"
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                رابط المنشور على إنستغرام (Post URL)
              </label>
              <input
                placeholder="https://www.instagram.com/p/..."
                value={editing.post_url || ""}
                onChange={(e) => setEditing({ ...editing, post_url: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 rounded-sm text-sm"
              />
            </div>

            <div>
              <label className="type-meta text-muted-foreground text-xs block mb-1">
                الترتيب في العرض (Display Order)
              </label>
              <input
                type="number"
                value={editing.display_order || 1}
                onChange={(e) =>
                  setEditing({ ...editing, display_order: parseInt(e.target.value) || 1 })
                }
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
              {saveMutation.isPending ? "جاري الحفظ..." : "حفظ المنشور"}
            </button>
          </div>
        </form>
      )}

      {/* Posts List / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {posts?.map((post, idx) => {
          const imgSrc = formatImgUrl(post.image_url);

          return (
            <div
              key={post.id}
              className="relative group border border-border rounded-sm overflow-hidden bg-surface flex flex-col justify-between"
            >
              <div className="w-full aspect-[9/16] bg-background overflow-hidden relative">
                <img
                  src={imgSrc}
                  alt={post.caption_en || ""}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />
                
                {/* Order Badge */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm border border-border/80 px-2 py-0.5 rounded text-[10px] type-meta text-accent">
                  #{post.display_order}
                </div>

                {/* Caption overlay */}
                <div className="absolute bottom-0 inset-x-0 p-3 text-center">
                  <p className="font-display text-xs text-foreground truncate">
                    {post.caption_ar || post.caption_en || "منشور إنستغرام"}
                  </p>
                  <p className="type-meta text-[10px] text-muted-foreground truncate mt-0.5">
                    {post.caption_en}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-2 bg-surface flex items-center justify-between border-t border-border">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="تحريك لليمين/الأعلى"
                  >
                    <MoveUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, "down")}
                    disabled={idx === (posts.length - 1)}
                    className="p-1 rounded hover:bg-surface-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="تحريك لليسار/الأسفل"
                  >
                    <MoveDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {post.post_url && (
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded hover:bg-surface-2 text-muted-foreground hover:text-accent"
                      title="فتح الرابط"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(post)}
                    className="p-1 rounded hover:bg-surface-2 text-muted-foreground hover:text-accent"
                    title="تعديل"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من حذف هذا المنشور؟")) {
                        deleteMutation.mutate(post.id);
                      }
                    }}
                    className="p-1 rounded hover:bg-surface-2 text-muted-foreground hover:text-red-400"
                    title="حذف"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
