'use client';
import { useState, useEffect } from 'react';
import { Code, Trash2, Plus, ArrowRight } from 'lucide-react';

const ACTIONS = ['MOVE', 'LOOK', 'TAKE', 'OPEN', 'CLOSE', 'USE', 'SPEAK', 'HIT'];
const CONDITIONS = ['PLAYER_HAS_ITEM', 'PLAYER_LACKS_ITEM', 'VARIABLE_EQUALS'];
const RESULTS = ['SHOW_TEXT', 'PLAY_ANIMATION', 'GIVE_ITEM', 'TAKE_ITEM', 'REMOVE_ITEM', 'MOVE_TO_ROOM', 'SET_VARIABLE', 'MOVE_SPRITE', 'SHOW_SPRITE', 'HIDE_SPRITE', 'INSTANTIATE_SPRITE'];

export default function RoomEventsPanel({ roomId, projectId }: { roomId: string; projectId: string }) {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [roomSprites, setRoomSprites] = useState<any[]>([]);
    const [projectItems, setProjectItems] = useState<any[]>([]);

    useEffect(() => {
        fetchEvents();
        fetchRoomSprites();
        fetchProjectItems();
    }, [roomId, projectId]);

    const fetchProjectItems = async () => {
        const res = await fetch(`/api/projects/${projectId}/items`);
        if (res.ok) setProjectItems(await res.json());
    };

    const fetchEvents = async () => {
        const res = await fetch(`/api/rooms/${roomId}/events`);
        if (res.ok) setEvents(await res.json());
    };

    const fetchRoomSprites = async () => {
        const res = await fetch(`/api/rooms/${roomId}`);
        if (res.ok) {
            const data = await res.json();
            setRoomSprites(data.sprites || []);
        }
    };

    const createEvent = async () => {
        const res = await fetch(`/api/rooms/${roomId}/events`, { method: 'POST' });
        if (res.ok) fetchEvents();
    };

    const updateEvent = async (id: string, data: any) => {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
        await fetch(`/api/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    };

    const deleteEvent = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/events/${id}`, { method: 'DELETE' });
        if (selectedEventId === id) setSelectedEventId(null);
        fetchEvents();
    };

    const activeEvent = events.find(e => e.id === selectedEventId);

    return (
        <div className="flex h-full">
            <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 text-white">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2"><Code size={18} /> Room Logic</h2>
                    <button onClick={createEvent} className="bg-blue-600 hover:bg-blue-700 w-6 h-6 rounded flex items-center justify-center">+</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {events.map((ev) => (
                        <div
                            key={ev.id}
                            onClick={() => setSelectedEventId(ev.id)}
                            className={`p-3 rounded-md cursor-pointer border flex justify-between items-center ${selectedEventId === ev.id ? 'bg-blue-900/40 border-blue-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
                        >
                            <div>
                                <div className="text-sm font-bold">{ev.name}</div>
                                <div className="text-xs text-gray-400 mt-1 uppercase">WHEN {ev.action} {ev.targetId || 'ANY'}</div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                        </div>
                    ))}
                    {events.length === 0 && <div className="p-4 text-center text-gray-500 text-sm">No rules yet.</div>}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto text-white p-4">
                {activeEvent ? (
                    <div className="w-full">
                        <h1 className="text-xl font-bold mb-4">
                            <input
                                className="bg-transparent border-b-2 border-transparent hover:border-gray-700 focus:border-blue-500 outline-none w-full"
                                value={activeEvent.name}
                                onChange={(e) => updateEvent(activeEvent.id, { name: e.target.value })}
                            />
                        </h1>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2 text-sm">TRIGGER</h3>
                            <div className="flex flex-col gap-2">
                                <div>
                                    <label className="text-[10px] text-gray-500 block">WHEN (Action)</label>
                                    <select
                                        className="w-full bg-gray-950 border border-gray-700 text-white rounded p-1 outline-none text-sm"
                                        value={activeEvent.action}
                                        onChange={(e) => updateEvent(activeEvent.id, { action: e.target.value })}
                                    >
                                        {ACTIONS.map(a => <option key={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 block">TARGET (ObjectId or Prefix)</label>
                                    <input
                                        className="w-full bg-gray-950 border border-gray-700 text-white rounded p-1 outline-none text-sm uppercase"
                                        value={activeEvent.targetId || ''}
                                        onChange={(e) => updateEvent(activeEvent.id, { targetId: e.target.value })}
                                        placeholder="e.g. DOOR"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-yellow-400 font-bold flex items-center gap-2 text-sm">IF (Conditions)</h3>
                                <button
                                    onClick={() => updateEvent(activeEvent.id, {
                                        conditions: [...activeEvent.conditions, { type: 'PLAYER_HAS_ITEM', targetId: '', value: '' }]
                                    })}
                                    className="bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-[10px]"
                                >+ Add Condition</button>
                            </div>

                            <div className="space-y-2">
                                {activeEvent.conditions.length === 0 && <div className="text-xs text-gray-500 italic">Always triggers (no conditions).</div>}
                                {activeEvent.conditions.map((cond: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 flex-col bg-gray-950 p-2 rounded border border-gray-800">
                                        <div className="flex gap-2 text-xs">
                                            <select
                                                className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none flex-1"
                                                value={cond.type}
                                                onChange={(e) => {
                                                    const newConds = [...activeEvent.conditions];
                                                    newConds[idx].type = e.target.value;
                                                    updateEvent(activeEvent.id, { conditions: newConds });
                                                }}
                                            >
                                                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                                            </select>
                                            <button
                                                onClick={() => {
                                                    const newConds = activeEvent.conditions.filter((_: any, i: number) => i !== idx);
                                                    updateEvent(activeEvent.id, { conditions: newConds });
                                                }}
                                                className="text-gray-500 hover:text-red-400 p-1"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <input
                                            className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-xs w-full"
                                            value={cond.targetId || ''}
                                            onChange={(e) => {
                                                const newConds = [...activeEvent.conditions];
                                                newConds[idx].targetId = e.target.value;
                                                updateEvent(activeEvent.id, { conditions: newConds });
                                            }}
                                            placeholder="Target"
                                        />
                                        <input
                                            className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-xs w-full"
                                            value={cond.value || ''}
                                            onChange={(e) => {
                                                const newConds = [...activeEvent.conditions];
                                                newConds[idx].value = e.target.value;
                                                updateEvent(activeEvent.id, { conditions: newConds });
                                            }}
                                            placeholder="Value"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-green-400 font-bold flex items-center gap-2 text-sm">THEN (Results)</h3>
                                <button
                                    onClick={() => updateEvent(activeEvent.id, {
                                        results: [...activeEvent.results, { type: 'SHOW_TEXT', targetId: '', value: '' }]
                                    })}
                                    className="bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-[10px]"
                                >+ Add Result</button>
                            </div>

                            <div className="space-y-2">
                                {activeEvent.results.length === 0 && <div className="text-xs text-gray-500 italic">No result defined.</div>}
                                {activeEvent.results.map((res: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 flex-col bg-gray-950 p-2 rounded border border-gray-800">
                                        <div className="flex gap-2 text-xs items-center">
                                            <ArrowRight size={12} className="text-green-500" />
                                            <select
                                                className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none flex-1"
                                                value={res.type}
                                                onChange={(e) => {
                                                    const newRes = [...activeEvent.results];
                                                    newRes[idx].type = e.target.value;
                                                    updateEvent(activeEvent.id, { results: newRes });
                                                }}
                                            >
                                                {RESULTS.map(c => <option key={c}>{c}</option>)}
                                            </select>
                                            <button
                                                onClick={() => {
                                                    const newRes = activeEvent.results.filter((_: any, i: number) => i !== idx);
                                                    updateEvent(activeEvent.id, { results: newRes });
                                                }}
                                                className="text-gray-500 hover:text-red-400 p-1"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        {res.type === 'INSTANTIATE_SPRITE' ? (
                                            <select
                                                className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-xs w-full"
                                                value={res.targetId || ''}
                                                onChange={(e) => {
                                                    const newRes = [...activeEvent.results];
                                                    newRes[idx].targetId = e.target.value;
                                                    updateEvent(activeEvent.id, { results: newRes });
                                                }}
                                            >
                                                <option value="">Select Template Sprite</option>
                                                {roomSprites.map(s => (
                                                    <option key={s.id} value={s.objectId || s.id}>{s.name} ({s.objectId || 'No ID'})</option>
                                                ))}
                                            </select>
                                        ) : (res.type === 'GIVE_ITEM' || res.type === 'REMOVE_ITEM' || res.type === 'TAKE_ITEM') ? (
                                            <select
                                                className="bg-gray-900 border-2 border-green-900/50 text-white rounded p-1 outline-none text-xs w-full"
                                                value={res.targetId || ''}
                                                onChange={(e) => {
                                                    const newRes = [...activeEvent.results];
                                                    newRes[idx].targetId = e.target.value;
                                                    updateEvent(activeEvent.id, { results: newRes });
                                                }}
                                            >
                                                <option value="">Select Item to {res.type === 'TAKE_ITEM' ? 'Pick Up' : 'Give'}</option>
                                                {projectItems.map((item: any) => (
                                                    <option key={item.id} value={item.id}>{item.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-xs w-full"
                                                value={res.targetId || ''}
                                                onChange={(e) => {
                                                    const newRes = [...activeEvent.results];
                                                    newRes[idx].targetId = e.target.value;
                                                    updateEvent(activeEvent.id, { results: newRes });
                                                }}
                                                placeholder="Target (Prefix or ObjectId)"
                                            />
                                        )}

                                        {res.type === 'INSTANTIATE_SPRITE' ? (
                                            <div className="grid grid-cols-3 gap-1">
                                                <div>
                                                    <label className="text-[9px] text-gray-500 uppercase">New ID</label>
                                                    <input
                                                        className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-[10px] w-full"
                                                        value={(res.value || '').split(':')[0] || ''}
                                                        onChange={(e) => {
                                                            const parts = (res.value || '').split(':');
                                                            parts[0] = e.target.value;
                                                            const newRes = [...activeEvent.results];
                                                            newRes[idx].value = parts.join(':');
                                                            updateEvent(activeEvent.id, { results: newRes });
                                                        }}
                                                        placeholder="NEW_ID"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] text-gray-500 uppercase">X</label>
                                                    <input
                                                        type="number"
                                                        className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-[10px] w-full"
                                                        value={(res.value || '').split(':')[1] || ''}
                                                        onChange={(e) => {
                                                            const parts = (res.value || '').split(':');
                                                            if (parts.length < 2) parts[0] = parts[0] || '';
                                                            parts[1] = e.target.value;
                                                            const newRes = [...activeEvent.results];
                                                            newRes[idx].value = parts.join(':');
                                                            updateEvent(activeEvent.id, { results: newRes });
                                                        }}
                                                        placeholder="X"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] text-gray-500 uppercase">Y</label>
                                                    <input
                                                        type="number"
                                                        className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-[10px] w-full"
                                                        value={(res.value || '').split(':')[2] || ''}
                                                        onChange={(e) => {
                                                            const parts = (res.value || '').split(':');
                                                            if (parts.length < 3) {
                                                                parts[0] = parts[0] || '';
                                                                parts[1] = parts[1] || '';
                                                            }
                                                            parts[2] = e.target.value;
                                                            const newRes = [...activeEvent.results];
                                                            newRes[idx].value = parts.join(':');
                                                            updateEvent(activeEvent.id, { results: newRes });
                                                        }}
                                                        placeholder="Y"
                                                    />
                                                </div>
                                            </div>
                                        ) : (res.type === 'SHOW_TEXT' || res.type === 'SET_VARIABLE' || res.type === 'MOVE_SPRITE') && (
                                            <textarea
                                                className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-xs w-full h-12 resize-none"
                                                value={res.value || ''}
                                                onChange={(e) => {
                                                    const newRes = [...activeEvent.results];
                                                    newRes[idx].value = e.target.value;
                                                    updateEvent(activeEvent.id, { results: newRes });
                                                }}
                                                placeholder={res.type === 'MOVE_SPRITE' ? "Coordinates (e.g. 150,200)" : "Text or value"}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl m-4 text-sm">
                        Select a rule.
                    </div>
                )}
            </div>
        </div>
    );
}
