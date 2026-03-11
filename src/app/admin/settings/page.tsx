'use client';
import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Save, Clock, AlertTriangle, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                setMaintenanceMode(data.maintenanceMode);
                setMaintenanceMessage(data.maintenanceMessage || '');
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maintenanceMode, maintenanceMessage }),
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
            } else {
                setMessage({ type: 'error', text: 'Error al guardar la configuración.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error de red.' });
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
    );

    return (
        <div className="p-12 max-w-5xl mx-auto animate-in fade-in duration-500">
            <header className="mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 underline decoration-blue-600 decoration-4 underline-offset-8">
                    Configuración Global
                </h1>
                <p className="text-gray-400 mt-4">Controla el estado general de la plataforma y el acceso de los usuarios.</p>
            </header>

            <div className="grid gap-8">
                {/* Maintenance Section */}
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-gray-700/50 bg-gray-900/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
                                <AlertTriangle size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white leading-tight">Modo Mantenimiento</h2>
                                <p className="text-sm text-gray-500 font-medium">Redirige a los visitantes a una página de espera.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMaintenanceMode(!maintenanceMode)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 border ${maintenanceMode ? 'bg-amber-600 text-white border-amber-500 shadow-amber-600/20' : 'bg-gray-700 text-gray-400 border-gray-600'}`}
                        >
                            {maintenanceMode ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                            <span>{maintenanceMode ? 'ACTIVO' : 'INACTIVO'}</span>
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Mensaje de Mantenimiento</label>
                            <textarea
                                value={maintenanceMessage}
                                onChange={(e) => setMaintenanceMessage(e.target.value)}
                                className="w-full h-40 bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6 text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600 resize-none font-medium text-lg leading-relaxed"
                                placeholder="Escribe el mensaje que verán los usuarios..."
                            />
                        </div>

                        <div className="bg-blue-600/10 border border-blue-600/20 p-6 rounded-2xl flex items-start gap-4">
                            <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                                <Clock size={22} className="shrink-0" />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-100 mb-1">Nota Importante</h4>
                                <p className="text-sm text-blue-100/60 leading-relaxed font-medium">
                                    Los usuarios con rol **ADMIN** podrán seguir viendo y utilizando el sitio normalmente incluso cuando el modo mantenimiento esté activado. Esto permite realizar pruebas antes de publicar cambios.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between bg-gray-800/20 p-6 rounded-3xl border border-gray-700/30">
                    <div className="flex-1">
                        {message.text && (
                            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold animate-in slide-in-from-left-4 duration-300 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-10 py-4 rounded-2xl font-extrabold transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:shadow-none"
                    >
                        {saving ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <> <Save size={24} /> GUARDAR CONFIGURACIÓN </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
