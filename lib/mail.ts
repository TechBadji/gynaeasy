import nodemailer from 'nodemailer';

const domain = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@gynaeasy.com';

function createTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

async function sendMail(to: string, subject: string, html: string) {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn("⚠️ SMTP non configuré. Email non envoyé.");
        console.log(`📧 Destinataire: ${to} | Sujet: ${subject}`);
        return;
    }
    await transporter.sendMail({ from: `Gynaeasy <${FROM_EMAIL}>`, to, subject, html });
}

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
    const confirmLink = `${domain}/onboarding/verify?token=${token}`;
    if (!process.env.SMTP_USER) {
        console.warn("⚠️ SMTP_USER manquant. Email de vérification non envoyé.");
        console.log(`🔗 Lien de vérification pour ${name} (${email}) : ${confirmLink}`);
        return;
    }
    await sendMail(email, 'Vérifiez votre compte Gynaeasy', `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h1 style="color: #4f46e5;">Bienvenue sur Gynaeasy, Dr. ${name} !</h1>
            <p>Merci de vous être inscrit sur notre plateforme. Pour finaliser votre inscription, veuillez vérifier votre adresse email.</p>
            <a href="${confirmLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Vérifier mon email</a>
            <p style="margin-top: 24px; color: #64748b; font-size: 14px;">Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
        </div>
    `);
};

export const sendCredentialsEmail = async (email: string, name: string, password: string) => {
    const loginLink = `${domain}/auth/login`;
    if (!process.env.SMTP_USER) {
        console.warn("⚠️ SMTP_USER manquant. Email d'identifiants non envoyé.");
        console.log(`🔑 Identifiants pour ${name} (${email}) : Pass: ${password}`);
        return;
    }
    await sendMail(email, 'Votre compte Gynaeasy est actif !', `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h1 style="color: #ec4899;">Félicitations, Dr. ${name} !</h1>
            <p>Votre inscription a été validée par notre équipe administrative. Votre cabinet est désormais prêt.</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">Vos identifiants de connexion :</p>
                <p style="margin: 8px 0 0 0; font-weight: bold;">Email : ${email}</p>
                <p style="margin: 4px 0 0 0; font-weight: bold;">Mot de passe : <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
            </div>
            <p style="color: #ef4444; font-size: 13px;"><b>Important :</b> Changez votre mot de passe dès votre première connexion.</p>
            <a href="${loginLink}" style="display: inline-block; background-color: #ec4899; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Se connecter à Gynaeasy</a>
        </div>
    `);
};

export const sendBookingNotificationEmail = async (email: string, patientName: string, doctorName: string, date: string, time: string) => {
    await sendMail(email, 'Confirmation de votre rendez-vous - Gynaeasy', `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h1 style="color: #4f46e5;">Rendez-vous Confirmé</h1>
            <p>Bonjour ${patientName},</p>
            <p>Votre rendez-vous avec le <b>${doctorName}</b> est confirmé pour le :</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e293b;">${date} à ${time}</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">Merci d'arriver 10 minutes à l'avance.</p>
        </div>
    `);
};

export const sendAccessRequestNotificationEmail = async (
    treatingDoctorEmail: string,
    treatingDoctorName: string,
    requestingDoctorName: string,
    patientName: string
) => {
    await sendMail(treatingDoctorEmail, `Demande d'accès dossier patient - Gynaeasy`, `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h1 style="color: #4f46e5;">Demande d'accès au dossier</h1>
            <p>Bonjour Dr. ${treatingDoctorName},</p>
            <p>Le <b>Dr. ${requestingDoctorName}</b> demande l'accès au dossier de votre patiente <b>${patientName}</b>.</p>
            <a href="${domain}/patients" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Voir la demande</a>
        </div>
    `);
};

export const sendCancellationNotificationEmail = async (email: string, patientName: string, doctorName: string, date: string, time: string) => {
    await sendMail(email, 'Annulation de votre rendez-vous - Gynaeasy', `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ef4444; border-radius: 12px; padding: 24px;">
            <h1 style="color: #ef4444;">Rendez-vous Annulé</h1>
            <p>Bonjour ${patientName},</p>
            <p>Votre rendez-vous avec le <b>${doctorName}</b> le ${date} à ${time} a été annulé.</p>
            <p style="margin-top: 24px; font-weight: bold;">Nous vous prions de nous excuser pour ce désagrément.</p>
        </div>
    `);
};
