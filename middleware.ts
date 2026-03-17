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

        // Gestion de l'accès à la facturation ou aux statistiques
        if (path.startsWith("/statistiques") && token?.role === "SECRETAIRE") {
            // Optionnel: On peut renvoyer une erreur 403 ou rediriger avec un message d'erreur
            return NextResponse.redirect(new URL("/dashboard?error=access_denied", req.url));
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
