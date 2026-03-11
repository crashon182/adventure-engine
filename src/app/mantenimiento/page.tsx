import Image from "next/image";

export default function MaintenancePage() {
    const customMessage =
        process.env.MAINTENANCE_MESSAGE ||
        "We are forging a new realm! The adventure engine will return soon with spectacular new features.";

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Background lights */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

            {/* Header section */}
            <div className="z-10 text-center max-w-3xl mb-16 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-sm">
                    Adventure Under Maintenance
                </h1>
                <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
                    {customMessage}
                </p>
            </div>

            {/* Image Grid */}
            <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-7xl opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
                {/* Preview 1: Visual Designer */}
                <div className="group flex flex-col gap-6 transition-all duration-300 hover:-translate-y-2">
                    <div className="aspect-video w-full relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group-hover:shadow-indigo-500/20 group-hover:border-indigo-500/50 transition-all duration-500">
                        <Image
                            src="/mantenimiento-1.png"
                            alt="Visual Designer Preview"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                    <div className="px-2">
                        <h3 className="text-lg font-bold text-indigo-300 uppercase tracking-wider mb-2">Visual Designer</h3>
                        <p className="text-slate-400 leading-relaxed">Create spectacular scenes and rooms with an intuitive drag {"&"} drop interface.</p>
                    </div>
                </div>

                {/* Preview 2: Event Logic */}
                <div className="group flex flex-col gap-6 transition-all duration-300 hover:-translate-y-2 delay-100">
                    <div className="aspect-video w-full relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group-hover:shadow-blue-500/20 group-hover:border-blue-500/50 transition-all duration-500">
                        <Image
                            src="/mantenimiento-2.png"
                            alt="Event Logic Preview"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                    <div className="px-2">
                        <h3 className="text-lg font-bold text-blue-300 uppercase tracking-wider mb-2">Event Logic Maker</h3>
                        <p className="text-slate-400 leading-relaxed">Define interactions, conditions, and results without writing a single line of code.</p>
                    </div>
                </div>

                {/* Preview 3: Retro Player */}
                <div className="group flex flex-col gap-6 transition-all duration-300 hover:-translate-y-2 delay-200">
                    <div className="aspect-video w-full relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group-hover:shadow-purple-500/20 group-hover:border-purple-500/50 transition-all duration-500">
                        <Image
                            src="/mantenimiento-3.png"
                            alt="Retro Player Preview"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                    <div className="px-2">
                        <h3 className="text-lg font-bold text-purple-300 uppercase tracking-wider mb-2">Retro Player Engine</h3>
                        <p className="text-slate-400 leading-relaxed">Enjoy the classic "Point {"&"} Click" gaming experience modernized for today.</p>
                    </div>
                </div>
            </div>

            {/* Footer space */}
            <div className="mt-20" />

            {/* Keyframe animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
        </div>
    );
}
