export const AuthStorage = {
  setSession: (userId: string, email: string, role: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user_id", userId)
      localStorage.setItem("auth_user_email", email)
      localStorage.setItem("auth_user_role", role)
      localStorage.setItem("auth_logged_in", "true")
    }
  },

  getSession: () => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("auth_logged_in") === "true"
      if (!isLoggedIn) return null

      return {
        userId: localStorage.getItem("auth_user_id"),
        email: localStorage.getItem("auth_user_email"),
        role: localStorage.getItem("auth_user_role"),
      }
    }
    return null
  },

  clearSession: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user_id")
      localStorage.removeItem("auth_user_email")
      localStorage.removeItem("auth_user_role")
      localStorage.removeItem("auth_logged_in")
    }
  },

  isLoggedIn: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_logged_in") === "true"
    }
    return false
  },
}
