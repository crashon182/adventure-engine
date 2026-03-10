'use client';
import { useState, useEffect, useRef } from 'react';
import { Trash2, UploadCloud, LayoutTemplate, Workflow, Eye, EyeOff, Package } from 'lucide-react';
import RoomEventsPanel from '@/components/editor/RoomEventsPanel';

export default function RoomEditor({ params }: { params: { projectId: string; roomId: string } }) {
    const [room, setRoom] = useState<any>(null);
    const [assets, setAssets] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState<'visual' | 'logic'>('visual');
    const canvasRef = useRef<HTMLDivElement>(null);

    // Layout and UI Resizing state
    const [sidebarWidth, setSidebarWidth] = useState(256);
    const [bottomHeight, setBottomHeight] = useState(280);
    const [logicSplitRatio, setLogicSplitRatio] = useState(0.5); // 0.5 means 50/50
    const [uiResizing, setUiResizing] = useState<'sidebar' | 'bottom' | 'split' | null>(null);

    // Dragging and Resizing state (for sprites/hotspots)
    const [interaction, setInteraction] = useState<{
        type: 'drag' | 'resize',
        kind: 'hotspot' | 'sprite',
        id: string,
        startX: number,
        startY: number,
        initialX: number,
        initialY: number,
        initialWidth: number,
        initialHeight: number
    } | null>(null);

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!uiResizing) return;

            if (uiResizing === 'sidebar') {
                setSidebarWidth(Math.max(150, Math.min(500, e.clientX)));
            } else if (uiResizing === 'bottom') {
                const height = window.innerHeight - e.clientY;
                setBottomHeight(Math.max(100, Math.min(window.innerHeight - 200, height)));
            } else if (uiResizing === 'split') {
                const container = document.getElementById('main-editor-container');
                if (container) {
                    const rect = container.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    setLogicSplitRatio(Math.max(0.2, Math.min(0.8, ratio)));
                }
            }
        };

        const handleGlobalMouseUp = () => {
            setUiResizing(null);
        };

        if (uiResizing) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [uiResizing]);

    useEffect(() => {
        fetchRoom();
        fetchAssets();
        fetchItems();
    }, [params.roomId]);

    const fetchItems = async () => {
        const res = await fetch(`/api/projects/${params.projectId}/items`);
        if (res.ok) setItems(await res.json());
    };

    const fetchRoom = async () => {
        const res = await fetch(`/api/rooms/${params.roomId}`);
        if (res.ok) setRoom(await res.json());
    };

    const fetchAssets = async () => {
        const res = await fetch(`/api/projects/${params.projectId}/assets`);
        if (res.ok) setAssets(await res.json());
    };

    const updateRoomProperty = async (data: any) => {
        const res = await fetch(`/api/rooms/${params.roomId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) fetchRoom();
    };

    const handleAddHotspot = async () => {
        const res = await fetch(`/api/rooms/${params.roomId}/hotspots`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'New Hotspot', x: 50, y: 50, width: 100, height: 100 })
        });
        if (res.ok) fetchRoom();
    };

    const handleAddSprite = async (file?: File) => {
        let assetId = null;

        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', `Sprite_${file.name.split('.')[0]}`);

            const resAsset = await fetch(`/api/projects/${params.projectId}/assets`, {
                method: 'POST',
                body: formData
            });
            if (resAsset.ok) {
                const asset = await resAsset.json();
                assetId = asset.id;
                fetchAssets();
            }
        } else {
            const firstImageAsset = assets.find(a => a.type === 'image');
            if (!firstImageAsset) {
                alert('Please upload an image asset first.');
                return;
            }
            assetId = firstImageAsset.id;
        }

        if (!assetId) return;

        const res = await fetch(`/api/rooms/${params.roomId}/sprites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: file ? file.name.split('.')[0] : 'New Sprite',
                x: 100,
                y: 100,
                width: 100,
                height: 100,
                assetId: assetId
            })
        });
        if (res.ok) fetchRoom();
    };

    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedSave = (type: 'hotspot' | 'sprite', id: string, data: any) => {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
            const url = type === 'hotspot' ? `/api/hotspots/${id}` : `/api/sprites/${id}`;
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }, 500); // 500ms debounce
    };

    const updateHotspot = (id: string, data: any) => {
        // Snappy local update
        setRoom((prev: any) => ({
            ...prev,
            hotspots: prev.hotspots.map((h: any) => h.id === id ? { ...h, ...data } : h)
        }));
        // Background save - only send what changed
        debouncedSave('hotspot', id, data);
    };

    const updateSprite = (id: string, data: any) => {
        // Snappy local update
        setRoom((prev: any) => ({
            ...prev,
            sprites: prev.sprites.map((s: any) => s.id === id ? { ...s, ...data } : s)
        }));
        // Background save - only send what changed
        debouncedSave('sprite', id, data);
    };

    const toggleSpriteVisibility = (id: string) => {
        const sprite = room.sprites.find((s: any) => s.id === id);
        if (sprite) {
            updateSprite(id, { visible: !sprite.visible });
        }
    };

    const toggleHotspotVisibility = (id: string) => {
        const hs = room.hotspots.find((h: any) => h.id === id);
        if (hs) {
            updateHotspot(id, { visible: !hs.visible });
        }
    };

    const deleteHotspot = async (id: string) => {
        await fetch(`/api/hotspots/${id}`, { method: 'DELETE' });
        if (selectedHotspot === id) setSelectedHotspot(null);
        fetchRoom();
    };

    const handleAddGlobalItem = async () => {
        const res = await fetch(`/api/projects/${params.projectId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'New Item', description: '' })
        });
        if (res.ok) fetchItems();
    };

    const updateItemProperty = async (id: string, data: any) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
        await fetch(`/api/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Delete this item?')) return;
        await fetch(`/api/items/${id}`, { method: 'DELETE' });
        if (selectedItemId === id) setSelectedItemId(null);
        fetchItems();
    };

    const deleteSprite = async (id: string) => {
        await fetch(`/api/sprites/${id}`, { method: 'DELETE' });
        if (selectedHotspot === id) setSelectedHotspot(null);
        fetchRoom();
    };

    const updateMousePos = (e: React.PointerEvent) => {
        if (!canvasRef.current || interaction) return;
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
            x: Math.round(e.clientX - rect.left),
            y: Math.round(e.clientY - rect.top)
        });
    };

    const handlePointerDown = (e: React.PointerEvent, item: any, type: 'drag' | 'resize', kind: 'hotspot' | 'sprite') => {
        e.stopPropagation();
        setSelectedHotspot(item.id);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setInteraction({
            type,
            kind,
            id: item.id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: item.x,
            initialY: item.y,
            initialWidth: item.width,
            initialHeight: item.height
        });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        updateMousePos(e);
        if (!interaction) return;
        const dx = e.clientX - interaction.startX;
        const dy = e.clientY - interaction.startY;

        setRoom((prev: any) => {
            const listName = interaction.kind === 'hotspot' ? 'hotspots' : 'sprites';
            return {
                ...prev,
                [listName]: prev[listName].map((h: any) => {
                    if (h.id !== interaction.id) return h;

                    if (interaction.type === 'drag') {
                        return { ...h, x: interaction.initialX + dx, y: interaction.initialY + dy };
                    } else {
                        let newWidth = Math.max(10, interaction.initialWidth + dx);
                        let newHeight = Math.max(10, interaction.initialHeight + dy);

                        if (e.shiftKey) {
                            const ratio = interaction.initialWidth / interaction.initialHeight;
                            // If user moved more horizontally, base on width, else height
                            if (Math.abs(dx) > Math.abs(dy)) {
                                newHeight = newWidth / ratio;
                            } else {
                                newWidth = newHeight * ratio;
                            }
                        }

                        return { ...h, width: newWidth, height: newHeight };
                    }
                })
            };
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!interaction) return;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

        // Save to DB
        const listName = interaction.kind === 'hotspot' ? 'hotspots' : 'sprites';
        const updatedItem = room[listName].find((h: any) => h.id === interaction.id);

        if (updatedItem) {
            const saveFunc = interaction.kind === 'hotspot' ? updateHotspot : updateSprite;
            saveFunc(updatedItem.id, {
                name: updatedItem.name,
                assetId: updatedItem.assetId, // Only for sprites, but ignored for hotspots
                x: updatedItem.x,
                y: updatedItem.y,
                width: updatedItem.width,
                height: updatedItem.height,
                objectId: updatedItem.objectId,
                action: updatedItem.action,
                description: updatedItem.description,
                zIndex: updatedItem.zIndex
            });
        }

        setInteraction(null);
    };

    const handleUploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        // Create an asset first
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', `Bg_${file.name.split('.')[0]}`);

        try {
            const res = await fetch(`/api/projects/${params.projectId}/assets`, {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                const newAsset = await res.json();
                await updateRoomProperty({ bgImageId: newAsset.id });
                fetchAssets();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    if (!room) return <div className="p-8 text-white">Loading room...</div>;

    const renderVisualCanvas = (isSmall = false) => (
        <div className={`flex-1 p-4 relative flex flex-col items-center justify-center overflow-auto ${isSmall ? 'bg-gray-900 border-l border-gray-800' : ''}`}>
            {!room.bgImageId && <div className="text-gray-500 mb-4 bg-gray-900 border border-gray-800 p-4 rounded text-sm z-10">No background image selected.</div>}

            <div
                ref={canvasRef}
                className="border border-gray-700 relative overflow-hidden bg-gray-950 shadow-2xl shrink-0"
                style={{
                    width: '800px',
                    height: '600px',
                    backgroundImage: room.bgImage ? `url(${room.bgImage.url})` : 'none',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transform: isSmall ? 'scale(0.8)' : 'none',
                    transformOrigin: 'center'
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={() => setMousePos({ x: 0, y: 0 })}
            >
                {/* Mouse coordinates overlay */}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded border border-gray-700 pointer-events-none z-50 font-mono">
                    X: {mousePos.x} Y: {mousePos.y}
                </div>
                {/* Render Sprites */}
                {room.sprites?.map((sprite: any) => (
                    <div
                        key={sprite.id}
                        onPointerDown={(e) => handlePointerDown(e, sprite, 'drag', 'sprite')}
                        style={{
                            top: sprite.y,
                            left: sprite.x,
                            width: sprite.width,
                            height: sprite.height,
                            backgroundImage: `url(${sprite.asset.url})`,
                            backgroundSize: '100% 100%',
                            zIndex: (sprite.zIndex || 0) + 10,
                            opacity: sprite.visible === false ? 0.3 : 1,
                            filter: sprite.visible === false ? 'grayscale(1)' : 'none',
                        }}
                        className={`absolute cursor-move ${selectedHotspot === sprite.id ? 'outline outline-2 outline-yellow-400 !z-50' : 'hover:outline hover:outline-2 hover:outline-blue-400'}`}
                    >
                        <div className="bg-black/80 text-white text-[10px] absolute -top-5 left-0 px-1 whitespace-nowrap">{sprite.name}</div>
                        <div
                            className="w-3 h-3 bg-white absolute bottom-0 right-0 cursor-se-resize z-30"
                            onPointerDown={(e) => handlePointerDown(e, sprite, 'resize', 'sprite')}
                        />
                    </div>
                ))}

                {/* Render Hotspots */}
                {room.hotspots.map((hs: any) => (
                    <div
                        key={hs.id}
                        onPointerDown={(e) => handlePointerDown(e, hs, 'drag', 'hotspot')}
                        style={{
                            top: hs.y,
                            left: hs.x,
                            width: hs.width,
                            height: hs.height,
                            opacity: hs.visible === false ? 0.3 : 1,
                        }}
                        className={`absolute border-2 cursor-move ${selectedHotspot === hs.id ? 'border-yellow-400 bg-yellow-400/20 z-20' : 'border-blue-500 bg-blue-500/10 hover:border-blue-300'}`}
                    >
                        <div className="bg-black/80 text-white text-[10px] absolute -top-5 left-0 px-1 whitespace-nowrap">{hs.name}</div>
                        <div
                            className="w-3 h-3 bg-white absolute bottom-0 right-0 cursor-se-resize z-30"
                            onPointerDown={(e) => handlePointerDown(e, hs, 'resize', 'hotspot')}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full text-white bg-black select-none" id="main-editor-container">
            {/* Top Bar for Tabs */}
            <div className="h-12 border-b border-gray-800 flex items-center px-4 bg-gray-950 shrink-0 gap-4">
                <button
                    onClick={() => setActiveTab('visual')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'visual' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                >
                    <LayoutTemplate size={16} /> Visual Designer
                </button>
                <button
                    onClick={() => setActiveTab('logic')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeTab === 'logic' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                >
                    <Workflow size={16} /> Event Logic
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Objects Explorer */}
                <aside
                    className="bg-gray-900 border-r border-gray-700 flex flex-col shrink-0"
                    style={{ width: sidebarWidth }}
                >
                    <div className="p-4 border-b border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                        Objects
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 border-b border-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase">Sprites</h4>
                                <div className="flex gap-1">
                                    <label className="text-[10px] bg-purple-600 hover:bg-purple-700 px-2 py-0.5 rounded text-white font-medium transition-colors cursor-pointer" title="Upload & Add">
                                        + <UploadCloud size={10} className="inline ml-1" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleAddSprite(file);
                                            }}
                                        />
                                    </label>
                                    <button onClick={() => handleAddSprite()} className="text-[10px] bg-gray-700 hover:bg-gray-600 px-2 py-0.5 rounded text-white font-medium" title="Add New">+</button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                {room.sprites?.map((sprite: any) => (
                                    <div
                                        key={sprite.id}
                                        onClick={() => { setSelectedHotspot(sprite.id); setSelectedItemId(null); }}
                                        className={`px-3 py-1.5 rounded cursor-pointer text-sm truncate transition-colors flex items-center justify-between group ${selectedHotspot === sprite.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleSpriteVisibility(sprite.id); }}
                                                className={`p-1 rounded hover:bg-black/20 transition-colors ${sprite.visible === false ? 'text-gray-600' : 'text-blue-400'}`}
                                                title={sprite.visible === false ? 'Hidden' : 'Visible'}
                                            >
                                                {sprite.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <span className={sprite.visible === false ? 'opacity-50' : ''}>{sprite.name}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); deleteSprite(sprite.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-b border-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase">Hotspots</h4>
                                <button onClick={handleAddHotspot} className="text-[10px] bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded text-white font-medium">Add +</button>
                            </div>
                            <div className="space-y-1">
                                {room.hotspots?.map((hs: any) => (
                                    <div
                                        key={hs.id}
                                        onClick={() => { setSelectedHotspot(hs.id); setSelectedItemId(null); }}
                                        className={`px-3 py-1.5 rounded cursor-pointer text-sm truncate transition-colors flex items-center justify-between group ${selectedHotspot === hs.id ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleHotspotVisibility(hs.id); }}
                                                className={`p-1 rounded hover:bg-black/20 transition-colors ${hs.visible === false ? 'text-gray-600' : 'text-yellow-400'}`}
                                                title={hs.visible === false ? 'Hidden' : 'Visible'}
                                            >
                                                {hs.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <span className={hs.visible === false ? 'opacity-50' : ''}>{hs.name}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); deleteHotspot(hs.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase">Project Items</h4>
                                <button onClick={handleAddGlobalItem} className="text-[10px] bg-green-600 hover:bg-green-700 px-2 py-0.5 rounded text-white font-medium">Add Template +</button>
                            </div>
                            <div className="space-y-1">
                                {items?.map((item: any) => (
                                    <div
                                        key={item.id}
                                        onClick={() => { setSelectedItemId(item.id); setSelectedHotspot(null); }}
                                        className={`px-3 py-1.5 rounded cursor-pointer text-sm truncate transition-colors flex items-center justify-between group ${selectedItemId === item.id ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Package size={14} className="text-green-500" />
                                            <span>{item.name}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Sidebar Resizer */}
                <div
                    className="w-1 cursor-col-resize hover:bg-blue-500 transition-colors z-50 bg-gray-800"
                    onMouseDown={() => setUiResizing('sidebar')}
                />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 flex overflow-hidden">
                        {activeTab === 'visual' ? (
                            renderVisualCanvas()
                        ) : (
                            <div className="flex-1 flex overflow-hidden">
                                <div style={{ width: `${logicSplitRatio * 100}%` }} className="flex flex-col overflow-hidden">
                                    <RoomEventsPanel roomId={params.roomId} projectId={params.projectId} />
                                </div>
                                <div
                                    className="w-1 cursor-col-resize hover:bg-blue-500 transition-colors z-50 bg-gray-800"
                                    onMouseDown={() => setUiResizing('split')}
                                />
                                {renderVisualCanvas(true)}
                            </div>
                        )}
                    </div>

                    {/* Bottom Resizer */}
                    <div
                        className="h-1 cursor-row-resize hover:bg-blue-500 transition-colors z-50 bg-gray-800"
                        onMouseDown={() => setUiResizing('bottom')}
                    />

                    {/* Horizontal Bottom Properties Panel */}
                    <div
                        className="bg-gray-900 flex flex-col shrink-0 overflow-hidden"
                        style={{ height: bottomHeight }}
                    >
                        <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                            <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500">
                                {selectedItemId ? (
                                    'Inventory Item Properties'
                                ) : selectedHotspot ? (
                                    room.sprites.find((s: any) => s.id === selectedHotspot) ? 'Sprite Properties' : 'Hotspot Properties'
                                ) : 'Room Properties'}
                            </h3>
                            {(selectedHotspot || selectedItemId) && (
                                <button onClick={() => { setSelectedHotspot(null); setSelectedItemId(null); }} className="text-[10px] text-blue-400 hover:underline">Edit Room Instead</button>
                            )}
                        </div>
                        <div className="p-4 flex-1 overflow-x-auto">
                            <div className="flex gap-8 min-w-max h-full">
                                {selectedItemId ? (
                                    /* Item Properties */
                                    (() => {
                                        const item = items.find(i => i.id === selectedItemId);
                                        return (
                                            <>
                                                <div className="w-64 space-y-4">
                                                    <div>
                                                        <label className="text-xs text-gray-500 block">Item Name</label>
                                                        <input
                                                            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mt-1 outline-none text-white text-sm focus:border-blue-500"
                                                            value={item.name}
                                                            onChange={(e) => updateItemProperty(item.id, { name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 block">Description</label>
                                                        <textarea
                                                            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mt-1 outline-none text-white text-sm focus:border-blue-500 h-20 resize-none"
                                                            value={item.description || ''}
                                                            onChange={(e) => updateItemProperty(item.id, { description: e.target.value })}
                                                            placeholder="What happens when looking at it?"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="w-64 space-y-4">
                                                    <div>
                                                        <label className="text-xs text-gray-500 block">Inventory Icon</label>
                                                        <select
                                                            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mt-1 outline-none text-white text-sm focus:border-blue-500"
                                                            value={item.iconId || ''}
                                                            onChange={(e) => updateItemProperty(item.id, { iconId: e.target.value || null })}
                                                        >
                                                            <option value="">No Icon (Text only)</option>
                                                            {assets.filter(a => a.type === 'image').map(a => (
                                                                <option key={a.id} value={a.id}>{a.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()
                                ) : !selectedHotspot ? (
                                    /* Room Properties */
                                    <>
                                        <div className="w-64 space-y-4">
                                            <div>
                                                <label className="text-xs text-gray-500 block">Room Name</label>
                                                <input
                                                    className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mt-1 outline-none text-white text-sm focus:border-blue-500"
                                                    value={room.name}
                                                    onChange={(e) => updateRoomProperty({ name: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="w-64 space-y-4">
                                            <div>
                                                <label className="text-xs text-gray-500 block">Background Image</label>
                                                <select
                                                    className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mt-1 outline-none text-white text-sm focus:border-blue-500"
                                                    value={room.bgImageId || ''}
                                                    onChange={(e) => updateRoomProperty({ bgImageId: e.target.value || null })}
                                                >
                                                    <option value="">None</option>
                                                    {assets.filter(a => a.type === 'image').map(a => (
                                                        <option key={a.id} value={a.id}>{a.name}</option>
                                                    ))}
                                                </select>
                                                <div className={`mt-2 text-xs text-center border border-dashed border-gray-600 rounded py-2 transition-colors relative flex items-center justify-center gap-2 ${uploading ? 'text-gray-500 cursor-wait' : 'text-gray-400 hover:border-gray-400 hover:text-white cursor-pointer'}`}>
                                                    {uploading ? 'Uploading...' : <><UploadCloud size={14} /> Or upload new image</>}
                                                    {!uploading && (
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                            onChange={handleUploadBackground}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Object Properties (Sprite or Hotspot) */
                                    room.sprites.find((s: any) => s.id === selectedHotspot) ? (
                                        /* Sprite Properties */
                                        (() => {
                                            const sprite = room.sprites.find((s: any) => s.id === selectedHotspot);
                                            return (
                                                <>
                                                    <div className="w-64 space-y-4">
                                                        <div>
                                                            <label className="text-xs text-gray-500 block">Sprite Name</label>
                                                            <input
                                                                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mt-1 outline-none text-white text-sm focus:border-blue-500"
                                                                value={sprite.name}
                                                                onChange={(e) => updateSprite(sprite.id, { name: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500 block">Object ID (Logic)</label>
                                                            <input
                                                                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mt-1 outline-none text-white text-sm focus:border-blue-500"
                                                                value={sprite.objectId || ''}
                                                                onChange={(e) => updateSprite(sprite.id, { objectId: e.target.value })}
                                                                placeholder="e.g. SKULL"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-64 space-y-2">
                                                        <label className="text-xs text-gray-500 block">Transformations</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-bold">X</label>
                                                                <input type="number" value={Math.round(sprite.x)} onChange={(e) => updateSprite(sprite.id, { x: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 px-2 py-1.5 rounded text-xs text-blue-400 font-mono" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-bold">Y</label>
                                                                <input type="number" value={Math.round(sprite.y)} onChange={(e) => updateSprite(sprite.id, { y: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 px-2 py-1.5 rounded text-xs text-blue-400 font-mono" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-bold">W</label>
                                                                <input type="number" value={Math.round(sprite.width)} onChange={(e) => updateSprite(sprite.id, { width: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 px-2 py-1.5 rounded text-xs px-2" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-bold">H</label>
                                                                <input type="number" value={Math.round(sprite.height)} onChange={(e) => updateSprite(sprite.id, { height: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 px-2 py-1.5 rounded text-xs px-2" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-64 space-y-4">
                                                        <div>
                                                            <label className="text-xs text-gray-500 block">Layer (Z-Index)</label>
                                                            <input type="number" value={sprite.zIndex || 0} onChange={(e) => updateSprite(sprite.id, { zIndex: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 px-3 py-2 rounded text-sm text-purple-400 font-mono mt-1" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500 block">Image Asset</label>
                                                            <select
                                                                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mt-1 outline-none text-white text-sm focus:border-blue-500"
                                                                value={sprite.assetId}
                                                                onChange={(e) => updateSprite(sprite.id, { assetId: e.target.value })}
                                                            >
                                                                {assets.filter(a => a.type === 'image').map(a => (
                                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-[300px] h-full">
                                                        <label className="text-xs text-gray-500 block">Description (LOOK)</label>
                                                        <textarea
                                                            value={sprite.description || ''}
                                                            onChange={(e) => updateSprite(sprite.id, { description: e.target.value })}
                                                            placeholder="What happens when looking at it?"
                                                            className="w-full bg-black border border-gray-700 px-3 py-2 outline-none text-sm h-[140px] resize-none mt-1 rounded focus:border-blue-500"
                                                        />
                                                    </div>
                                                </>
                                            );
                                        })()
                                    ) : (
                                        /* Hotspot Properties */
                                        (() => {
                                            const hs = room.hotspots.find((h: any) => h.id === selectedHotspot);
                                            return (
                                                <>
                                                    <div className="w-64 space-y-4">
                                                        <div>
                                                            <label className="text-xs text-gray-500 block">Hotspot Name</label>
                                                            <input
                                                                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mt-1 outline-none text-white text-sm focus:border-blue-500"
                                                                value={hs.name}
                                                                onChange={(e) => updateHotspot(hs.id, { name: e.target.value })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500 block">Action Prefix / Object ID</label>
                                                            <input
                                                                className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded mt-1 outline-none text-white text-sm focus:border-blue-500"
                                                                value={hs.action || hs.objectId || ''}
                                                                onChange={(e) => updateHotspot(hs.id, { action: e.target.value, objectId: e.target.value })}
                                                                placeholder="Target for events"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-64 space-y-2">
                                                        <label className="text-xs text-gray-500 block">Dimensions</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-bold">X</label>
                                                                <input type="number" value={Math.round(hs.x)} onChange={(e) => updateHotspot(hs.id, { x: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 px-2 py-1.5 rounded text-xs text-blue-400 font-mono" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-bold">Y</label>
                                                                <input type="number" value={Math.round(hs.y)} onChange={(e) => updateHotspot(hs.id, { y: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 px-2 py-1.5 rounded text-xs text-blue-400 font-mono" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-bold">W</label>
                                                                <input type="number" value={Math.round(hs.width)} onChange={(e) => updateHotspot(hs.id, { width: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 px-2 py-1.5 rounded text-xs px-2" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-400 font-bold">H</label>
                                                                <input type="number" value={Math.round(hs.height)} onChange={(e) => updateHotspot(hs.id, { height: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 px-2 py-1.5 rounded text-xs px-2" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-[300px] h-full">
                                                        <label className="text-xs text-gray-500 block">Description (LOOK)</label>
                                                        <textarea
                                                            value={hs.description || ''}
                                                            onChange={(e) => updateHotspot(hs.id, { description: e.target.value })}
                                                            placeholder="What happens when looking at it?"
                                                            className="w-full bg-black border border-gray-700 px-3 py-2 outline-none text-sm h-[140px] resize-none mt-1 rounded focus:border-blue-500"
                                                        />
                                                    </div>
                                                </>
                                            );
                                        })()
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
