'use client';
import { useState, useEffect } from 'react';
import { Layers, Trash2 } from 'lucide-react';

export default function InventoryManager({ params }: { params: { projectId: string } }) {
    const [items, setItems] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);

    useEffect(() => {
        fetchItems();
        fetchAssets();
    }, []);

    const fetchItems = async () => {
        const res = await fetch(`/api/projects/${params.projectId}/items`);
        if (res.ok) setItems(await res.json());
    };

    const fetchAssets = async () => {
        const res = await fetch(`/api/projects/${params.projectId}/assets`);
        if (res.ok) setAssets(await res.json());
    };

    const createItem = async (file?: File) => {
        let iconId = null;
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name);
            formData.append('type', 'image');

            const resAsset = await fetch(`/api/projects/${params.projectId}/assets`, {
                method: 'POST',
                body: formData
            });
            if (resAsset.ok) {
                const asset = await resAsset.json();
                iconId = asset.id;
                fetchAssets();
            }
        }

        await fetch(`/api/projects/${params.projectId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: file ? file.name.split('.')[0] : 'New Item',
                description: 'What is this?',
                iconId: iconId
            })
        });
        fetchItems();
    };

    const updateItem = async (id: string, data: any) => {
        await fetch(`/api/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        fetchItems();
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/items/${id}`, { method: 'DELETE' });
        fetchItems();
    };

    const handleUpload = async (itemId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('type', 'image');

        const res = await fetch(`/api/projects/${params.projectId}/assets`, {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const asset = await res.json();
            await updateItem(itemId, { iconId: asset.id });
            fetchAssets();
        }
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2"><Layers /> Global Inventory</h1>
                <div className="flex gap-2">
                    <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 font-medium rounded-md cursor-pointer transition-colors flex items-center gap-2">
                        + Add Item with Image
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) createItem(file);
                            }}
                        />
                    </label>
                    <button onClick={() => createItem()} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 font-medium rounded-md transition-colors">
                        + Empty Item
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max">
                {items.map(item => (
                    <div key={item.id} className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex gap-4">
                        <div className="w-24 h-24 bg-gray-900 border border-gray-700 flex-shrink-0 flex items-center justify-center relative rounded-md overflow-hidden group">
                            {item.icon ? (
                                <img src={item.icon.url} alt={item.name} className="w-full h-full object-contain p-2" />
                            ) : (
                                <Layers size={32} className="text-gray-600" />
                            )}
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                <span className="text-[10px] uppercase font-bold text-white">Upload</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUpload(item.id, file);
                                    }}
                                />
                            </label>
                        </div>

                        <div className="flex-1 flex flex-col gap-2">
                            <input
                                className="bg-transparent text-lg font-bold outline-none border-b border-gray-600 focus:border-blue-400 w-full"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, { name: e.target.value })}
                            />
                            <textarea
                                className="bg-gray-900 border border-gray-700 text-sm px-2 py-1 rounded outline-none w-full h-16 resize-none"
                                value={item.description}
                                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                placeholder="Item description..."
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-48">
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Icon Asset</div>
                            <div className="flex gap-1">
                                <select
                                    className="bg-gray-900 border border-gray-700 px-2 py-1 rounded text-sm flex-1 outline-none"
                                    value={item.iconId || ''}
                                    onChange={(e) => updateItem(item.id, { iconId: e.target.value || null })}
                                >
                                    <option value="">None</option>
                                    {assets.filter(a => a.type === 'image').map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={() => deleteItem(item.id)}
                                className="mt-auto flex items-center justify-center gap-1 text-red-500/50 hover:text-red-400 hover:bg-red-400/10 py-1 rounded transition-colors text-xs font-bold uppercase"
                            >
                                <Trash2 size={12} /> Delete Item
                            </button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        No items in the global inventory yet.
                    </div>
                )}
            </div>
        </div>
    );
}
