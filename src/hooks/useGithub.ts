import browser from "webextension-polyfill";
import { GITHUB_API_BASE, GITHUB_KEYS, STORAGE_KEYS } from "@/shared/config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type GithubValidation = {
    isValid: boolean;
    user: {
        login: string;
        name: string;
        email: string;
    } | null;  
}

// ===== GITHUB TOKEN API FUNCTIONS =====

export async function getGithubTokenFn() {
    const result = await browser.storage.local.get([STORAGE_KEYS.GITHUB_TOKEN]);
    return result.github_token || null;
}

export async function setGithubTokenFn(newToken: string): Promise<string> {
    await browser.storage.local.set({ [STORAGE_KEYS.GITHUB_TOKEN]: newToken });
    return newToken;
}

export async function validateGithubTokenFn(token: string): Promise<GithubValidation> {
    try {
        const response = await fetch(GITHUB_API_BASE + "/user", {
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
            user: null
        }
    } catch (error) {
        return {
            isValid: false,
            user: null
        }
    }
}

// ===== GITHUB TOKEN HOOKS =====

export function useGithubToken() {
    const {
        data: githubToken,
        isLoading: isGettingGithubToken,
    } = useQuery({
        queryKey: GITHUB_KEYS.TOKEN,
        queryFn: getGithubTokenFn,
    });

    return {
        githubToken,
        isGettingGithubToken,
    }
}

export function useSetGithubToken({onSuccess}: {onSuccess: () => void}) {
    const queryClient = useQueryClient();
    const { mutate: setGithubToken, isPending: isSettingGithubToken } = useMutation({
        mutationFn: setGithubTokenFn,
        onSuccess: (newToken) => {
            queryClient.setQueryData(GITHUB_KEYS.TOKEN, newToken);
            queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.VALIDATION });
            onSuccess();
        },
    });

    return {
        setGithubToken,
        isSettingGithubToken,
    }
}

export function useCurrentGithubValidation() {
    const { githubToken } = useGithubToken();
    const {
        data: currentValidation,
        isLoading: isLoadingCurrentValidation,
    } = useQuery({
        queryKey: GITHUB_KEYS.VALIDATION,
        queryFn: () => validateGithubTokenFn(githubToken),
        enabled: !!githubToken,
    });
    return {
        currentValidation: currentValidation || { isValid: false, user: null } as GithubValidation,
        isLoadingCurrentValidation,
    }
}

export function useValidateGithubToken() {
    const queryClient = useQueryClient();
    const {
        mutate: validateGithubToken,
        isPending: isValidatingToken,
        data: newValidationAttempt,
        error: validationError,
    } = useMutation({
        mutationFn: (token: string) => validateGithubTokenFn(token),
        onSuccess: (result) => {
            queryClient.setQueryData(GITHUB_KEYS.VALIDATION, result);
        },
    });
    return {
        validateGithubToken,
        isValidatingToken,
        newValidationAttempt: newValidationAttempt || { isValid: false, user: null } as GithubValidation,
        validationError,
    }
}
