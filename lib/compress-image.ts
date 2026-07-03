/**
 * compressImage
 *
 * Compresses and resizes an image File in the browser using the Canvas API.
 * Returns a base64 data URL (JPEG) ready to be stored in the database.
 *
 * Strategy:
 *  - Resizes to a max of 1200×1200 px (preserves aspect ratio)
 *  - Encodes as JPEG with 82% quality — visually lossless at this size
 *  - Falls back to the original base64 if Canvas is unavailable (SSR / Node)
 *
 * Typical savings:
 *  - 4 MB phone photo → ~150–250 KB (15–20× smaller)
 *  - Already small images (< 200 KB) are left almost unchanged
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number   // 0.0 – 1.0
  } = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string
      if (!dataUrl) return reject(new Error("FileReader produced no result"))

      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width  = Math.round(width  * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement("canvas")
        canvas.width  = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          // Canvas not available — return original
          return resolve(dataUrl)
        }

        // White background (avoids transparent PNGs becoming black on JPEG)
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        const compressed = canvas.toDataURL("image/jpeg", quality)
        resolve(compressed)
      }

      img.onerror = () => reject(new Error("Failed to load image for compression"))
      img.src = dataUrl
    }

    reader.onerror = () => reject(new Error("FileReader failed"))
    reader.readAsDataURL(file)
  })
}

/**
 * MAX_FILE_SIZE_MB — hard limit before even attempting to compress.
 * Files larger than this are rejected with a user-friendly error.
 */
export const MAX_FILE_SIZE_MB = 10
