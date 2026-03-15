import { EXAMENS_GROSSESSE, calculerSA, getProchainExamen } from "@/lib/medical-calculations";

export default function PregnancyTimeline({ ddr }: { ddr: Date | null }) {
    if (!ddr) return <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">Aucune grossesse en cours</div>;

    const { sa, jours } = calculerSA(ddr);
    const prochain = getProchainExamen(ddr);

    return (
        <div className="space-y-6">
            <div className="p-4 bg-pink-50 border border-pink-100 rounded-lg flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-pink-900">Terme actuel : {sa} SA + {jours} jours</h3>
                    <p className="text-sm text-pink-700">DDR : {ddr.toLocaleDateString('fr-FR')}</p>
                </div>
                {prochain && prochain.status !== "A_VENIR" && (
                    <div className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">
                        Action requise !
                    </div>
                )}
            </div>

            <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                {EXAMENS_GROSSESSE.map((examen, i) => {
                    const isPassed = sa > examen.saMax;
                    const isCurrent = sa >= examen.saMin && sa <= examen.saMax;

                    return (
                        <div key={i} className={`relative pl-6 ${isPassed ? 'opacity-50' : ''}`}>
                            <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${isCurrent ? 'bg-pink-500 border-pink-200 ring-4 ring-pink-100' :
                                    isPassed ? 'bg-slate-400 border-slate-100' : 'bg-white border-slate-300'
                                }`} />
                            <div className="font-medium text-slate-900">{examen.nom}</div>
                            <div className="text-xs text-slate-500 font-medium">Entre {examen.saMin} et {examen.saMax} SA</div>
                            <div className="text-sm text-slate-600 mt-1">{examen.description}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
