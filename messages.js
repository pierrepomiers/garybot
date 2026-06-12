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

  remerciement: (prenom, ref) => `Bonjour ${prenom},

Merci pour la commande et la confiance accordée à NOTOX !

La planche NOTOX ${ref} va maintenant prendre forme dans notre atelier. Pendant la fabrication, des photos seront envoyées régulièrement pour suivre l'avancement du travail.

On met tout en œuvre pour que cette nouvelle planche accompagne longtemps de belles sessions.

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

  remerciement: (firstName, ref) => `Hello ${firstName},

Thank you for your order and for trusting NOTOX!

Your NOTOX board ${ref} is now about to take shape in our workshop. During the build, we'll send photos regularly so you can follow the work as it progresses.

We're putting all our care into making this new board a companion for many great sessions to come.

Talk soon,

The NOTOX team 🤙`,

  livraison: (firstName, ref) => `Hello ${firstName},

Your board is ready! NOTOX order ${ref} is officially done.

We'll be in touch very soon to set up shipping or pickup at the workshop.

Talk soon,

The NOTOX team 🤙`,
};
