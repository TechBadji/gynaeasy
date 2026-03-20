import { MessageSquare, Phone, Mail, Send, Globe, MapPin } from "lucide-react";

export default function ContactSupportPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="text-center space-y-4">
                <span className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em] bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100">Nous sommes là</span>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight">Contactez le Support Gynaeasy</h1>
                <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto italic">
                    Une question technique ? Un besoin spécifique pour votre cabinet ? Notre équipe dédiée vous répond sous 24h ouvrées.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden shadow-pink-100/30">
                    <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Send className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Envoyez un message</h2>
                        </div>
                    </div>
                    <form className="p-10 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Sujet de votre demande</label>
                                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all">
                                    <option>Assistance Technique</option>
                                    <option>Question Facturation</option>
                                    <option>Demande de Fonctionnalité</option>
                                    <option>Partenariat</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Urgence</label>
                                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                    <button className="flex-1 py-2 text-xs font-black text-slate-500 rounded-xl hover:bg-white hover:shadow-sm transition-all uppercase">Normale</button>
                                    <button className="flex-1 py-2 text-xs font-black text-pink-600 bg-white shadow-sm rounded-xl border border-pink-100 uppercase uppercase">Haute</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Message</label>
                            <textarea
                                rows={6}
                                placeholder="Détaillez votre besoin ici..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-[2.5rem] py-6 px-8 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-300"
                            />
                        </div>

                        <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3">
                            <Send className="h-4 w-4" />
                            Envoyer ma demande au support
                        </button>
                    </form>
                </div>

                <div className="space-y-8 h-full">
                    <div className="p-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-[3rem] text-white shadow-2xl shadow-indigo-900/30 flex flex-col justify-between h-full min-h-[500px]">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black leading-tight">Canaux de support directs</h3>
                                <p className="text-indigo-300 text-sm font-medium">Réponses immédiates pendant les heures d'ouverture (9h - 18h).</p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-5 group">
                                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-indigo-900 transition-all duration-300">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">WhatsApp / Appel</p>
                                        <p className="text-xl font-black">+221 77 123 45 67</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 group">
                                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-indigo-900 transition-all duration-300">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Email</p>
                                        <p className="text-xl font-black">support@gynaeasy.com</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-5 group">
                                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-indigo-900 transition-all duration-300">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Siège Social</p>
                                        <p className="text-xl font-black">Dakar, Sénégal</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 border-t border-white/10 mt-12">
                             <div className="flex items-center gap-4">
                                 <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
                                 <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">Support en ligne • Dakar</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
