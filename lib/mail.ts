import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const domain = process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
    const confirmLink = `${domain}/onboarding/verify?token=${token}`;

    if (!resend) {
        console.warn("⚠️ RESEND_API_KEY manquante. Email de vérification non envoyé.");
        console.log(`🔗 Lien de vérification pour ${name} (${email}) : ${confirmLink}`);
        return;
    }

    try {
        await resend.emails.send({
            from: `Gynaeasy <${FROM_EMAIL}>`,
            to: email,
            subject: 'Vérifiez votre compte Gynaeasy',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                    <h1 style="color: #4f46e5;">Bienvenue sur Gynaeasy, Dr. ${name} !</h1>
                    <p>Merci de vous être inscrit sur notre plateforme. Pour finaliser votre inscription et soumettre votre dossier à l'administration, veuillez vérifier votre adresse email.</p>
                    <a href="${confirmLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Vérifier mon email</a>
                    <p style="margin-top: 24px; color: #64748b; font-size: 14px;">Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Resend error (Verification):", error);
        // On ne bloque pas si l'IA ou le dev est actif mais on logue
    }
};

export const sendCredentialsEmail = async (email: string, name: string, password: string) => {
    const loginLink = `${domain}/auth/login`;

    if (!resend) {
        console.warn("⚠️ RESEND_API_KEY manquante. Email d'identifiants non envoyé.");
        console.log(`🔑 Identifiants pour ${name} (${email}) : Pass: ${password}`);
        return;
    }

    try {
        await resend.emails.send({
            from: `Gynaeasy <${FROM_EMAIL}>`,
            to: email,
            subject: 'Votre compte Gynaeasy est actif !',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                    <h1 style="color: #ec4899;">Félicitations, Dr. ${name} !</h1>
                    <p>Votre inscription a été validée par notre équipe administrative. Votre cabinet est désormais prêt à être utilisé.</p>
                    
                    <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
                        <p style="margin: 0; font-size: 14px; color: #64748b;">Vos identifiants de connexion :</p>
                        <p style="margin: 8px 0 0 0; font-weight: bold;">Email : ${email}</p>
                        <p style="margin: 4px 0 0 0; font-weight: bold;">Mot de passe : <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
                    </div>

                    <p style="color: #ef4444; font-size: 13px;"><b>Important :</b> Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion dans les paramètres de votre profil.</p>

                    <a href="${loginLink}" style="display: inline-block; background-color: #ec4899; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Se connecter à Gynaeasy</a>
                </div>
            `
        });
    } catch (error) {
        console.error("Resend error (Credentials):", error);
    }
};

export const sendBookingNotificationEmail = async (email: string, patientName: string, doctorName: string, date: string, time: string) => {
    if (!resend) return;
    try {
        await resend.emails.send({
            from: `Gynaeasy <${FROM_EMAIL}>`,
            to: email,
            subject: 'Confirmation de votre rendez-vous - Gynaeasy',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                    <h1 style="color: #4f46e5;">Rendez-vous Confirmé</h1>
                    <p>Bonjour ${patientName},</p>
                    <p>Votre rendez-vous avec le <b>${doctorName}</b> est confirmé pour le :</p>
                    <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e293b;">${date} à ${time}</p>
                    </div>
                    <p style="color: #64748b; font-size: 14px;">Merci d'arriver 10 minutes à l'avance. En cas d'empêchement, merci de nous prévenir.</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Resend error (Booking Notification):", error);
    }
};

export const sendAccessRequestNotificationEmail = async (
    treatingDoctorEmail: string,
    treatingDoctorName: string,
    requestingDoctorName: string,
    patientName: string
) => {
    if (!resend) return;
    try {
        await resend.emails.send({
            from: `Gynaeasy <${FROM_EMAIL}>`,
            to: treatingDoctorEmail,
            subject: `Demande d'accès dossier patient - Gynaeasy`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                    <h1 style="color: #4f46e5;">Demande d'accès au dossier</h1>
                    <p>Bonjour Dr. ${treatingDoctorName},</p>
                    <p>Le <b>Dr. ${requestingDoctorName}</b> demande l'accès au dossier de votre patiente <b>${patientName}</b>.</p>
                    <p>Connectez-vous à Gynaeasy pour approuver ou refuser cette demande.</p>
                    <a href="${domain}/patients" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Voir la demande</a>
                    <p style="margin-top: 24px; color: #64748b; font-size: 14px;">Si vous n'êtes pas concerné(e), ignorez cet email.</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Resend error (Access Request):", error);
    }
};

export const sendCancellationNotificationEmail = async (email: string, patientName: string, doctorName: string, date: string, time: string) => {
    if (!resend) return;
    try {
        await resend.emails.send({
            from: `Gynaeasy <${FROM_EMAIL}>`,
            to: email,
            subject: 'Annulation de votre rendez-vous - Gynaeasy',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ef4444; border-radius: 12px; padding: 24px;">
                    <h1 style="color: #ef4444;">Rendez-vous Annulé</h1>
                    <p>Bonjour ${patientName},</p>
                    <p>Nous vous informons que votre rendez-vous prévu avec le <b>${doctorName}</b> le ${date} à ${time} a été annulé par le praticien en raison d'une indisponibilité.</p>
                    <p style="margin-top: 24px; font-weight: bold;">Nous vous prions de nous excuser pour ce désagrément.</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Resend error (Cancellation Notification):", error);
    }
};
