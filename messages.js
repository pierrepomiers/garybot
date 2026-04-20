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
