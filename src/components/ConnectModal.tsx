import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import SetupGuide from "./SetupGuide";
import { useState } from "react";
import {
  useCurrentGithubValidation,
  useGithubToken,
  useSetGithubToken,
  useValidateGithubToken,
} from "@/hooks/useGithub";
import ConnectStatusDisplay from "./ConnectStatusDisplay";

export default function ConnectModal({ onClose }: { onClose: () => void }) {
  const { githubToken, isGettingGithubToken } = useGithubToken();
  const { setGithubToken, isSettingGithubToken } = useSetGithubToken({ onSuccess: onClose });
  const { currentValidation, isLoadingCurrentValidation } =
    useCurrentGithubValidation();
  const { validateGithubToken, isValidatingToken, newValidationAttempt } =
    useValidateGithubToken();

  const [inputValue, setInputValue] = useState<string>(githubToken || "");

  // Derived state
  const value = inputValue || githubToken || "";
  const isProcessing = isSettingGithubToken || isValidatingToken || isGettingGithubToken || isLoadingCurrentValidation;
  const isConnected = githubToken && currentValidation?.isValid;
  const hasValidationError = newValidationAttempt && !newValidationAttempt.isValid;
  const hasNewSuccess = newValidationAttempt?.isValid;

  function handleSaveGithubToken() {
    if (!value.trim()) return;
    if (value === githubToken) {
      onClose();
      return;
    }

    validateGithubToken(value, {
      onSuccess: (result) => {
        if (result.isValid) {
          setGithubToken(value);
        }
      },
      onError: (error) => {
        console.error("Token validation failed:", error);
      },
    });
  }


  return (
    <Modal title="" handleOnClose={onClose}>
      <div className="flex flex-col gap-6 w-full max-w-lg">
        {/* Header Section */}
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Connect to GitHub
          </h3>
          <p className="text-sm text-gray-600">Sync your drawings to a private repository</p>
        </div>

        {/* Current Token Status */}
        {githubToken && isConnected && (
          <ConnectStatusDisplay
            isLoadingCurrentValidation={isLoadingCurrentValidation}
            currentValidation={currentValidation}
            inputValue={inputValue}
          />
        )}

        {/* Token Input Section */}
        <div className="space-y-3">
          <label
            htmlFor="github-token"
            className="block text-sm font-medium text-gray-700"
          >
            GitHub Personal Access Token
          </label>

          <Input
            id="github-token"
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            disabled={isProcessing}
            className="font-mono"
          />

          {!isConnected && <SetupGuide />}
        </div>

        {/* Validation Results */}
        {hasValidationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              ❌ Invalid token - check it has 'repo' scope
            </p>
          </div>
        )}

        {hasNewSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ Welcome,{" "}
              <span className="font-mono font-medium">
                {newValidationAttempt.user?.login}
              </span>
              !
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {isConnected && (
            <Button onClick={() => setGithubToken("")} variant="primary">
              Disconnect
            </Button>
          )}

          {!isConnected && (
            <Button onClick={handleSaveGithubToken} variant="primary">
              Connect to GitHub
            </Button>
          )}

          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
