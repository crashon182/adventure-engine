import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, ArrowRight, Trash2 } from 'lucide-react';

interface EdgePropertiesPanelProps {
    edge: any;
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
    items: any[];
}

export default function EdgePropertiesPanel({ edge, onUpdate, onDelete, items }: EdgePropertiesPanelProps) {
    const [formData, setFormData] = useState({
        direction: edge.data?.direction || '',
        locked: edge.data?.locked || false,
        requiredItemId: edge.data?.requiredItemId || '',
        scriptEvent: edge.data?.scriptEvent || '',
    });

    useEffect(() => {
        setFormData({
            direction: edge.data?.direction || '',
            locked: edge.data?.locked || false,
            requiredItemId: edge.data?.requiredItemId || '',
            scriptEvent: edge.data?.scriptEvent || '',
        });
    }, [edge.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        const newFormData = { ...formData, [name]: val };
        setFormData(newFormData);
        onUpdate(edge.id, newFormData);
    };

    const directions = ['north', 'south', 'east', 'west', 'up', 'down'];

    return (
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Connection Properties</h3>
                <button onClick={() => onDelete(edge.id)} className="p-1.5 hover:bg-red-900/30 text-red-400 rounded transition-colors" title="Delete Connection">
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="p-4 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Direction</label>
                    <select
                        name="direction"
                        value={formData.direction}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 capitalize"
                    >
                        <option value="">None / Automatic</option>
                        {directions.map(dir => (
                            <option key={dir} value={dir}>{dir}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                        {formData.locked ? <Lock size={18} className="text-yellow-500" /> : <Unlock size={18} className="text-green-500" />}
                        <span className="text-sm font-medium">Locked</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="locked"
                            checked={formData.locked}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Required Item</label>
                    <select
                        name="requiredItemId"
                        value={formData.requiredItemId}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">None</option>
                        {items.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Trigger Event Script (Advanced)</label>
                    <textarea
                        name="scriptEvent"
                        value={formData.scriptEvent}
                        onChange={handleChange}
                        placeholder="e.g. WHEN_ENTER -> PLAY_SOUND door_creak"
                        rows={4}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none font-mono"
                    />
                </div>
            </div>

            <div className="mt-auto p-4 bg-gray-800/50 border-t border-gray-700">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ArrowRight size={12} />
                    <span>Connects two rooms for navigation.</span>
                </div>
            </div>
        </div>
    );
}
