import Modal from "./Modal"
import Button from "./Button"
import { useGithubToken, useSetGithubToken, useTestToken } from "@/hooks/useGitHub";
import { useState } from "react";

export default function ConnectModal({ onClose }: { onClose: () => void }) {
    const { data: githubToken } = useGithubToken();
    const { mutate: setGithubToken, isPending: isSettingToken } = useSetGithubToken();
    const { mutate: testToken, data: testResult, isPending: isTesting } = useTestToken();
    
    // Only set by user input, but initialize from query value
    const [inputValue, setInputValue] = useState<string | undefined>(undefined);
    const value = inputValue !== undefined ? inputValue : githubToken || "";

    function handleSaveGithubToken() {
        if (!value.trim()) {
            return;
        }

        // First test the token
        testToken(value, {
            onSuccess: (result) => {
                if (result.isValid) {
                    // If valid, save it
                    setGithubToken(value, {
                        onSuccess: () => {
                            // get all gists
                            onClose();
                        }
                    });
                }
            }
        });
    }

    const isProcessing = isSettingToken || isTesting;
    const hasError = testResult && !testResult.isValid;

    return (
        <Modal title="Connect to Github" handleOnClose={onClose}>
            <div className="flex flex-col gap-4 w-full">
                <p>Connect to Github to get started</p>
                <div>
                    <input
                        type="password"
                        value={value}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2"
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

                {/* Error Message */}
                {hasError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">
                            ❌ {testResult.error}
                        </p>
                    </div>
                )}

                {/* Success Message */}
                {testResult?.isValid && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-700">
                            ✅ Token is valid! Logged in as: {testResult.user?.login}
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <Button 
                        onClick={handleSaveGithubToken}
                        className={isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        {isProcessing ? "Processing..." : "Connect"}
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    )
}