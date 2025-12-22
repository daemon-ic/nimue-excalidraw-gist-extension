import { ExcalidrawDrawingMetadata } from "@/types/repository";
import { useActiveProject } from "@/hooks/useActiveProject";
import { useDrawings } from "@/hooks/useRepository";
import { useCurrentGithubValidation } from "@/hooks/useGithub";
import { LoadDrawingBgScript } from "@/services/background/background-web-scripts";
import { useState } from "react";

function formatLastUpdated(dateString: string | undefined): string {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // If less than 1 hour ago, show minutes
    if (diffMins < 60) {
        return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    }

    // If less than 24 hours ago, show hours
    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    // If less than 7 days ago, show days
    if (diffDays < 7) {
        return `${diffDays}d ago`;
    }

    // Otherwise show the date
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

function Drawing({ drawing, isSelected, onSelect, isLoading }: {
    drawing: ExcalidrawDrawingMetadata,
    isSelected: boolean,
    onSelect: (drawing: ExcalidrawDrawingMetadata) => void,
    isLoading?: boolean
}) {
    return (
        <div
            className={`bg-white rounded-lg shadow-sm p-3 border transition-all cursor-pointer ${isSelected
                    ? 'border-[--excali-purple] shadow-md bg-[--excali-light-purple]'
                    : 'border-gray-200 hover:shadow-md hover:border-gray-300'
                } ${isLoading ? 'opacity-50' : ''}`}
            onClick={() => !isLoading && onSelect(drawing)}
        >
            <h2 className={`text-sm font-semibold mb-2 truncate ${isSelected ? 'text-[--excali-purple]' : 'text-gray-700'
                }`}>
                {drawing.name}
            </h2>
            <div className="flex flex-col justify-between items-center text-[10px] text-gray-500 mb-2">
                <span className="text-[10px] w-full text-left">Last Updated</span>
                <span className="text-[10px] w-full text-left font-mono">{formatLastUpdated(drawing.lastUpdated)}</span>
            </div>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[--excali-purple]"></div>
                </div>
            )}
        </div>
    )
}

export default function Gallery() {
    const { currentValidation } = useCurrentGithubValidation();
    const owner = currentValidation?.user?.login;

    const { data: drawings, isLoading } = useDrawings(owner);
    const { activeProject, setActiveProject } = useActiveProject();
    const [loadingFilename, setLoadingFilename] = useState<string | null>(null);

    async function handleSelectDrawing(drawing: ExcalidrawDrawingMetadata) {
        if (!owner) {
            alert('Not connected to GitHub');
            return;
        }

        // If clicking the same project, deselect it
        if (activeProject?.filename === drawing.filename) {
            setActiveProject(null);
        } else {
            // Set as active project and load it
            setActiveProject(drawing);
            setLoadingFilename(drawing.filename);

            try {
                await LoadDrawingBgScript.run(drawing, owner);
            } catch (error) {
                console.error('Failed to load drawing:', error);
                alert('Failed to load drawing. Make sure you are on an Excalidraw page.');
            } finally {
                setLoadingFilename(null);
            }
        }
    }

    if (isLoading) {
        return (
            <div className="text-center py-6 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--excali-purple] mx-auto"></div>
                <p className="text-sm mt-2">Loading drawings...</p>
            </div>
        );
    }

    if (!drawings || drawings.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No Excalidraw drawings found</p>
                <p className="text-xs mt-2">Create your first drawing to get started</p>
            </div>
        );
    }

    return (
        <div className="gap-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
            {drawings.map((drawing) => (
                <Drawing
                    key={drawing.filename}
                    drawing={drawing}
                    isSelected={activeProject?.filename === drawing.filename}
                    onSelect={handleSelectDrawing}
                    isLoading={loadingFilename === drawing.filename}
                />
            ))}
        </div>
    )
}