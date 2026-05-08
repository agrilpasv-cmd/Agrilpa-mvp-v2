import { AuthStorage } from "./auth-storage"

export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'page_view' 
  | 'product_click' 
  | 'contact_whatsapp' 
  | 'contact_email' 
  | 'quote_request' 
  | 'create_product' 
  | 'update_product' 
  | 'delete_product'
  | 'panel_view'
  | 'search'
  | 'click'
  | 'navigation'

export async function trackActivity(
  type: ActivityType, 
  description?: string, 
  metadata?: any
) {
  try {
    const session = AuthStorage.getSession()
    const userId = session?.userId
    
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity_type: type,
        description,
        metadata,
        user_id: userId,
        path: window.location.pathname
      })
    })
  } catch (error) {
    console.error("Failed to track activity:", error)
  }
}
