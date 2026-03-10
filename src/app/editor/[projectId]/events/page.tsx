'use client';
import { useState, useEffect } from 'react';
import { Code, Trash2, Plus, ArrowRight } from 'lucide-react';

const ACTIONS = ['MOVE', 'LOOK', 'TAKE', 'OPEN', 'CLOSE', 'USE', 'SPEAK', 'HIT'];
const CONDITIONS = ['PLAYER_HAS_ITEM', 'PLAYER_LACKS_ITEM', 'VARIABLE_EQUALS'];
const RESULTS = ['SHOW_TEXT', 'PLAY_ANIMATION', 'GIVE_ITEM', 'REMOVE_ITEM', 'MOVE_TO_ROOM', 'SET_VARIABLE', 'MOVE_SPRITE', 'SHOW_SPRITE', 'HIDE_SPRITE'];

export default function EventRules({ params }: { params: { projectId: string } }) {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        const res = await fetch(`/api/projects/${params.projectId}/events`);
        if (res.ok) {
            const data = await res.json();
            setEvents(data.filter((e: any) => !e.roomId));
        }
    };

    const createEvent = async () => {
        const res = await fetch(`/api/projects/${params.projectId}/events`, { method: 'POST' });
        if (res.ok) fetchEvents();
    };

    const updateEvent = async (id: string, data: any) => {
        // Optimistic local update
        setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));

        // Remote update
        await fetch(`/api/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        // fetchEvents();
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
                    <h2 className="font-bold flex items-center gap-2"><Code size={18} /> Logic Rules</h2>
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

            <div className="flex-1 bg-black p-8 overflow-y-auto text-white">
                {activeEvent ? (
                    <div className="max-w-3xl">
                        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-4">
                            <input
                                className="bg-transparent border-b-2 border-transparent hover:border-gray-700 focus:border-blue-500 outline-none"
                                value={activeEvent.name}
                                onChange={(e) => updateEvent(activeEvent.id, { name: e.target.value })}
                            />
                        </h1>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">TRIGGER</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 block mb-1">WHEN (Action)</label>
                                    <select
                                        className="w-full bg-gray-950 border border-gray-700 text-white rounded p-2 outline-none"
                                        value={activeEvent.action}
                                        onChange={(e) => updateEvent(activeEvent.id, { action: e.target.value })}
                                    >
                                        {ACTIONS.map(a => <option key={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 block mb-1">TARGET (ObjectId or Prefix)</label>
                                    <input
                                        className="w-full bg-gray-950 border border-gray-700 text-white rounded p-2 outline-none uppercase"
                                        value={activeEvent.targetId || ''}
                                        onChange={(e) => updateEvent(activeEvent.id, { targetId: e.target.value })}
                                        placeholder="e.g. DOOR"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-yellow-400 font-bold flex items-center gap-2">IF (Conditions)</h3>
                                <button
                                    onClick={() => updateEvent(activeEvent.id, {
                                        conditions: [...activeEvent.conditions, { type: 'PLAYER_HAS_ITEM', targetId: '', value: '' }]
                                    })}
                                    className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-xs"
                                >+ Add Condition</button>
                            </div>

                            <div className="space-y-3">
                                {activeEvent.conditions.length === 0 && <div className="text-sm text-gray-500 italic">Always triggers (no conditions).</div>}
                                {activeEvent.conditions.map((cond: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 bg-gray-950 p-3 rounded border border-gray-800">
                                        <span className="text-yellow-500/50 font-bold">AND</span>
                                        <select
                                            className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-sm w-48"
                                            value={cond.type}
                                            onChange={(e) => {
                                                const newConds = [...activeEvent.conditions];
                                                newConds[idx].type = e.target.value;
                                                updateEvent(activeEvent.id, { conditions: newConds });
                                            }}
                                        >
                                            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                        <input
                                            className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-sm flex-1 placeholder:text-gray-600"
                                            value={cond.targetId || ''}
                                            onChange={(e) => {
                                                const newConds = [...activeEvent.conditions];
                                                newConds[idx].targetId = e.target.value;
                                                updateEvent(activeEvent.id, { conditions: newConds });
                                            }}
                                            placeholder="Target (Item ID or Variable)"
                                        />
                                        <input
                                            className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-sm flex-1 placeholder:text-gray-600"
                                            value={cond.value || ''}
                                            onChange={(e) => {
                                                const newConds = [...activeEvent.conditions];
                                                newConds[idx].value = e.target.value;
                                                updateEvent(activeEvent.id, { conditions: newConds });
                                            }}
                                            placeholder="Value (e.g. true, 5, etc)"
                                        />
                                        <button
                                            onClick={() => {
                                                const newConds = activeEvent.conditions.filter((_: any, i: number) => i !== idx);
                                                updateEvent(activeEvent.id, { conditions: newConds });
                                            }}
                                            className="text-gray-500 hover:text-red-400 p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-green-400 font-bold flex items-center gap-2">THEN (Results)</h3>
                                <button
                                    onClick={() => updateEvent(activeEvent.id, {
                                        results: [...activeEvent.results, { type: 'SHOW_TEXT', targetId: '', value: '' }]
                                    })}
                                    className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-xs"
                                >+ Add Result</button>
                            </div>

                            <div className="space-y-3">
                                {activeEvent.results.length === 0 && <div className="text-sm text-gray-500 italic">No result defined.</div>}
                                {activeEvent.results.map((res: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 bg-gray-950 p-3 rounded border border-gray-800 items-start">
                                        <div className="mt-1"><ArrowRight size={14} className="text-green-500/50" /></div>
                                        <select
                                            className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-sm w-48"
                                            value={res.type}
                                            onChange={(e) => {
                                                const newRes = [...activeEvent.results];
                                                newRes[idx].type = e.target.value;
                                                updateEvent(activeEvent.id, { results: newRes });
                                            }}
                                        >
                                            {RESULTS.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <input
                                                className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-sm w-full placeholder:text-gray-600"
                                                value={res.targetId || ''}
                                                onChange={(e) => {
                                                    const newRes = [...activeEvent.results];
                                                    newRes[idx].targetId = e.target.value;
                                                    updateEvent(activeEvent.id, { results: newRes });
                                                }}
                                                placeholder="Target (Item ID, Room ID, etc)"
                                            />
                                            {(res.type === 'SHOW_TEXT' || res.type === 'SET_VARIABLE') && (
                                                <textarea
                                                    className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-sm w-full h-16 resize-none placeholder:text-gray-600"
                                                    value={res.value || ''}
                                                    onChange={(e) => {
                                                        const newRes = [...activeEvent.results];
                                                        newRes[idx].value = e.target.value;
                                                        updateEvent(activeEvent.id, { results: newRes });
                                                    }}
                                                    placeholder="Narrative text or variable value..."
                                                />
                                            )}
                                            {res.type === 'MOVE_SPRITE' && (
                                                <input
                                                    className="bg-gray-900 border border-gray-700 text-white rounded p-1 outline-none text-sm w-full placeholder:text-gray-600"
                                                    value={res.value || ''}
                                                    onChange={(e) => {
                                                        const newRes = [...activeEvent.results];
                                                        newRes[idx].value = e.target.value;
                                                        updateEvent(activeEvent.id, { results: newRes });
                                                    }}
                                                    placeholder="Coordinates (e.g. 150,200)"
                                                />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newRes = activeEvent.results.filter((_: any, i: number) => i !== idx);
                                                updateEvent(activeEvent.id, { results: newRes });
                                            }}
                                            className="text-gray-500 hover:text-red-400 p-1 mt-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl m-8">
                        Select or create an event rule to edit.
                    </div>
                )}
            </div>
        </div>
    );
}
