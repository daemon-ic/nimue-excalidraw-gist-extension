import { FiEdit3, FiPlus, FiSave, FiCopy, FiExternalLink } from "react-icons/fi";
import { useActiveProject } from "@/hooks/useActiveProject";
import { getExcalidrawDataFromPage } from "@/services/extension/extract";
import { GIST_FILENAME } from "@/shared/config";
import { useState } from "react";
import NameDrawingModal from "./NameDrawingModal";
import RenameDrawingModal from "./RenameDrawingModal";
import LoadingOverlay from "./LoadingOverlay";
import { useCreateGist, useUpdateGist } from "@/hooks/useGist";

function SidebarButton({
    label,
    onClick,
    Icon,
    disabled = false
}: {
    label: string,
    onClick: () => void,
    Icon: React.ElementType,
    disabled?: boolean
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center justify-center rounded-lg p-2 transition-all ${disabled
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-[--excali-light-purple] hover:text-[--excali-dark-purple]'
                }`}
        >
            <Icon className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-[--nimue-dark-gray]'
                }`} />
        </button>
    )
}

interface SidebarProps {
    onGistCreated?: () => void;
}

export default function Sidebar({ onGistCreated }: SidebarProps) {
    const { activeProject } = useActiveProject();
    const { createGist, isCreatingGist } = useCreateGist();
    const { updateGist, isUpdatingGist } = useUpdateGist();
    const [showNewModal, setShowNewModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const isCreating = isLoading || isCreatingGist;

    const handleOpenNewDrawingModal = () => {
        setShowNewModal(true);
    };

    const handleCreateNewDrawing = async (name: string) => {
        setIsLoading(true);
        setLoadingMessage("Creating new drawing...");

        try {
            createGist({
                description: name || "Created from Excalidraw",
                files: {
                    [GIST_FILENAME]: {
                        content: JSON.stringify({
                            type: "excalidraw",
                            version: 2,
                            source: "https://excalidraw.com",
                            elements: [],
                            appState: {},
                            files: {},
                        }, null, 2),
                    },
                },
                public: true,
            }, {
                onSuccess: (newGist) => {
                    console.log('Gist created successfully:', newGist);
                    setShowNewModal(false);
                    alert("New drawing created successfully!");
                    setIsLoading(false);
                    setLoadingMessage("");
                },
                onError: (error) => {
                    console.error('Failed to create gist:', error);
                    alert('Failed to create gist. Please try again.');
                    setIsLoading(false);
                    setLoadingMessage("");
                }
            });
        } catch (error) {
            console.error('Failed to get drawing data:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to get drawing data.';
            alert(errorMessage);
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    const handleSaveDrawing = async () => {
        if (!activeProject) return;
        setIsLoading(true);
        setLoadingMessage("Saving drawing...");
        try {
            const excalidrawData = await getExcalidrawDataFromPage();
            updateGist({
                gistId: activeProject.id,
                request: {
                    files: {
                        [GIST_FILENAME]: {
                            content: JSON.stringify(excalidrawData, null, 2),
                        },
                    },
                },
            }, {
                onSuccess: () => {
                    onGistCreated?.();
                    alert("Drawing saved successfully!");
                }
            });
        } catch (error) {
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    const handleRenameDrawing = () => {
        if (!activeProject) return;
        setShowRenameModal(true);
    };

    const handleRenameSubmit = async (newName: string) => {
        if (!activeProject) return;

        setIsLoading(true);
        setLoadingMessage("Renaming drawing...");

        if (newName === activeProject.description) {
            alert("Drawing name is already the same.");
            setIsLoading(false);
            setLoadingMessage("");
            return;
        }

        if (!newName) {
            alert("Drawing name cannot be empty.");
            setIsLoading(false);
            setLoadingMessage("");
            return;
        }

        try {
            const excalidrawData = await getExcalidrawDataFromPage();
            await updateGist({
                gistId: activeProject.id,
                request: {
                    description: newName,
                    files: {
                        [GIST_FILENAME]: {
                            content: JSON.stringify(excalidrawData, null, 2),
                        },
                    },
                },
            });
            onGistCreated?.();
            alert("Drawing renamed successfully!");
        } catch (error) {
            console.error('Failed to rename drawing:', error);
            alert('Failed to rename drawing.');
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    const handleCopyDrawing = () => {
        if (!activeProject) return;
        setShowCopyModal(true);
    };

    const handleCopySubmit = async (newName: string) => {
        if (!activeProject) return;

        setIsLoading(true);
        setLoadingMessage("Copying drawing...");

        try {
            const excalidrawData = await getExcalidrawDataFromPage();
            const copiedGist = await createGist({
                description: newName || "Created from Excalidraw",
                files: {
                    [GIST_FILENAME]: {
                        content: JSON.stringify(excalidrawData, null, 2),
                    },
                },
                public: true,
            });
            onGistCreated?.();
            alert("Drawing copied successfully!");
        } catch (error) {
            console.error('Failed to copy drawing:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to copy drawing.';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewOnGitHub = () => {
        if (!activeProject) return;
        window.open(activeProject.html_url, '_blank');
    };

    const buttons = [
        {
            label: "New",
            icon: FiPlus,
            onClick: handleOpenNewDrawingModal,
            disabled: false,
        },
        {
            label: "Save",
            icon: FiSave,
            onClick: handleSaveDrawing,
            disabled: !activeProject, // Only enabled when project is selected
        },
        {
            label: "Rename",
            icon: FiEdit3,
            onClick: handleRenameDrawing,
            disabled: !activeProject, // Only enabled when project is selected
        },
        {
            label: "Copy",
            icon: FiCopy,
            onClick: handleCopyDrawing,
            disabled: !activeProject, // Only enabled when project is selected
        },
        {
            label: "View on GitHub",
            icon: FiExternalLink,
            onClick: handleViewOnGitHub,
            disabled: !activeProject, // Only enabled when project is selected
        },
    ];

    return (
        <div className="flex flex-col gap-6 items-center py-4 px-2">
            <div className="bg-white rounded-lg shadow-md p-2 border border-gray-200 flex flex-col justify-start gap-2 items-center">
                {buttons.map((button) => (
                    <SidebarButton
                        key={button.label}
                        label={button.label}
                        onClick={button.onClick}
                        Icon={button.icon}
                        disabled={button.disabled}
                    />
                ))}
            </div>

            {/* Modals */}
            {showNewModal && (
                <NameDrawingModal
                    onClose={() => setShowNewModal(false)}
                    onSubmit={handleCreateNewDrawing}
                    title="Create New Drawing"
                    placeholder="Enter drawing name..."
                />
            )}

            {showRenameModal && activeProject && (
                <RenameDrawingModal
                    onClose={() => setShowRenameModal(false)}
                    onSubmit={handleRenameSubmit}
                    currentName={activeProject.description}
                />
            )}

            {showCopyModal && activeProject && (
                <NameDrawingModal
                    onClose={() => setShowCopyModal(false)}
                    onSubmit={handleCopySubmit}
                    title="Copy Drawing"
                    placeholder="Enter name for copied drawing..."
                    initialValue={`${activeProject.description} (Copy)`}
                />
            )}

            {/* Loading Overlay */}
            <LoadingOverlay isVisible={isCreating} message={loadingMessage || "Creating gist..."} />
        </div>
    )
}