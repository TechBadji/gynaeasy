import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Styles pour notre ordonnance afin de garantir une impression propre et stricte
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Helvetica",
        fontSize: 11,
        lineHeight: 1.5,
        color: "#1e293b",
    },
    header: {
        marginBottom: 40,
        borderBottom: "2 solid #db2777", // pink-600
        paddingBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    doctorInfo: {
        width: "60%",
    },
    doctorName: {
        fontSize: 16,
        fontFamily: "Helvetica-Bold",
        color: "#db2777",
        marginBottom: 4,
    },
    doctorDetails: {
        color: "#475569",
        fontSize: 10,
    },
    dateInfo: {
        width: "35%",
        textAlign: "right",
        fontSize: 10,
    },
    patientSection: {
        marginBottom: 30,
        backgroundColor: "#f8fafc",
        padding: 15,
        borderRadius: 4,
    },
    patientName: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
        marginBottom: 4,
    },
    contentSection: {
        minHeight: 400,
    },
    title: {
        fontSize: 18,
        fontFamily: "Helvetica-Bold",
        textAlign: "center",
        marginBottom: 20,
        textDecoration: "underline",
    },
    medications: {
        marginLeft: 20,
        marginBottom: 10,
    },
    medItem: {
        marginBottom: 15,
    },
    medName: {
        fontFamily: "Helvetica-Bold",
    },
    footer: {
        position: "absolute",
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: "right",
    },
    signatureLine: {
        marginTop: 60,
        width: 150,
        borderTop: "1 solid #cbd5e1",
        alignSelf: "flex-end",
    },
});

type PrescriptionDocumentProps = {
    medecin: {
        nom: string;
        specialite: string;
        rpps: string;
        adresse: string;
        telephone: string;
    };
    patient: {
        nomComplet: string;
        dateNaissance?: string;
        age?: number;
        poids?: number;
    };
    date: string;
    prescriptions: Array<{ nom: string; posologie: string }>;
};

export const PrescriptionDocument = ({ medecin, patient, date, prescriptions }: PrescriptionDocumentProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* HEADER : Médecin & Date */}
            <View style={styles.header}>
                <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{medecin.nom}</Text>
                    <Text style={styles.doctorDetails}>{medecin.specialite}</Text>
                    <Text style={styles.doctorDetails}>{medecin.adresse}</Text>
                    <Text style={styles.doctorDetails}>Tél: {medecin.telephone}</Text>
                    <Text style={styles.doctorDetails}>N° RPPS: {medecin.rpps}</Text>
                </View>
                <View style={styles.dateInfo}>
                    <Text>Fait le {date}</Text>
                </View>
            </View>

            {/* INFO PATIENT */}
            <View style={styles.patientSection}>
                <Text style={styles.patientName}>{patient.nomComplet}</Text>
                {patient.dateNaissance && <Text>Né(e) le : {patient.dateNaissance}</Text>}
                {patient.age && <Text>Âge : {patient.age} ans</Text>}
                {patient.poids && <Text>Poids : {patient.poids} kg</Text>}
            </View>

            {/* CONTENU PRESCRIPTIONS */}
            <View style={styles.contentSection}>
                <Text style={styles.title}>ORDONNANCE</Text>

                <View style={styles.medications}>
                    {prescriptions.map((med, idx) => (
                        <View key={idx} style={styles.medItem}>
                            <Text style={styles.medName}>• {med.nom}</Text>
                            <Text style={{ marginLeft: 10, color: '#334155' }}>  - {med.posologie}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* FOOTER : Signature */}
            <View style={styles.footer}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Signature</Text>
                <View style={styles.signatureLine}></View>
            </View>

        </Page>
    </Document>
);
