import { Gist } from "@/types/gist";
import { getExcalidrawMetadata } from "@/lib/gist";

type CleanGist = {
    title: string;
    updatedAt: string;
    gistId: string;
    htmlUrl: string;
    fileSize: number;
    hasContent: boolean;
    filename: string;
}

function Drawing({ gist }: { gist: CleanGist }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 hover:shadow-md transition-shadow">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 truncate">{gist.title}</h2>
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <span>{new Date(gist.updatedAt).toLocaleDateString()}</span>
            <span>{gist.fileSize > 0 ? `${(gist.fileSize / 1024).toFixed(1)}KB` : 'Unknown'}</span>
          </div>
          <div className="flex space-x-2">
            <a 
              href={gist.htmlUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              View
            </a>
            {!gist.hasContent && (
              <span className="text-orange-600 text-xs">Not cached</span>
            )}
          </div>
        </div>
    )
}

export default function Gallery({ gists }: { gists: Gist[] }) {
    const formattedGists = gists
        .map(gist => {
            // Find the first Excalidraw file
            const excalidrawFile = Object.values(gist.files).find(file => 
                file.filename?.endsWith('.excalidraw') || 
                file.filename?.endsWith('.excalidraw.json')
            );

            if (!excalidrawFile) {
                return null; // Skip non-Excalidraw gists
            }

            const metadata = getExcalidrawMetadata(gist, excalidrawFile.filename);
            
            if (!metadata) {
                return null;
            }

            return {
                title: excalidrawFile.filename || 'Untitled',
                updatedAt: gist.updated_at,
                gistId: gist.id,
                htmlUrl: gist.html_url,
                fileSize: excalidrawFile.size || 0,
                hasContent: !!excalidrawFile.content,
                filename: excalidrawFile.filename || 'drawing.excalidraw',
            } as CleanGist;
        })
        .filter((gist): gist is CleanGist => gist !== null);

    if (formattedGists.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No Excalidraw drawings found</p>
            </div>
        );
    }

    return (
        <div className="gap-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full">
            {formattedGists.map((gist) => (
                <Drawing key={gist.gistId} gist={gist} />
            ))}
        </div>
    )
}