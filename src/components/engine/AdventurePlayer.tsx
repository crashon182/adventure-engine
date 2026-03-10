'use client';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/engine/store';

const ACTIONS = ['MOVE', 'LOOK', 'TAKE', 'OPEN', 'CLOSE', 'USE', 'SPEAK', 'HIT'];

export default function AdventurePlayer({ projectId }: { projectId: string }) {
    const [loading, setLoading] = useState(true);

    const initGame = useGameStore(s => s.initGame);
    const narrativeText = useGameStore(s => s.narrativeText);
    const activeAction = useGameStore(s => s.activeAction);
    const setAction = useGameStore(s => s.setAction);
    const currentRoomId = useGameStore(s => s.currentRoomId);
    const gameData = useGameStore(s => s.gameData);
    const processInteraction = useGameStore(s => s.processInteraction);
    const inventory = useGameStore(s => s.inventory);
    const spriteStates = useGameStore(s => s.spriteStates);
    const instantiatedSprites = useGameStore(s => s.instantiatedSprites);

    useEffect(() => {
        fetchGameData();
    }, []);

    const fetchGameData = async () => {
        const resRooms = await fetch(`/api/projects/${projectId}/rooms`);
        const resItems = await fetch(`/api/projects/${projectId}/items`);
        const resEvents = await fetch(`/api/projects/${projectId}/events`);

        if (resRooms.ok && resItems.ok && resEvents.ok) {
            initGame({
                rooms: await resRooms.json(),
                items: await resItems.json(),
                events: await resEvents.json(),
            });
            setLoading(false);
        }
    };

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-black text-white font-mono text-xl">INITIALIZING ENGINE...</div>;

    const currentRoom = gameData?.rooms.find((r: any) => r.id === currentRoomId);
    const roomInstantiatedSprites = currentRoomId ? (instantiatedSprites[currentRoomId] || []) : [];
    const allSprites = [...(currentRoom?.sprites || []), ...roomInstantiatedSprites]
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    return (
        <div className="flex justify-center items-center fixed inset-0 bg-black font-mono">
            <div className="w-[1024px] h-[864px] bg-gray-950 flex flex-col border-4 border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">

                {/* Top Section: Scene & Inventory */}
                <div className="flex h-[600px]">
                    {/* Scene (Exactly 800x600 to match Editor) */}
                    <div className="w-[800px] h-[600px] shrink-0 relative border-r-4 border-gray-800 overflow-hidden bg-black">
                        {currentRoom?.bgImage && (
                            <img src={currentRoom.bgImage.url} alt="Scene" className="w-full h-full object-contain pointer-events-none" />
                        )}

                        {/* Sprites */}
                        {allSprites.map((sprite: any) => {
                            const spriteId = (sprite.objectId || sprite.id).toUpperCase();
                            const state = spriteStates[spriteId];
                            const isVisible = state?.visible ?? true;

                            return (
                                <div
                                    key={sprite.id}
                                    className={`absolute cursor-pointer ${activeAction ? 'hover:outline hover:outline-2 hover:outline-red-500' : ''}`}
                                    style={{
                                        top: state?.y ?? sprite.y,
                                        left: state?.x ?? sprite.x,
                                        width: sprite.width,
                                        height: sprite.height,
                                        backgroundImage: `url(${sprite.asset.url})`,
                                        backgroundSize: '100% 100%',
                                        zIndex: (sprite.zIndex || 0) + 10,
                                        opacity: isVisible ? 1 : 0,
                                        pointerEvents: isVisible ? 'auto' : 'none',
                                        transition: 'all 0.5s ease-in-out'
                                    }}
                                    onPointerDown={() => processInteraction(sprite.objectId || sprite.id)}
                                />
                            );
                        })}

                        {/* Hotspots */}
                        {currentRoom?.hotspots?.map((hs: any) => {
                            const hsId = (hs.objectId || hs.action || hs.id).toUpperCase();
                            const state = spriteStates[hsId];
                            const isVisible = state?.visible ?? true;

                            return (
                                <div
                                    key={hs.id}
                                    className={`absolute cursor-pointer ${activeAction ? 'hover:bg-red-500/20' : ''}`}
                                    style={{
                                        top: state?.y ?? hs.y,
                                        left: state?.x ?? hs.x,
                                        width: hs.width,
                                        height: hs.height,
                                        zIndex: 50,
                                        opacity: isVisible ? 1 : 0,
                                        pointerEvents: isVisible ? 'auto' : 'none',
                                    }}
                                    onPointerDown={() => processInteraction(hs.objectId || hs.action || hs.id)}
                                />
                            );
                        })}
                    </div>

                    {/* Inventory Panel */}
                    <div className="flex-1 bg-gray-900 p-4 flex flex-col">
                        <h2 className="text-gray-400 font-bold mb-4 tracking-widest text-center border-b border-gray-700 pb-2">INVENTORY</h2>
                        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 content-start">
                            {inventory.map(item => (
                                <div
                                    key={item.id}
                                    className="aspect-square bg-gray-950 border-2 border-gray-800 flex items-center justify-center cursor-pointer hover:border-blue-500"
                                    title={item.name}
                                    onClick={() => processInteraction(item.id)}
                                >
                                    {item.icon ? (
                                        <img src={item.icon.url} className="w-full h-full object-contain p-2 pointer-events-none" />
                                    ) : (
                                        <span className="text-[10px] text-gray-600 text-center uppercase p-1">{item.name}</span>
                                    )}
                                </div>
                            ))}
                            {inventory.length === 0 && <div className="col-span-2 text-center text-gray-700 text-xs mt-10">EMPTY</div>}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Actions & Text */}
                <div className="flex flex-1 border-t-4 border-gray-800">
                    {/* Actions Grid */}
                    <div className="w-[400px] border-r-4 border-gray-800 p-4 shrink-0 bg-gray-900">
                        <div className="grid grid-cols-2 gap-3 h-full content-center">
                            {ACTIONS.map(action => (
                                <button
                                    key={action}
                                    onClick={() => setAction(action)}
                                    className={`py-3 px-4 font-bold border-2 transition-all ${activeAction === action ? 'bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'}`}
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Narrative Text */}
                    <div className="flex-1 p-6 bg-black relative">
                        <div className="text-gray-300 text-xl leading-relaxed whitespace-pre-wrap">
                            {narrativeText}
                            <span className="animate-pulse inline-block w-3 h-5 bg-gray-300 ml-1 translate-y-1"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
