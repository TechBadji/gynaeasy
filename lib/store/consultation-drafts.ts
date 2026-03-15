import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ConsultationDraft = {
    patientId: string;
    typeRdv: string;
    motif: string;
    notes: string;
    actes: Array<{ id: string; quantite: number }>;
    lastUpdatedAt: number;
};

interface DraftStore {
    drafts: Record<string, ConsultationDraft>;
    saveDraft: (id: string, draft: ConsultationDraft) => void;
    removeDraft: (id: string) => void;
    getDraft: (id: string) => ConsultationDraft | undefined;
}

export const useDraftStore = create<DraftStore>()(
    persist(
        (set, get) => ({
            drafts: {},
            saveDraft: (id, draft) =>
                set((state) => ({
                    drafts: { ...state.drafts, [id]: { ...draft, lastUpdatedAt: Date.now() } }
                })),
            removeDraft: (id) =>
                set((state) => {
                    const newDrafts = { ...state.drafts };
                    delete newDrafts[id];
                    return { drafts: newDrafts };
                }),
            getDraft: (id) => get().drafts[id],
        }),
        {
            name: 'gynaeasy-consultation-drafts', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // use localStorage to persist offline
        }
    )
);
