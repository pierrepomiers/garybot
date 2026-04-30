// Messages clients pré-rédigés — texte brut (\n), convertis en HTML
// à l'envoi par plainTextToHtml() côté index.html.
// Lookup côté appelant : MESSAGES[stepId] || MESSAGES.default
// Signature : (prenom, ref, stepLabel, progress) → string
const MESSAGES = {
  default: (prenom, ref, stepLabel, progress) => `Bonjour ${prenom},

On a une bonne nouvelle !

La commande NOTOX ${ref} avance bien : on a réalisé ${progress}% du travail.

En ce moment, on s'occupe de l'étape de ${stepLabel}.

On se tient au courant de la suite !

À bientôt,

L'équipe NOTOX.`,

  livraison: (prenom, ref) => `Bonjour ${prenom},

La planche est prête ! La commande NOTOX ${ref} est terminée.

On se reparle très rapidement pour organiser la livraison ou le retrait à l'atelier.

À bientôt,

L'équipe NOTOX.`,
};

// Pendant anglais — même signatures, même format (string body).
// stepLabel reçu côté EN est déjà traduit par buildClientMessageDefaults().
const MESSAGES_EN = {
  default: (firstName, ref, stepLabel, progress) => `Hello ${firstName},

Good news from the workshop!

Your NOTOX order ${ref} is coming along nicely — we're now ${progress}% of the way through.

Right now, we're working on the ${stepLabel} of your board.

We'll keep you posted as things move forward!

Talk soon,

The NOTOX team 🤙`,

  livraison: (firstName, ref) => `Hello ${firstName},

Your board is ready! NOTOX order ${ref} is officially done.

We'll be in touch very soon to set up shipping or pickup at the workshop.

Talk soon,

The NOTOX team 🤙`,
};
