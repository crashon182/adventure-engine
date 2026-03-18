import React from 'react';
import { Map, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface NodePropertiesPanelProps {
    node: any;
    onDelete: (id: string) => void;
}

export default function NodePropertiesPanel({ node, onDelete }: NodePropertiesPanelProps) {
    if (!node) return null;

    const { data } = node;

    return (
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Room Properties</h3>
            </div>

            <div className="p-4 space-y-6">
                <div className="space-y-4">
                    <div className="w-full aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        {data.backgroundImage ? (
                            <img src={data.backgroundImage} alt={data.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <Map size={48} />
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className="text-xl font-bold text-white mb-1">{data.name}</h4>
                        <p className="text-xs text-gray-500 font-mono">ID: {node.id}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link
                        href={`/editor/${data.projectId}/rooms/${node.id}`}
                        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-md text-sm font-medium transition-colors"
                    >
                        <ExternalLink size={16} />
                        Open Room Editor
                    </Link>
                </div>

                <div className="pt-6 border-t border-gray-800">
                    <button
                        onClick={() => onDelete(node.id)}
                        className="flex items-center justify-center gap-2 w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        <Trash2 size={16} />
                        Remove from Map
                    </button>
                    <p className="text-[10px] text-gray-500 mt-2 text-center italic">
                        Note: Removing from map does NOT delete the room, only its position and connections.
                    </p>
                </div>
            </div>
        </div>
    );
}
