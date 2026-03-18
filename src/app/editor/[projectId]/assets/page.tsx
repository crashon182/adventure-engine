'use client';
import { useState, useEffect } from 'react';
import { ImageIcon, Music, FileImage, UploadCloud, Trash2 } from 'lucide-react';


type Asset = {
    id: string;
    name: string;
    type: string;
    url: string;
};

export default function AssetManager({ params }: { params: { projectId: string } }) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [assetName, setAssetName] = useState('');

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        const res = await fetch(`/api/projects/${params.projectId}/assets`);
        if (res.ok) setAssets(await res.json());
    };

    const handleDelete = async (assetId: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;

        try {
            const res = await fetch(`/api/assets/${assetId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (res.ok) {
                fetchAssets(); // Refresh list
            } else {
                alert(data.error || 'Failed to delete asset');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while deleting the asset');
        }
    };


    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !assetName) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', assetName);

        try {
            const res = await fetch(`/api/projects/${params.projectId}/assets`, {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                setFile(null);
                setAssetName('');
                fetchAssets();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-6">Asset Manager</h1>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 w-full max-w-2xl shrink-0 shadow-lg">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><UploadCloud /> Upload New Asset</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Asset Name</label>
                        <input
                            type="text"
                            value={assetName}
                            onChange={(e) => setAssetName(e.target.value)}
                            placeholder="e.g. Castle Background"
                            className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-white outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">File (Image or Audio)</label>
                        <input
                            type="file"
                            accept="image/*, audio/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={uploading || !file || !assetName}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-2 rounded-md font-medium transition-colors"
                    >
                        {uploading ? 'Uploading...' : 'Upload Asset'}
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {assets.map(asset => (
                        <div key={asset.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col group relative">
                            <div className="h-32 bg-gray-900 flex items-center justify-center relative">
                                {asset.type === 'image' ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={asset.url} alt={asset.name} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <Music size={40} className="text-gray-600" />
                                )}
                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs">
                                    {asset.type}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 bg-black/70 p-1.5 rounded-full absolute top-2 left-2 transition-all hover:scale-110 shadow-md backdrop-blur-sm"
                                    title="Delete Asset"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="p-3 text-sm truncate" title={asset.name}>
                                {asset.name}
                            </div>
                        </div>
                    ))}
                    {assets.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            No assets uploaded yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
