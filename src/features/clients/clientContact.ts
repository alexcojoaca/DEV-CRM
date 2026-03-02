/** Deschide dialer-ul pentru apel (prefix +40 pentru România dacă lipsește) */
export function openCall(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length >= 10) digits = digits.slice(1);
  if (!digits.startsWith("40") && digits.length >= 9) digits = "40" + digits;
  window.location.href = `tel:+${digits}`;
}

/** Deschide WhatsApp cu număr și opțional text precompletat */
export function openWhatsApp(phone: string, text?: string) {
  const clean = phone.replace(/^\+/, "").replace(/\D/g, "");
  const url = text
    ? `https://wa.me/${clean}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${clean}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
