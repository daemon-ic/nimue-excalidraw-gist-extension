import { GithubValidation } from "@/hooks/useGithub";

export default function ConnectStatusDisplay({
  isLoadingCurrentValidation,
  currentValidation,
  inputValue,
}: {
  isLoadingCurrentValidation: boolean;
  currentValidation: GithubValidation;
  inputValue: string;
}) {
  return (
    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          {isLoadingCurrentValidation &&
            !currentValidation?.isValid &&
            !inputValue && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}

          {isLoadingCurrentValidation &&
            currentValidation?.isValid &&
            !inputValue && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
        </div>

        <div>
          <p className="text-sm font-medium text-green-900">
            {isLoadingCurrentValidation
              ? "Validating token..."
              : currentValidation?.isValid
              ? "Connected successfully!"
              : "Token is invalid"}
          </p>
          {currentValidation?.isValid && (
            <p className="text-xs text-green-700">
              Logged in as:{" "}
              <span className="font-mono font-medium">
                {currentValidation.user?.login}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
