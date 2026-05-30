import { GITHUB_API, REPO_NAME } from '@/lib/constants';
import { getToken } from '@/lib/storage';
import type { DrawingMeta, ExcalidrawScene, GitHubUser } from '@/types';

export { emptyScene } from '@/lib/excalidraw';

type GhContent = {
  name: string;
  path: string;
  sha: string;
  size: number;
  html_url: string;
  content?: string;
  type: string;
};

export class GithubApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: string
  ) {
    super(message);
    this.name = 'GithubApiError';
  }
}

export function manualRepoCreateUrl(login: string): string {
  const params = new URLSearchParams({
    name: REPO_NAME,
    description: 'Excalidraw drawings (Nimue)',
  });
  return `https://github.com/new?${params}&private=true`;
}

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function authHeader(token: string): string {
  return token.startsWith('ghp_') || token.startsWith('github_pat_')
    ? `Bearer ${token}`
    : `token ${token}`;
}

async function githubFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  if (!token) throw new GithubApiError('GitHub token not set', 401);

  return fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(token),
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
}

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await githubFetch(path, init);

  if (!res.ok) {
    const body = await res.text();
    throw new GithubApiError(formatGithubError(res.status, body), res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function formatGithubError(status: number, body: string): string {
  try {
    const json = JSON.parse(body) as { message?: string };
    if (json.message) return `GitHub ${status}: ${json.message}`;
  } catch {
    /* use raw */
  }
  return `GitHub ${status}`;
}

export async function validateToken(token: string): Promise<GitHubUser | null> {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: authHeader(token),
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return { login: user.login, name: user.name };
}

export async function getAuthLogin(): Promise<string> {
  const user = await gh<{ login: string }>('/user');
  return user.login;
}

async function repoExists(owner: string): Promise<boolean> {
  const res = await githubFetch(`/repos/${owner}/${REPO_NAME}`);
  if (res.status === 200) return true;
  if (res.status === 404) return false;
  const body = await res.text();
  throw new GithubApiError(formatGithubError(res.status, body), res.status, body);
}

async function createRepoViaApi(): Promise<void> {
  const payloads = [
    { name: REPO_NAME, private: true, auto_init: true },
    { name: REPO_NAME, private: true, auto_init: false },
  ];

  let lastError: GithubApiError | null = null;

  for (const body of payloads) {
    const res = await githubFetch('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        description: 'Excalidraw drawings (Nimue)',
      }),
    });

    if (res.ok) return;

    const text = await res.text();
    lastError = new GithubApiError(formatGithubError(res.status, text), res.status, text);

    // Name already exists — repo is there
    if (res.status === 422 && text.includes('already exists')) return;
  }

  throw lastError ?? new GithubApiError('Could not create repository', 500);
}

export async function ensureRepo(_owner: string): Promise<void> {
  const login = await getAuthLogin();

  if (await repoExists(login)) return;

  try {
    await createRepoViaApi();
    // GitHub can be briefly inconsistent after create
    if (!(await repoExists(login))) {
      await new Promise((r) => setTimeout(r, 500));
    }
    if (await repoExists(login)) return;
  } catch (e) {
    const err = e instanceof GithubApiError ? e : null;
    const cannotAutoCreate =
      err && (err.status === 404 || err.status === 403 || err.status === 401);

    if (cannotAutoCreate) {
      throw new GithubApiError(
        `Could not create "${REPO_NAME}" automatically. ` +
          `Create a private repo with that exact name, then try again:\n` +
          manualRepoCreateUrl(login) +
          `\n\nUse a classic Personal Access Token with the "repo" scope ` +
          `(fine-grained tokens often cannot create repositories).`,
        err.status,
        err.body
      );
    }
    throw e;
  }

  if (!(await repoExists(login))) {
    throw new GithubApiError(
      `Repository "${REPO_NAME}" was not found. Create it here:\n${manualRepoCreateUrl(login)}`,
      404
    );
  }
}

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base || 'untitled'}.excalidraw`;
}

function displayName(filename: string): string {
  return filename.replace(/\.excalidraw$/, '').replace(/-/g, ' ');
}

async function lastCommitDate(owner: string, path: string): Promise<string | undefined> {
  try {
    const commits = await gh<Array<{ commit: { committer: { date: string } } }>>(
      `/repos/${owner}/${REPO_NAME}/commits?path=${encodeURIComponent(path)}&per_page=1`
    );
    return commits[0]?.commit?.committer?.date;
  } catch {
    return undefined;
  }
}

function toMeta(file: GhContent, lastUpdated?: string): DrawingMeta {
  return {
    filename: file.name,
    name: displayName(file.name),
    sha: file.sha,
    htmlUrl: file.html_url,
    lastUpdated,
  };
}

export async function listDrawings(owner: string): Promise<DrawingMeta[]> {
  await ensureRepo(owner);
  const login = await getAuthLogin();

  let contents: GhContent[];
  try {
    contents = await gh<GhContent[]>(`/repos/${login}/${REPO_NAME}/contents`);
  } catch (e) {
    if (e instanceof GithubApiError && e.status === 404) return [];
    throw e;
  }

  if (!Array.isArray(contents)) return [];

  const files = contents.filter((f) => f.type === 'file' && f.name.endsWith('.excalidraw'));
  const drawings = await Promise.all(
    files.map(async (f) => toMeta(f, await lastCommitDate(login, f.path)))
  );

  return drawings.sort((a, b) => {
    const ta = a.lastUpdated ? Date.parse(a.lastUpdated) : 0;
    const tb = b.lastUpdated ? Date.parse(b.lastUpdated) : 0;
    return tb - ta;
  });
}

export async function readDrawing(owner: string, filename: string): Promise<ExcalidrawScene> {
  const login = await getAuthLogin();
  const file = await gh<GhContent>(`/repos/${login}/${REPO_NAME}/contents/${filename}`);
  if (!file.content) throw new Error('Empty file');
  return JSON.parse(atob(file.content)) as ExcalidrawScene;
}

async function uniqueFilename(owner: string, filename: string): Promise<string> {
  const login = await getAuthLogin();
  try {
    await gh(`/repos/${login}/${REPO_NAME}/contents/${filename}`);
    const base = filename.replace(/\.excalidraw$/, '');
    for (let i = 1; i < 100; i++) {
      const candidate = `${base}-${i}.excalidraw`;
      try {
        await gh(`/repos/${login}/${REPO_NAME}/contents/${candidate}`);
      } catch {
        return candidate;
      }
    }
  } catch {
    /* available */
  }
  return filename;
}

export async function createDrawing(
  owner: string,
  name: string,
  scene: ExcalidrawScene
): Promise<DrawingMeta> {
  await ensureRepo(owner);
  const login = await getAuthLogin();
  const filename = await uniqueFilename(owner, slugify(name));
  const content = JSON.stringify(scene, null, 2);
  const result = await gh<{ content: GhContent }>(
    `/repos/${login}/${REPO_NAME}/contents/${filename}`,
    {
      method: 'PUT',
      body: JSON.stringify({ message: `Create ${filename}`, content: toBase64(content) }),
    }
  );
  return toMeta(result.content);
}

async function fileSha(owner: string, filename: string): Promise<string> {
  const login = await getAuthLogin();
  const file = await gh<GhContent>(`/repos/${login}/${REPO_NAME}/contents/${filename}`);
  return file.sha;
}

async function putDrawing(
  owner: string,
  filename: string,
  scene: ExcalidrawScene,
  sha: string
): Promise<GhContent> {
  const login = await getAuthLogin();
  const content = JSON.stringify(scene, null, 2);
  const result = await gh<{ content: GhContent }>(
    `/repos/${login}/${REPO_NAME}/contents/${filename}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        message: `Update ${filename}`,
        content: toBase64(content),
        sha,
      }),
    }
  );
  return result.content;
}

export async function updateDrawing(
  owner: string,
  drawing: DrawingMeta,
  scene: ExcalidrawScene
): Promise<DrawingMeta> {
  try {
    const content = await putDrawing(owner, drawing.filename, scene, drawing.sha);
    return toMeta(content, drawing.lastUpdated);
  } catch (e) {
    if (!(e instanceof GithubApiError && e.status === 409)) throw e;

    const freshSha = await fileSha(owner, drawing.filename);
    const content = await putDrawing(owner, drawing.filename, scene, freshSha);
    return toMeta(content, drawing.lastUpdated);
  }
}

export async function renameDrawing(
  owner: string,
  drawing: DrawingMeta,
  newName: string,
  scene: ExcalidrawScene
): Promise<DrawingMeta> {
  const created = await createDrawing(owner, newName, scene);
  const login = await getAuthLogin();
  await gh(`/repos/${login}/${REPO_NAME}/contents/${drawing.filename}`, {
    method: 'DELETE',
    body: JSON.stringify({ message: `Rename ${drawing.filename}`, sha: drawing.sha }),
  });
  return created;
}
