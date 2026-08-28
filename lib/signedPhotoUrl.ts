import { createClient } from '@/lib/supabase/client';

/**
 * order_photos.photo_url stores the object PATH inside the private
 * `order-photos` bucket (e.g. "{orgId}/{orderId}/full_package-169....jpg"),
 * not a public URL — the bucket has no public URLs, RLS on storage.objects
 * is the access boundary. Call this to resolve a short-lived signed URL for
 * display.
 */
export async function resolvePhotoUrls(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const supabase = createClient();
  const { data, error } = await supabase.storage.from('order-photos').createSignedUrls(paths, 60 * 60);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  for (const row of data) {
    if (row.signedUrl && row.path) map[row.path] = row.signedUrl;
  }
  return map;
}
