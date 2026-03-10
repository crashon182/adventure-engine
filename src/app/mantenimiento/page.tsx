import Image from "next/image";

export default function MaintenancePage() {
    // Aquí podemos utilizar process.env.MAINTENANCE_MESSAGE para que puedas cambiar el mensaje desde el archivo .env
    const customMessage =
        process.env.MAINTENANCE_MESSAGE ||
        "¡Estamos forjando un nuevo reino! El motor de aventuras regresará pronto con novedades espectaculares.";

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Luces de fondo generadas con Tailwind */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

            {/* Header section */}
            <div className="z-10 text-center max-w-3xl mb-12 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-sm">
                    Aventura en Mantenimiento
                </h1>
                <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
                    {customMessage}
                </p>
            </div>

            {/* Grid de Imágenes para generar expectativa */}
            <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
                {/* Preview 1: El editor de Entorno */}
                <div className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-300 hover:shadow-indigo-500/20 hover:border-indigo-500/50 hover:-translate-y-2">
                    <div className="aspect-video w-full relative">
                        <Image
                            src="/mantenimiento-1.png"
                            alt="Visual Designer Preview"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-6 right-4">
                        <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-1">Visual Designer</h3>
                        <p className="text-sm text-slate-300">Crea escenas y habitaciones espectaculares con interfaz drag {"&"} drop.</p>
                    </div>
                </div>

                {/* Preview 2: Logica de Eventos */}
                <div className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-300 hover:shadow-blue-500/20 hover:border-blue-500/50 hover:-translate-y-2 delay-100">
                    <div className="aspect-video w-full relative">
                        <Image
                            src="/mantenimiento-2.png"
                            alt="Event Logic Preview"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-6 right-4">
                        <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-1">Event Logic Maker</h3>
                        <p className="text-sm text-slate-300">Define interacciones, condiciones y resultados sin escribir una sola línea de código.</p>
                    </div>
                </div>

                {/* Preview 3: Interfaz Retro de Jugador */}
                <div className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-500/50 hover:-translate-y-2 delay-200">
                    <div className="aspect-video w-full relative">
                        <Image
                            src="/mantenimiento-3.png"
                            alt="Retro Player Preview"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-6 right-4">
                        <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-1">Retro Player Engine</h3>
                        <p className="text-sm text-slate-300">Disfruta la experiencia clásica de juegos "Point {"&"} Click" modernizada.</p>
                    </div>
                </div>
            </div>

            {/* Footer / Spinner decorativo */}
            <div className="z-10 mt-16 flex flex-col items-center opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-400 animate-spin mb-4" />
                <p className="text-xs text-slate-600 font-mono tracking-widest uppercase">Sistema Inicializando...</p>
            </div>

            {/* Agregando los keyframes de animación en Tailwind via style */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
        </div>
    );
}
