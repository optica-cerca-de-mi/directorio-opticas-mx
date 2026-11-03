"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context"; // Ajusta la ruta si tu contexto se llama diferente
import { Loader2, CreditCard } from "lucide-react";

interface CheckoutButtonProps {
  plan: "premium" | "premium-plus";
  opticaId: string;
  userEmail: string;
  userId: string;
}

export default function CheckoutButton({ plan, opticaId, userEmail, userId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          opticaId,
          userEmail,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la sesión de pago");
      }

      // Redirigir al usuario a la página de pago de Stripe
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió la URL de checkout");
      }
    } catch (error: any) {
      console.error("Error en checkout:", error);
      alert(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const planName = plan === "premium" ? "Premium" : "Premium+";
  const planPrice = plan === "premium" ? "$199" : "$599";

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Contratar Plan {planName} ({planPrice} MXN)
        </>
      )}
    </button>
  );
}