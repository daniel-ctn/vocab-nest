const TOKEN_STORAGE_KEY = "vocab-nest.jwt";

const canUseStorage = () => typeof window !== "undefined";

export const authTokenStorage = {
  get() {
    if (!canUseStorage()) {
      return null;
    }

    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  set(token: string) {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },

  clear() {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};
