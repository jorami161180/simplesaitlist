import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// JWT_PRIVATE_KEY should be set in the environment variables (e.g., .env.local or Convex dashboard)

const ResendProvider = {
    id: "resend",
    type: "email" as const,
    name: "Resend",
    from: "onboarding@resend.dev",
    maxAge: 24 * 60 * 60,
    options: {},
    async sendVerificationRequest({ identifier: to, url }: any) {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "SimpleWaitlist <onboarding@resend.dev>",
                to,
                subject: `Tu enlace de acceso a SimpleWaitlist`,
                html: `
                    <div style="background-color: #0a0a0a; color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
                        <div style="max-width: 480px; margin: 0 auto; background-color: #141414; border: 1px solid #262626; border-radius: 24px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
                            <div style="display: inline-block; background-color: #3b82f6; width: 48px; height: 48px; border-radius: 12px; margin-bottom: 24px; line-height: 48px; color: white; font-size: 24px;">⚡</div>
                            <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 16px 0; color: #f5f5f5; letter-spacing: -0.02em;">Inicia sesión con un clic</h1>
                            <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3; margin: 0 0 32px 0;">Pulsa el botón de abajo para acceder de forma segura a tu cuenta de SimpleWaitlist. El enlace caducará pronto.</p>
                            <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 12px; transition: all 0.2s ease;">Entrar a SimpleWaitlist</a>
                            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #262626;">
                                <p style="font-size: 12px; color: #525252; margin: 0;">Si no solicitaste este enlace, puedes ignorar este correo de forma segura.</p>
                            </div>
                        </div>
                        <p style="font-size: 12px; color: #404040; margin-top: 24px;">SimpleWaitlist &bull; Potenciado por AI</p>
                    </div>
                `,
            }),
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Resend API error:", errorText);
            throw new Error("Error al enviar el email de verificación.");
        }
    },
};

export const { auth, signIn, signOut, store } = convexAuth({
    providers: [
        ResendProvider,
        Password,
    ],
});
