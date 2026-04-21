// Utilitaires templates mails fournisseurs.
// La config réelle est dans Supabase (table fournisseurs). Ce fichier ne contient
// que des fallbacks et un remplaceur de placeholders.
(function () {
  function pad2(n) { return n < 10 ? "0" + n : "" + n; }

  function formatDate(d) {
    d = d || new Date();
    return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear();
  }

  function applyPlaceholders(template, ctx) {
    if (!template) return "";
    var map = {
      "{date}": ctx && ctx.date ? ctx.date : formatDate(),
      "{supplier_name}": (ctx && ctx.supplier_name) || "",
      "{order_ref}": (ctx && ctx.order_ref) || "",
      "{step_label}": (ctx && ctx.step_label) || "",
    };
    return String(template).replace(/\{date\}|\{supplier_name\}|\{order_ref\}|\{step_label\}/g, function (m) {
      return map[m] != null ? map[m] : m;
    });
  }

  window.SUPPLIER_TEMPLATES = {
    applyPlaceholders: applyPlaceholders,
    formatDate: formatDate,
    defaultSubject: "Commande NOTOX — {date}",
    defaultHeader: "Bonjour,\n\nVoici notre commande :",
    defaultFooter: "Merci,\nNOTOX",
  };
})();
