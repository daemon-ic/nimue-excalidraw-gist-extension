import { FiEdit3, FiPlus, FiSave, FiCopy, FiExternalLink } from "react-icons/fi";
import { useActiveProject } from "@/hooks/useActiveProject";
import { CreateGistMsg, CopyGistMsg, UpdateGistMsg } from "@/services/background";
import { useQueryClient } from "@tanstack/react-query";
import { GIST_KEYS } from "@/services/config";
import { useState } from "react";
import NameDrawingModal from "./NameDrawingModal";
import RenameDrawingModal from "./RenameDrawingModal";
import LoadingOverlay from "./LoadingOverlay";
import { Gist } from "@/types/gist";

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

export default function Sidebar() {
    const { activeProject } = useActiveProject();
    const queryClient = useQueryClient();
    const [showNewModal, setShowNewModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    const handleOpenNewDrawingModal = () => {
        setShowNewModal(true);
    };



    function updateDrawingList(gist: Gist) {
        queryClient.invalidateQueries({ queryKey: GIST_KEYS.LIST });
        queryClient.invalidateQueries({ queryKey: GIST_KEYS.DETAIL(gist.id) });
    }





    const handleCreateNewDrawing = async (name: string) => {
        setIsLoading(true);
        setLoadingMessage("Creating new drawing...");

        try {
            const newGist = await CreateGistMsg.send(name);
            updateDrawingList(newGist);
            alert("New drawing created successfully!");
        } catch (error) {
            console.error('Failed to create new drawing:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create new drawing.';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    const handleSaveDrawing = async () => {
        if (!activeProject) return;
        setIsLoading(true);
        setLoadingMessage("Saving drawing...");
        try {
            const updatedGist = await UpdateGistMsg.send(activeProject);
            updateDrawingList(updatedGist);
            alert("Drawing saved successfully!");
        } catch (error) {
            console.error('Failed to save drawing:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save drawing. Make sure you are on an Excalidraw page.';
            alert(errorMessage);
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

        try {
            const renamedGist = await CopyGistMsg.send(activeProject, newName);
            updateDrawingList(renamedGist);
            alert("Drawing copied successfully!");
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
            const copiedGist = await CopyGistMsg.send(activeProject, newName);
            updateDrawingList(copiedGist);
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
            <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
        </div>
    )
}