// Admin authentication - Username/Password based
// Allowed admin credentials
const ADMIN_USERNAME = "feliciamtang";
const ADMIN_PASSWORD = "admin";

let isAdmin = false;

export const checkAdmin = (): boolean => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("isAdmin") === "true";
  }
  return false;
};

export const setAdmin = (value: boolean): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("isAdmin", value.toString());
    isAdmin = value;
  }
};

// Login with username and password
export const loginWithCredentials = (username: string, password: string): boolean => {
  if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase() && password === ADMIN_PASSWORD) {
    setAdmin(true);
    return true;
  }
  return false;
};

// Legacy password-only login (for backwards compatibility)
export const login = (password: string): boolean => {
  if (password === ADMIN_PASSWORD) {
    setAdmin(true);
    return true;
  }
  return false;
};

export const logout = (): void => {
  isAdmin = false;
  if (typeof window !== "undefined") {
    localStorage.removeItem("isAdmin");
  }
};
