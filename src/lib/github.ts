export interface TokenValidationResult {
  isValid: boolean;
  error?: string;
  user?: {
    login: string;
    name?: string;
    email?: string;
  };
}

export async function validateGitHubToken(token: string): Promise<TokenValidationResult> {
  if (!token) {
    return {
      isValid: false,
      error: 'No token provided'
    };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (response.status === 401) {
      return {
        isValid: false,
        error: 'Invalid token - please check your GitHub Personal Access Token'
      };
    }

    if (response.status === 403) {
      return {
        isValid: false,
        error: 'Token lacks required permissions - ensure it has gist scope'
      };
    }

    if (!response.ok) {
      return {
        isValid: false,
        error: `GitHub API error: ${response.status} ${response.statusText}`
      };
    }

    const user = await response.json();
    
    return {
      isValid: true,
      user: {
        login: user.login,
        name: user.name,
        email: user.email
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    };
  }
}
