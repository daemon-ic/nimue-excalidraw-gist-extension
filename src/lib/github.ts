import browser from "webextension-polyfill";
import { STORAGE_KEYS } from "./config";


export async function getGithubTokenFn() {
  const result = await browser.storage.local.get([STORAGE_KEYS.GITHUB_TOKEN]);
  return result.github_token || null;
}

export async function setGithubTokenFn(newToken: string): Promise<string> {
  await browser.storage.local.set({ [STORAGE_KEYS.GITHUB_TOKEN]: newToken });
  return newToken;
}

export async function validateGithubTokenFn(token: string) {
  try {
      const response = await fetch('https://api.github.com/user', {
          headers: {
              'Authorization': `token ${token}`,
          },
      });
      if (response.ok) {
          const user = await response.json();
          return {
              isValid: true,
              user: {
                  login: user.login,
                  name: user.name,
                  email: user.email
              }
          }
      }
      return {
          isValid: false,
          error: 'Invalid token'
      }
  } catch (error) {
      return {
          isValid: false,
          error: error instanceof Error ? error.message : 'Network error occurred'
      }
  }
}