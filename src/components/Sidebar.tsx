import { FiEdit3, FiPlus, FiSave, FiCopy, FiExternalLink } from "react-icons/fi";
import { useActiveProject } from "@/hooks/useActiveProject";
import { getExcalidrawDataFromPage } from "@/services/extension/extract";
import { useState } from "react";
import NameDrawingModal from "./NameDrawingModal";
import RenameDrawingModal from "./RenameDrawingModal";
import LoadingOverlay from "./LoadingOverlay";
import { useCreateDrawing, useUpdateDrawing, useRenameDrawing } from "@/hooks/useRepository";
import { useCurrentGithubValidation } from "@/hooks/useGithub";

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
    onDrawingUpdated?: () => void;
}

export default function Sidebar({ onDrawingUpdated }: SidebarProps) {
    const { activeProject } = useActiveProject();
    const { currentValidation } = useCurrentGithubValidation();
    const owner = currentValidation?.user?.login;

    const { mutate: createDrawing, isPending: isCreatingDrawing } = useCreateDrawing();
    const { mutate: updateDrawing, isPending: isUpdatingDrawing } = useUpdateDrawing();
    const { mutate: renameDrawing, isPending: isRenamingDrawing } = useRenameDrawing();

    const [showNewModal, setShowNewModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const isCreating = isLoading || isCreatingDrawing;

    const handleOpenNewDrawingModal = () => {
        setShowNewModal(true);
    };

    const handleCreateNewDrawing = async (name: string) => {
        if (!owner) {
            alert('Not connected to GitHub');
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Creating new drawing...");

        try {
            const emptyDrawing = {
                type: "excalidraw",
                version: 2,
                source: "https://excalidraw.com",
                elements: [],
                appState: {},
                files: {},
            };

            createDrawing({
                owner,
                name: name || "Untitled Drawing",
                content: JSON.stringify(emptyDrawing, null, 2),
            }, {
                onSuccess: (newDrawing) => {
                    console.log('Drawing created:', newDrawing);
                    setShowNewModal(false);
                    alert(`Drawing created as ${newDrawing.filename}`);
                    onDrawingUpdated?.();
                },
                onError: (error) => {
                    console.error('Failed to create drawing:', error);
                    alert('Failed to create drawing. Please try again.');
                },
                onSettled: () => {
                    setIsLoading(false);
                    setLoadingMessage("");
                }
            });
        } catch (error) {
            console.error('Failed to create drawing:', error);
            alert(error instanceof Error ? error.message : 'Failed to create drawing.');
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    const handleSaveDrawing = async () => {
        if (!activeProject || !owner) return;

        setIsLoading(true);
        setLoadingMessage("Saving drawing...");

        try {
            const excalidrawData = await getExcalidrawDataFromPage();

            updateDrawing({
                owner,
                filename: activeProject.filename,
                content: JSON.stringify(excalidrawData, null, 2),
                sha: activeProject.sha,
            }, {
                onSuccess: () => {
                    onDrawingUpdated?.();
                    alert("Drawing saved successfully!");
                },
                onError: (error) => {
                    console.error('Failed to save drawing:', error);
                    alert('Failed to save drawing. Please try again.');
                },
                onSettled: () => {
                    setIsLoading(false);
                    setLoadingMessage("");
                }
            });
        } catch (error) {
            console.error('Failed to get drawing data:', error);
            alert('Failed to get drawing data from page.');
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    const handleRenameDrawing = () => {
        if (!activeProject) return;
        setShowRenameModal(true);
    };

    const handleRenameSubmit = async (newName: string) => {
        if (!activeProject || !owner) return;

        setIsLoading(true);
        setLoadingMessage("Renaming drawing...");

        if (newName === activeProject.name) {
            alert("Drawing name is already the same.");
            setIsLoading(false);
            setLoadingMessage("");
            setShowRenameModal(false);
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

            renameDrawing({
                owner,
                oldFilename: activeProject.filename,
                newName,
                content: JSON.stringify(excalidrawData, null, 2),
                sha: activeProject.sha,
            }, {
                onSuccess: (renamedDrawing) => {
                    setShowRenameModal(false);
                    onDrawingUpdated?.();
                    alert(`Drawing renamed to ${renamedDrawing.filename}`);
                },
                onError: (error) => {
                    console.error('Failed to rename drawing:', error);
                    alert('Failed to rename drawing.');
                },
                onSettled: () => {
                    setIsLoading(false);
                    setLoadingMessage("");
                }
            });
        } catch (error) {
            console.error('Failed to rename drawing:', error);
            alert('Failed to rename drawing.');
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    const handleCopyDrawing = () => {
        if (!activeProject) return;
        setShowCopyModal(true);
    };

    const handleCopySubmit = async (newName: string) => {
        if (!activeProject || !owner) return;

        setIsLoading(true);
        setLoadingMessage("Copying drawing...");

        try {
            const excalidrawData = await getExcalidrawDataFromPage();

            createDrawing({
                owner,
                name: newName || `${activeProject.name} (Copy)`,
                content: JSON.stringify(excalidrawData, null, 2),
            }, {
                onSuccess: (copiedDrawing) => {
                    setShowCopyModal(false);
                    onDrawingUpdated?.();
                    alert(`Drawing copied as ${copiedDrawing.filename}`);
                },
                onError: (error) => {
                    console.error('Failed to copy drawing:', error);
                    alert('Failed to copy drawing.');
                },
                onSettled: () => {
                    setIsLoading(false);
                    setLoadingMessage("");
                }
            });
        } catch (error) {
            console.error('Failed to copy drawing:', error);
            alert('Failed to copy drawing.');
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    const handleViewOnGitHub = () => {
        if (!activeProject) return;
        window.open(activeProject.htmlUrl, '_blank');
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
                    currentName={activeProject.name}
                />
            )}

            {showCopyModal && activeProject && (
                <NameDrawingModal
                    onClose={() => setShowCopyModal(false)}
                    onSubmit={handleCopySubmit}
                    title="Copy Drawing"
                    placeholder="Enter name for copied drawing..."
                    initialValue={`${activeProject.name} (Copy)`}
                />
            )}

            {/* Loading Overlay */}
            <LoadingOverlay isVisible={isCreating} message={loadingMessage || "Creating drawing..."} />
        </div>
    )
}