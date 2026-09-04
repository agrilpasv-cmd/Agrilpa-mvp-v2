/**
 * Safely downloads a file from a URL to the client's machine.
 * Converts the URL to a Blob first to bypass cross-origin browser restrictions on the 'download' attribute.
 */
export async function downloadAttachment(url: string, suggestedName?: string): Promise<boolean> {
  if (typeof window === 'undefined' || !url) return false

  // Determine a sensible filename
  let filename = suggestedName
  if (!filename) {
    try {
      const parsedUrl = new URL(url)
      const pathname = parsedUrl.pathname
      filename = pathname.split('/').pop()?.split('?')[0] || 'archivo-adjunto'
    } catch {
      filename = 'archivo-adjunto'
    }
  }

  // Ensure extension is preserved if obvious from URL
  if (!filename.includes('.')) {
    const cleanUrl = url.toLowerCase().split('?')[0]
    if (cleanUrl.endsWith('.pdf') || url.includes('.pdf')) filename += '.pdf'
    else if (cleanUrl.endsWith('.jpg') || url.includes('.jpg') || cleanUrl.endsWith('.jpeg')) filename += '.jpg'
    else if (cleanUrl.endsWith('.png') || url.includes('.png')) filename += '.png'
    else if (cleanUrl.endsWith('.webp') || url.includes('.webp')) filename += '.webp'
    else if (cleanUrl.endsWith('.xlsx') || url.includes('.xlsx')) filename += '.xlsx'
    else if (cleanUrl.endsWith('.docx') || url.includes('.docx')) filename += '.docx'
    else if (cleanUrl.endsWith('.zip') || url.includes('.zip')) filename += '.zip'
    else filename += '.bin'
  }

  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) throw new Error(`HTTP error ${response.status}`)
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    }, 300)

    return true
  } catch (err) {
    console.warn('[Download] Blob fetch failed, falling back to direct link:', err)
    // Fallback: direct window / anchor download
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.download = filename
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
    }, 300)
    return false
  }
}
