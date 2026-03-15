import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
    const confirmLink = `${domain}/onboarding/verify?token=${token}`;

    if (!resend) {
        console.warn("⚠️ RESEND_API_KEY manquante. Email de vérification non envoyé.");
        console.log(`🔗 Lien de vérification pour ${name} (${email}) : ${confirmLink}`);
        return;
    }

    await resend.emails.send({
        from: 'Gynaeasy <onboarding@gynaeasy.com>',
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
};

export const sendCredentialsEmail = async (email: string, name: string, password: string) => {
    const loginLink = `${domain}/auth/login`;

    if (!resend) {
        console.warn("⚠️ RESEND_API_KEY manquante. Email d'identifiants non envoyé.");
        console.log(`🔑 Identifiants pour ${name} (${email}) : Pass: ${password}`);
        return;
    }

    await resend.emails.send({
        from: 'Gynaeasy <support@gynaeasy.com>',
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
};
