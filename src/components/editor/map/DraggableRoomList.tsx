import React from 'react';
import { Map as MapIcon, GripVertical, Search } from 'lucide-react';

interface DraggableRoomListProps {
    rooms: any[];
}

export default function DraggableRoomList({ rooms }: DraggableRoomListProps) {
    const onDragStart = (event: React.DragEvent, room: any) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(room));
        event.dataTransfer.effectAllowed = 'move';

        // Create a custom drag image if desired
        const dragPreview = document.createElement('div');
        dragPreview.className = 'bg-blue-600 text-white p-2 rounded text-xs px-4 font-bold';
        dragPreview.innerText = room.name;
        document.body.appendChild(dragPreview);
        event.dataTransfer.setDragImage(dragPreview, 0, 0);
        setTimeout(() => document.body.removeChild(dragPreview), 0);
    };

    return (
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-700">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Available Rooms</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {rooms.map(room => (
                    <div
                        key={room.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, room)}
                        className="flex items-center gap-3 p-2 bg-gray-800 border border-gray-700 rounded-md cursor-grab active:cursor-grabbing hover:border-gray-500 hover:bg-gray-750 transition-all select-none group"
                    >
                        <GripVertical size={14} className="text-gray-600 group-hover:text-gray-400" />
                        <div className="w-8 h-8 rounded bg-gray-700 shrink-0 flex items-center justify-center text-gray-500">
                            {room.bgImage ? (
                                <img src={room.bgImage.url} alt="" className="w-full h-full object-cover rounded" />
                            ) : (
                                <MapIcon size={14} />
                            )}
                        </div>
                        <span className="text-sm font-medium truncate">{room.name}</span>
                    </div>
                ))}

                {rooms.length === 0 && (
                    <div className="p-4 text-center text-xs text-gray-500 italic">
                        No rooms available to add.
                    </div>
                )}
            </div>

            <div className="p-4 bg-blue-900/10 border-t border-blue-900/30">
                <p className="text-[10px] text-blue-400 leading-tight">
                    Drag rooms onto the canvas to start building your map.
                </p>
            </div>
        </div>
    );
}
