export default function SetupGuide() {
    return (
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-3">
              Need a GitHub token?
            </p>
  
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                  1
                </div>
                <a
                  href="https://github.com/settings/tokens/new?scopes=gist&description=Nimue%20Extension"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-800 font-medium hover:text-blue-900 underline decoration-2 underline-offset-2"
                >
                  Create token on GitHub
                </a>
              </div>
  
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                  2
                </div>
                <span className="text-sm text-blue-800">
                  Select{" "}
                  <span className="px-1.5 py-0.5 bg-white rounded border text-xs font-mono">
                    gist
                  </span>{" "}
                  scope
                </span>
              </div>
  
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                  3
                </div>
                <span className="text-sm text-blue-800">
                  Generate & paste token above
                </span>
              </div>
            </div>
  
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-700">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Stored locally & securely</span>
            </div>
          </div>
        </div>
      </div>
    );
  }