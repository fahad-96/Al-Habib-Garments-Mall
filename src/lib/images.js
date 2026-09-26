import imageCompression from "browser-image-compression";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/avif", "image/gif", "image/svg+xml"];

export const validateImageFile = (file) => {
  if (!file) return "No file selected.";
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Please choose a PNG, JPG, WEBP, AVIF, GIF or SVG image.";
  if (file.size > MAX_UPLOAD_BYTES) return "Image is larger than 8 MB.";
  return "";
};

// Shrinks photos before upload: max 1800px on the long edge, WebP, roughly under 600 KB.
export const compressImage = async (file) => {
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;
  try {
    const out = await imageCompression(file, {
      maxSizeMB: 0.6,
      maxWidthOrHeight: 1800,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.86,
    });
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([out], name, { type: "image/webp" });
  } catch {
    return file;
  }
};

export const uploadImage = async (supabase, file, folder = "products", nameHint = "image") => {
  const problem = validateImageFile(file);
  if (problem) throw new Error(problem);
  const prepared = await compressImage(file);
  const ext = (prepared.name.split(".").pop() || "webp").toLowerCase();
  const safe = String(nameHint || "image").toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60);
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${folder}/${safe}-${Date.now()}-${rand}.${ext}`;
  const { data, error } = await supabase.storage.from("product-images").upload(path, prepared, { upsert: false, contentType: prepared.type });
  if (error) {
    if (String(error.message || "").toLowerCase().includes("row-level security")) {
      throw new Error("Upload blocked by storage security. Run supabase/schema.sql and confirm you are an admin.");
    }
    throw new Error(`Image upload failed: ${error.message}`);
  }
  const { data: pub } = supabase.storage.from("product-images").getPublicUrl(data?.path || path);
  return pub.publicUrl;
};

// Best-effort removal of an image we uploaded (ignores external URLs).
export const deleteImageByUrl = async (supabase, url) => {
  const marker = "/storage/v1/object/public/product-images/";
  const idx = String(url || "").indexOf(marker);
  if (idx === -1) return false;
  const path = decodeURIComponent(url.slice(idx + marker.length));
  const { error } = await supabase.storage.from("product-images").remove([path]);
  return !error;
};
