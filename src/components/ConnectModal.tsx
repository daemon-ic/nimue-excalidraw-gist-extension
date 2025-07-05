import Modal from "./Modal"
import Button from "./Button"
import Input from "./Input"
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGithubTokenFn, setGithubTokenFn, validateGithubTokenFn } from "@/lib/github";
import { GITHUB_KEYS } from "@/lib/config";

export default function ConnectModal({ onClose }: { onClose: () => void }) {

    const [inputValue, setInputValue] = useState<string | undefined>(undefined);
    const queryClient = useQueryClient();
    
    const {
        data: githubToken,
        isLoading: isLoadingGithubToken,
    } = useQuery({
        queryKey: GITHUB_KEYS.TOKEN,
        queryFn: getGithubTokenFn,
    });

    // Query to validate the current token
    const {
        data: currentValidation,
        isLoading: isLoadingValidation,
    } = useQuery({
        queryKey: GITHUB_KEYS.VALIDATION,
        queryFn: () => validateGithubTokenFn(githubToken),
        enabled: !!githubToken, // Only run if we have a token
    });

    const {
        mutate: setGithubToken,
        isPending: isSettingToken,
    } = useMutation({
        mutationFn: setGithubTokenFn,
        onSuccess: (newToken) => {
            queryClient.setQueryData(GITHUB_KEYS.TOKEN, newToken);
            queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.VALIDATION });
            onClose();
        },
    });

    const {
        mutate: validateGithubToken,
        isPending: isValidatingToken,
        data: validateGithubTokenResult,
        error: validationError,
    } = useMutation({
        mutationFn: (token: string) => validateGithubTokenFn(token),
        onSuccess: (result, token) => {
            queryClient.setQueryData(GITHUB_KEYS.VALIDATION, result);
            queryClient.invalidateQueries({ queryKey: GITHUB_KEYS.VALIDATION });
        },
    });

    const value = inputValue !== undefined
        ? inputValue
        : githubToken || "";

    function handleSaveGithubToken() {
        if (!value.trim()) {
            return;
        }

        // If the input value is different from the current token, validate it first
        if (value !== githubToken) {
            validateGithubToken(value, {
                onSuccess: (result) => {
                    if (result.isValid) {
                        setGithubToken(value);
                    }
                },
                onError: (error) => {
                    console.error('Token validation failed:', error);
                }
            });
        } else {
            // If it's the same token, just close the modal
            onClose();
        }
    }

    const isProcessing = isSettingToken || isValidatingToken || isLoadingGithubToken || isLoadingValidation;
    
    // Show error from validation mutation or current validation
    const hasError = (validateGithubTokenResult && !validateGithubTokenResult.isValid) || 
                    (currentValidation && !currentValidation.isValid);
    
    const errorMessage = validateGithubTokenResult?.error || currentValidation?.error;

    return (
        <Modal title="Connect to Github" handleOnClose={onClose}>
            <div className="flex flex-col gap-4 w-full">
                <p>Connect to Github to get started</p>
                <div>
                    <Input
                        type="password"
                        value={value}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="GitHub Personal Access Token"
                        disabled={isProcessing}
                    />
                    <p className="text-xs text-gray-600 mt-1">
                        Create a token with 'gist' scope at{' '}
                        <a
                            href="https://github.com/settings/tokens"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            GitHub Settings
                        </a>
                    </p>
                </div>

                {/* Current Token Status */}
                {githubToken && !inputValue && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-700">
                            {isLoadingValidation ? "Validating current token..." : 
                             currentValidation?.isValid ? 
                             `✅ Current token is valid! Logged in as: ${currentValidation.user?.login}` :
                             "❌ Current token is invalid"
                            }
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {hasError && errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">
                            ❌ {errorMessage}
                        </p>
                    </div>
                )}

                {/* Success Message for new token validation */}
                {validateGithubTokenResult?.isValid && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-700">
                            ✅ Token is valid! Logged in as: 
                            <span className="font-bold">{validateGithubTokenResult.user?.login}</span>
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <Button
                        onClick={isProcessing || !value.trim() ? () => {} : handleSaveGithubToken}
                        className={isProcessing || !value.trim() ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        {isProcessing ? "Processing..." : 
                         githubToken && value === githubToken ? "Close" : "Connect"}
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    )
}