// Messages clients pré-rédigés — texte brut (\n), convertis en HTML
// à l'envoi par plainTextToHtml() côté index.html.
// Lookup côté appelant : MESSAGES[stepId] || MESSAGES.default
// Signature : (prenom, ref, stepLabel, progress) → string
const MESSAGES = {
  default: (prenom, ref, stepLabel, progress) => `Bonjour ${prenom},

Bonne nouvelle ! La commande NOTOX ${ref} est en cours — étape ${stepLabel} terminée (${progress}%).

On vous tient au courant de la suite !

À bientôt,
L'équipe NOTOX
www.notox.fr`,

  livraison: (prenom, ref) => `Bonjour ${prenom},

La planche est prête ! La commande NOTOX ${ref} est finalisée.

On revient vers vous rapidement pour organiser la livraison ou le retrait.

À bientôt,
L'équipe NOTOX
www.notox.fr`,
};
