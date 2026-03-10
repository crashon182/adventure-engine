'use client';
import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Save, Clock, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
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

    if (loading) return <div className="p-8 text-gray-400">Cargando configuración...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Configuración del Proyecto</h1>
                <p className="text-gray-400">Gestiona el estado público de tu motor de aventuras.</p>
            </header>

            <div className="grid gap-6">
                {/* Maintenance Section */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">Modo Mantenimiento</h2>
                                <p className="text-sm text-gray-400">Controla si los usuarios pueden acceder al juego.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setMaintenanceMode(!maintenanceMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${maintenanceMode ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        >
                            {maintenanceMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                            <span className="font-semibold">{maintenanceMode ? 'ACTIVO' : 'INACTIVO'}</span>
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <label className="block">
                            <span className="text-sm font-medium text-gray-300 block mb-2">Mensaje de Mantenimiento</span>
                            <textarea
                                value={maintenanceMessage}
                                onChange={(e) => setMaintenanceMessage(e.target.value)}
                                className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Escribe el mensaje que verán los usuarios..."
                            />
                        </label>

                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
                            <Clock size={20} className="text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-100/70">
                                Al activar el modo mantenimiento, todos los visitantes (excepto los que usen el editor) serán redirigidos a la página de espera con las imágenes de expectativa.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4">
                    {message.text && (
                        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/20"
                    >
                        {saving ? 'Guardando...' : <> <Save size={20} /> Guardar Cambios </>}
                    </button>
                </div>
            </div>
        </div>
    );
}
