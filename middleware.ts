import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Protection des routes basé sur les rôles
        // Par exemple, bloquer la zone admin aux non-admins
        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Force le changement de mot de passe si requis (pour les médecins/secrétaires)
        if (token?.mustChangePassword && token?.role !== "ADMIN" && path !== "/change-password") {
            return NextResponse.redirect(new URL("/change-password", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // Exiger qu'un token soit présent (utilisateur authentifié) pour toutes les routes correspondant au matcher
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    // Protéger toutes les routes sauf l'authentification, l'onboarding, le booking public et les assets
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|auth|onboarding|booking|p|$).*)"],
};
