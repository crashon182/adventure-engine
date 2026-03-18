import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Map as MapIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const RoomNode = ({ data, selected }: { data: any, selected?: boolean }) => {
    return (
        <div className={`group px-0 pb-0 rounded-lg bg-gray-800 border-2 transition-all ${selected ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-700 hover:border-gray-600'}`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-gray-800" />

            <div className="p-3 border-b border-gray-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <MapIcon size={14} className="text-blue-400" />
                    <span className="text-sm font-bold text-white truncate max-w-[120px]">{data.name}</span>
                </div>
                <Link
                    href={`/editor/${data.projectId}/rooms/${data.id}`}
                    className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                >
                    <ExternalLink size={14} />
                </Link>
            </div>

            <div className="w-full h-24 bg-gray-900 overflow-hidden relative">
                {data.backgroundImage ? (
                    <img
                        src={data.backgroundImage}
                        alt={data.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <MapIcon size={24} />
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-gray-800" />

            {/* Directional Handles for better UX */}
            <Handle type="source" position={Position.Left} id="left" className="opacity-0 group-hover:opacity-100" />
            <Handle type="source" position={Position.Right} id="right" className="opacity-0 group-hover:opacity-100" />
        </div>
    );
};

export default memo(RoomNode);
