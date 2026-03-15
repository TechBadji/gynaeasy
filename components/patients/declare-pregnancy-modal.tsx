"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { declareGrossesse } from "@/app/actions/patient";
import toast from "react-hot-toast";

interface DeclarePregnancyModalProps {
    patientId: string;
}

export function DeclarePregnancyModal({ patientId }: DeclarePregnancyModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [ddr, setDdr] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await declareGrossesse(patientId, ddr ? ddr : null);

            if (result.success) {
                toast.success("Grossesse déclarée avec succès");
                setOpen(false);
                setDdr("");
            } else {
                toast.error(result.message || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur inattendue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-xs font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full cursor-pointer hover:bg-pink-100">
                    + Déclarer grossesse
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Déclarer une nouvelle grossesse</DialogTitle>
                        <DialogDescription>
                            Entrez la date de début de grossesse (Date des Dernières Règles) si elle est connue.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="ddr" className="text-right">
                                DDR
                            </Label>
                            <Input
                                id="ddr"
                                type="date"
                                value={ddr}
                                onChange={(e) => setDdr(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-pink-600 hover:bg-pink-700">
                            {isLoading ? "Enregistrement..." : "Déclarer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
