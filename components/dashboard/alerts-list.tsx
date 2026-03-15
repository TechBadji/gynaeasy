import { AlertCircle, FileText, Syringe } from "lucide-react";

export default function AlertsList() {
    const alerts = [
        { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", title: "Test HGPO à prévoir", patient: "Mme Rousseau E." },
        { icon: Syringe, color: "text-blue-500", bg: "bg-blue-50", title: "Vaccin Coqueluche (T3)", patient: "Mme Petit L." },
        { icon: FileText, color: "text-orange-500", bg: "bg-orange-50", title: "Résultats labo reçus", patient: "Mme Blanc C." },
    ];

    return (
        <div className="space-y-4">
            {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`p-2 rounded-full ${alert.bg}`}>
                        <alert.icon className={`h-4 w-4 ${alert.color}`} />
                    </div>
                    <div>
                        <div className="text-sm font-medium">{alert.title}</div>
                        <div className="text-xs text-slate-500">Pour {alert.patient}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
