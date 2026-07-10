import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Conditions Générales d'Utilisation — Gynaeasy",
    description: "CGU de la plateforme Gynaeasy, logiciel de gestion de cabinet médical.",
};

export default function CguPage() {
    const lastUpdate = "10 juillet 2026";

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-violet-600 font-black text-lg">
                        <Activity className="h-5 w-5" />
                        Gynaeasy
                    </Link>
                    <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors font-medium">
                        <ArrowLeft className="h-4 w-4" />
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Title */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 mb-4">
                        <span className="text-xs font-black text-violet-600 uppercase tracking-widest">Document légal</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">
                        Conditions Générales d&apos;Utilisation
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Dernière mise à jour : {lastUpdate} — Version 1.0
                    </p>
                </div>

                <div className="space-y-8 text-slate-700 leading-relaxed">

                    {/* Article 1 */}
                    <Section num="1" title="Objet et champ d'application">
                        <p>
                            Les présentes Conditions Générales d&apos;Utilisation (ci-après «&nbsp;CGU&nbsp;») régissent l&apos;accès et l&apos;utilisation
                            de la plateforme <strong>Gynaeasy</strong>, logiciel de gestion de cabinet médical en mode SaaS (Software as a Service),
                            édité par <strong>Digitalmatis</strong> (ci-après «&nbsp;l&apos;Éditeur&nbsp;»), dont le siège social est situé à Dakar, Sénégal.
                        </p>
                        <p className="mt-3">
                            L&apos;accès à la plateforme implique l&apos;acceptation pleine et entière des présentes CGU.
                            Tout professionnel de santé (ci-après «&nbsp;l&apos;Utilisateur&nbsp;») qui s&apos;inscrit ou utilise Gynaeasy s&apos;engage
                            à respecter ces conditions.
                        </p>
                    </Section>

                    {/* Article 2 */}
                    <Section num="2" title="Description du service">
                        <p>Gynaeasy est une plateforme numérique destinée aux professionnels de santé, principalement les gynécologues-obstétriciens et sages-femmes. Elle propose notamment :</p>
                        <ul className="mt-3 space-y-1.5 list-none">
                            {[
                                "Gestion des dossiers patients (antécédents, consultations, imagerie, grossesses)",
                                "Agenda et prise de rendez-vous en ligne",
                                "Facturation et encaissements (espèces, mobile money, Wave)",
                                "Rappels SMS et WhatsApp automatiques",
                                "Assistant IA d'aide au diagnostic et à la prise de rendez-vous",
                                "Communications et broadcast SMS",
                                "Gestion du stock et de l'inventaire médical",
                                "Statistiques et tableaux de bord",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-sm">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-sm bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <strong>Important :</strong> Les fonctionnalités d&apos;aide à la décision médicale (IA diagnostique) sont fournies à titre
                            indicatif uniquement. Elles ne se substituent en aucun cas au jugement clinique du professionnel de santé.
                            L&apos;Éditeur décline toute responsabilité quant aux décisions médicales prises sur la base de ces suggestions.
                        </p>
                    </Section>

                    {/* Article 3 */}
                    <Section num="3" title="Inscription et accès au service">
                        <p>L&apos;accès à Gynaeasy est réservé aux professionnels de santé disposant d&apos;un numéro d&apos;inscription valide à l&apos;Ordre des Médecins du Sénégal ou équivalent régional.</p>
                        <p className="mt-3">Pour s&apos;inscrire, l&apos;Utilisateur doit :</p>
                        <ol className="mt-2 space-y-1.5 list-decimal list-inside text-sm">
                            <li>Renseigner ses informations professionnelles exactes et véridiques</li>
                            <li>Vérifier son adresse email via le lien envoyé lors de l&apos;inscription</li>
                            <li>Attendre la validation de son compte par l&apos;administrateur Gynaeasy</li>
                        </ol>
                        <p className="mt-3">
                            L&apos;Utilisateur est seul responsable de la confidentialité de ses identifiants de connexion.
                            Il s&apos;engage à ne pas partager son compte et à notifier immédiatement l&apos;Éditeur de toute
                            utilisation non autorisée.
                        </p>
                    </Section>

                    {/* Article 4 */}
                    <Section num="4" title="Protection des données personnelles et médicales">
                        <p>
                            Gynaeasy traite des données à caractère personnel et des données de santé, qui constituent des catégories
                            particulièrement sensibles au sens de la loi sénégalaise n°2008-12 du 25 janvier 2008 sur la protection
                            des données à caractère personnel et des directives de la Commission de Protection des Données Personnelles (CDP).
                        </p>
                        <div className="mt-4 space-y-3">
                            <SubSection title="4.1 Données collectées">
                                <p className="text-sm">L&apos;Éditeur collecte les données nécessaires au fonctionnement du service : informations d&apos;identité et coordonnées du praticien, données administratives et médicales des patients saisies par le praticien.</p>
                            </SubSection>
                            <SubSection title="4.2 Finalités du traitement">
                                <p className="text-sm">Les données sont utilisées exclusivement pour : la fourniture du service, l&apos;envoi de rappels SMS/email aux patients, la facturation, et l&apos;amélioration du service. Elles ne sont jamais vendues ni cédées à des tiers à des fins commerciales.</p>
                            </SubSection>
                            <SubSection title="4.3 Sécurité des données">
                                <p className="text-sm">Les données sont chiffrées en AES-256 au repos et transitent via protocole TLS. Les sauvegardes sont réalisées quotidiennement. L&apos;accès aux données médicales est strictement limité au praticien traitant.</p>
                            </SubSection>
                            <SubSection title="4.4 Droits des personnes concernées">
                                <p className="text-sm">Conformément à la loi CDP, tout patient dispose d&apos;un droit d&apos;accès, de rectification et de suppression de ses données. Ces demandes sont à adresser au praticien responsable du dossier.</p>
                            </SubSection>
                            <SubSection title="4.5 Conservation des données">
                                <p className="text-sm">Les données médicales sont conservées pendant la durée légale applicable au dossier médical (10 ans minimum à compter de la dernière consultation). En cas de résiliation, l&apos;Utilisateur peut exporter ses données dans les 30 jours suivant la résiliation.</p>
                            </SubSection>
                        </div>
                    </Section>

                    {/* Article 5 */}
                    <Section num="5" title="Responsabilités">
                        <div className="space-y-3">
                            <SubSection title="5.1 Responsabilité de l'Éditeur">
                                <p className="text-sm">
                                    L&apos;Éditeur s&apos;engage à maintenir la disponibilité du service avec un objectif de 99% de disponibilité mensuelle
                                    (hors maintenances planifiées). En cas d&apos;interruption, l&apos;Éditeur informera les Utilisateurs dans les meilleurs délais.
                                    L&apos;Éditeur ne peut être tenu responsable de pertes de données résultant d&apos;une faute de l&apos;Utilisateur.
                                </p>
                            </SubSection>
                            <SubSection title="5.2 Responsabilité de l'Utilisateur">
                                <p className="text-sm">
                                    L&apos;Utilisateur est seul responsable des données qu&apos;il saisit dans la plateforme, de leur exactitude,
                                    et du respect du secret médical vis-à-vis de ses patients. Il est responsable de tout usage fait
                                    de son compte. Les décisions médicales restent sous l&apos;entière responsabilité du praticien.
                                </p>
                            </SubSection>
                        </div>
                    </Section>

                    {/* Article 6 */}
                    <Section num="6" title="Tarification et abonnements">
                        <p>
                            L&apos;accès à Gynaeasy est proposé sous forme d&apos;abonnement mensuel ou annuel selon les offres en vigueur
                            affichées sur la plateforme (plans Solo, Pro, Clinique). Les tarifs sont exprimés en Francs CFA (FCFA).
                        </p>
                        <p className="mt-3">
                            Le paiement est réalisable par mobile money (Wave, Orange Money) ou espèces via l&apos;administrateur.
                            L&apos;abonnement est renouvelable selon les modalités choisies lors de la souscription.
                        </p>
                        <p className="mt-3">
                            L&apos;Éditeur se réserve le droit de modifier ses tarifs avec un préavis de <strong>30 jours</strong>.
                            La poursuite de l&apos;utilisation du service après modification vaut acceptation des nouveaux tarifs.
                        </p>
                    </Section>

                    {/* Article 7 */}
                    <Section num="7" title="Résiliation">
                        <p>
                            L&apos;Utilisateur peut résilier son abonnement à tout moment depuis son espace «&nbsp;Mon Abonnement&nbsp;».
                            La résiliation prend effet à la fin de la période d&apos;abonnement en cours. Aucun remboursement n&apos;est
                            effectué pour la période restante.
                        </p>
                        <p className="mt-3">
                            L&apos;Éditeur se réserve le droit de suspendre ou résilier un compte en cas de violation des présentes CGU,
                            de non-paiement ou d&apos;utilisation frauduleuse, après mise en demeure restée sans réponse sous 48 heures.
                        </p>
                        <p className="mt-3">
                            À la résiliation, l&apos;Utilisateur dispose de <strong>30 jours</strong> pour exporter ses données.
                            Passé ce délai, les données sont supprimées de façon sécurisée.
                        </p>
                    </Section>

                    {/* Article 8 */}
                    <Section num="8" title="Propriété intellectuelle">
                        <p>
                            La plateforme Gynaeasy, son code source, ses interfaces, ses algorithmes d&apos;intelligence artificielle et
                            l&apos;ensemble de ses composants sont la propriété exclusive de Digitalmatis et sont protégés par le droit
                            de la propriété intellectuelle applicable au Sénégal.
                        </p>
                        <p className="mt-3">
                            L&apos;Utilisateur dispose d&apos;un droit d&apos;usage personnel, non cessible et non exclusif du logiciel.
                            Toute reproduction, modification, diffusion ou exploitation commerciale est interdite sans autorisation écrite préalable.
                        </p>
                    </Section>

                    {/* Article 9 */}
                    <Section num="9" title="Loi applicable et juridiction compétente">
                        <p>
                            Les présentes CGU sont soumises au <strong>droit sénégalais</strong>, notamment à la loi n°2008-12 du 25 janvier 2008
                            sur la protection des données personnelles et aux textes de l&apos;UEMOA applicables au commerce électronique.
                        </p>
                        <p className="mt-3">
                            En cas de litige, les parties s&apos;engagent à rechercher une solution amiable dans un délai de 30 jours.
                            À défaut, le litige sera soumis à la compétence exclusive des <strong>juridictions de Dakar</strong>.
                        </p>
                    </Section>

                    {/* Article 10 */}
                    <Section num="10" title="Contact">
                        <p>Pour toute question relative aux présentes CGU, à la protection des données ou au service :</p>
                        <div className="mt-3 bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-1 text-sm">
                            <p><strong>Digitalmatis</strong></p>
                            <p>Dakar, Sénégal</p>
                            <p>Email : <a href="mailto:contact@digitalmatis.com" className="text-violet-600 hover:underline">contact@digitalmatis.com</a></p>
                            <p>Site : <a href="https://gynaeasy.digitalmatis.com" className="text-violet-600 hover:underline">gynaeasy.digitalmatis.com</a></p>
                        </div>
                    </Section>

                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                    <p>© {new Date().getFullYear()} Gynaeasy / Digitalmatis — Tous droits réservés</p>
                    <div className="flex items-center gap-4">
                        <Link href="/(protected)/confidentialite" className="hover:text-violet-600 transition-colors">Politique de confidentialité</Link>
                        <Link href="/" className="hover:text-violet-600 transition-colors">Accueil</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
    return (
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-3">
                <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-violet-600 text-white text-xs font-black flex items-center justify-center">
                    {num}
                </span>
                {title}
            </h2>
            <div className="text-sm leading-relaxed text-slate-600">{children}</div>
        </section>
    );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">{title}</h3>
            <div className="text-slate-600">{children}</div>
        </div>
    );
}
