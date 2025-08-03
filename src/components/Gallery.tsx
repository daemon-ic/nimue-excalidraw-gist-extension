import { Gist } from "@/types/gist";
import { useActiveProject } from "@/hooks/useActiveProject";
import { LoadDrawingBgScript } from "@/services_old/background-web-scripts";
import { useState, useMemo } from "react";
import { GIST_FILENAME } from "@/shared/config";

function formatDate(dateString: string) {
    const date = new Date(dateString);

    // Format as "YYYY-MM-DD h:mmam/pm"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Convert to 12-hour format with am/pm
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;

    return `${year}-${month}-${day} ${displayHours}:${minutes}${ampm}`;
}

function Drawing({ gist, isSelected, onSelect, isLoading }: {
    gist: Gist,
    isSelected: boolean,
    onSelect: (gist: Gist) => void,
    isLoading?: boolean
}) {
    return (
        <div
            className={`bg-white rounded-lg shadow-sm p-3 border transition-all cursor-pointer ${isSelected
                    ? 'border-[--excali-purple] shadow-md bg-[--excali-light-purple]'
                    : 'border-gray-200 hover:shadow-md hover:border-gray-300'
                } ${isLoading ? 'opacity-50' : ''}`}
            onClick={() => !isLoading && onSelect(gist)}
        >
            <h2 className={`text-sm font-semibold mb-2 truncate ${isSelected ? 'text-[--excali-purple]' : 'text-gray-700'
                }`}>
                {gist.description}
            </h2>
            <div className="flex flex-col justify-between items-center text-[10px] text-gray-500 mb-2">
                <span className="text-[10px] w-full text-left">Last Updated</span>
                <span className="text-[10px] w-full text-left">{formatDate(gist.updated_at)}</span>
            </div>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[--excali-purple]"></div>
                </div>
            )}
        </div>
    )
}

export default function Gallery({ gists }: { gists: Gist[] }) {
    const { activeProject, setActiveProject } = useActiveProject();
    const [loadingGistId, setLoadingGistId] = useState<string | null>(null);

    // Sort gists by last modified date (newest first)
    const sortedGists = useMemo(() => {
        const excalidrawGists = gists
            .filter(gist => Object.values(gist.files)
                .some(file => file.filename === GIST_FILENAME)
            );

        return excalidrawGists.sort((a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    }, [gists]);

    async function handleSelectDrawing(gist: Gist) {
        // If clicking the same project, deselect it
        if (activeProject?.id === gist.id) {
            setActiveProject(null);
        } else {
            // Set as active project and load it
            setActiveProject(gist);
            setLoadingGistId(gist.id);

            try {
                await LoadDrawingBgScript.run(gist);
            } catch (error) {
                console.error('Failed to load drawing:', error);
                alert('Failed to load drawing. Make sure you are on an Excalidraw page.');
            } finally {
                setLoadingGistId(null);
            }
        }
    }

    if (gists.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No Excalidraw drawings found</p>
            </div>
        );
    }

    return (
        <div className="gap-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
            {sortedGists.map((gist) => (
                <Drawing
                    key={gist.id}
                    gist={gist}
                    isSelected={activeProject?.id === gist.id}
                    onSelect={handleSelectDrawing}
                    isLoading={loadingGistId === gist.id}
                />
            ))}
        </div>
    )
}