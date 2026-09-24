AXA ASSURANCE

Profil transitaire

1. Menu

Le profil transitaire comprend les menus suivants :

Tableau de bord

Contrats

N° contrat

Libellé

Montant

Échéance

Opérations

Dossier ORBUS

2. Profils

Les profils prévus sont :

Agent transitaire : rattaché à un souscripteur.

CAD : superviseur de l'agent transitaire rattaché à un
souscripteur.

Agent assureur : AXA.

Superviseur

Admin

3. Workflow

Le processus de demande de cotation suit les étapes suivantes :

Demande de cotation par l'agent transitaire

Rapatrier un dossier ORBUS.

Choisir l'un de ses contrats.

Choisir les polices d'assurance.

Définir les spécificités de la demande :

Description

Date de début

Date de fin

Joindre les documents attendus.

Traitement par l'agent assureur

L'agent assureur reçoit la demande.

Il peut :

demander des compléments ;

effectuer une cotation en précisant le montant coté pour
chaque police d'assurance.

Retour au souscripteur

L'agent assureur renvoie la demande au souscripteur :

Agent transitaire

CAD

Le souscripteur doit procéder à l'acceptation.

Acceptation

En cas d'acceptation, les montants sont mis à jour.

L'opération est liée au contrat choisi.

Contrat final

L'agent assureur envoie le scan du contrat au souscripteur.

Le système peut également générer le contrat.

4. Structure d'un contrat

Champs

Champ                               Description

Numéro                          Numéro du contrat

Souscripteur                    Souscripteur associé au contrat

Libellé                         Libellé du contrat

Montant total                   Montant total du contrat

Échéance                        Date d'échéance du contrat

Liste des polices d'assurance     Polices pouvant être utilisées avec
éligibles                         le contrat

Liste des opérations            Opérations liées au contrat

Encours                         Montant actuellement engagé

Solde                           Montant restant disponible

Contrat                         Pièce jointe du contrat

Calcul du solde

Solde = Montant total -- Encours

5. Structure d'un souscripteur

Champs

Champ                               Description

NINEA                           Identifiant du souscripteur
Raison sociale                  Nom officiel de l'entreprise
Adresse                         Adresse du souscripteur
Représentants                   Représentants du souscripteur
Compte / Profil : Agent         Compte de l'agent
Compte / Profil : Superviseur   Compte du superviseur

6. Structure d'une liste de polices d'assurance

Champs

Champ                  Description

Code police        Code de la police d'assurance
Libellé            Libellé de la police
Pièces attendues   Documents nécessaires pour la police

6.1 Exemples de polices

Type de contrat /       Objet / couverture      Intérêt pour le
police                                          transitaire

Police d'assurance    Couvre les dommages     Protège contre les
responsabilité civile   causés aux clients ou   erreurs, omissions,
professionnelle (RC     aux tiers dans le cadre fautes professionnelles
Pro)                  de l'activité           ou négligences.
professionnelle du
transitaire.

Police responsabilité Couvre la               Couvre notamment les
civile du               responsabilité du       conséquences d'une
commissionnaire de      transitaire lorsqu'il   mauvaise organisation
transport             agit comme              ou d'un manquement
commissionnaire et      contractuel.
organise le transport.

Police responsabilité Couvre les dommages aux Pertinent lorsque le
du transporteur       marchandises lorsque le transitaire prend
transitaire intervient  directement en charge
également comme         le transport.
transporteur.

Police d'assurance    Couvre les pertes ou    Permet de protéger les
marchandises            dommages subis par les  marchandises confiées
transportées /          marchandises pendant le au transitaire.
facultés              transport maritime,
aérien, routier ou
multimodal.

Police Tous Risques   Offre une couverture    Très utilisée pour les
Transport             étendue des risques de  marchandises à forte
perte ou d'avarie des   valeur.
marchandises pendant le
transport.

Police FAP / FAP      Couverture spécifique   Utilisée dans certaines
sauf                  des risques maritimes,  opérations de transport
notamment selon les     maritime.
conditions prévues au
contrat.

Police d'abonnement / Couvre automatiquement  Adaptée aux
police flottante      plusieurs expéditions   transitaires ou
successives déclarées à importateurs réalisant
l'assureur.             régulièrement des
opérations.

Police au voyage    Couvre une expédition   Adaptée à une opération
ou un trajet déterminé. ponctuelle.

Police annuelle /     Définit les conditions  Permet de gérer de
contrat-cadre         générales de couverture manière permanente les
pour une période        opérations du
donnée, généralement    transitaire.
avec déclaration des
opérations.

Assurance             Couvre les dommages     Complément de la RC
responsabilité civile   causés à des tiers dans professionnelle.
exploitation          le cadre de
l'exploitation de
l'entreprise.

Assurance des biens   Couvre les marchandises Importante pour les
confiés / marchandises  appartenant aux clients marchandises stockées
en dépôt              lorsqu'elles sont       en magasin ou entrepôt.
temporairement sous la
garde du transitaire.

Assurance entrepôt /  Couvre les risques liés Incendie, vol, dégâts
magasin sous douane   aux marchandises        des eaux, etc., selon
stockées dans les       les garanties.
installations du
transitaire.

Assurance risques     Garantit certaines      Peut intervenir dans
douaniers / garantie    obligations financières les mécanismes de
douanière             ou douanières liées aux transit et de régimes
opérations effectuées   douaniers.
pour le compte des
clients.

Assurance crédit /    Protège contre certains Peut sécuriser
garantie financière   risques d'impayés ou    certaines relations
obligations financières commerciales.
selon le montage
contractuel.

7. Structure d'une opération

Champs

Champ                               Description

Numéro opération                Numéro unique de l'opération

Souscripteur                    Souscripteur associé à l'opération

Libellé opération               Libellé de l'opération

Dossier AXA Assurance                   Dossier AXA Assurance associé

Contrat lié                     Contrat utilisé pour l'opération

Polices associées               Polices d'assurance associées à
l'opération, avec leur détail

Montant                         Montant de l'opération

Statut                          État actuel de l'opération


Modules de l’espace Transitaire:
1. Tableau de bord
Vue globale de l'activité du transitaire
Demandes de cotation en cours
Cotations reçues
Opérations en cours
Contrats actifs
Notifications et actions à traiter
2. Dossiers AXA Assurance
Liste des dossiers AXA Assurance
Recherche d'un dossier
Consultation du détail d'un dossier
Rapatriement d'un dossier AXA Assurance
Utilisation d'un dossier pour créer une demande de cotation

Le dossier AXA Assurance constitue le point de départ du workflow de cotation.

3. Contrats
Liste des contrats du souscripteur
Numéro du contrat
Libellé
Montant total
Échéance
Encours
Solde
Polices d'assurance éligibles
Opérations rattachées
Consultation de la pièce jointe du contrat

Le document définit précisément ces informations dans la structure d'un contrat.

4. Opérations
Liste des opérations
Numéro de l'opération
Libellé
Dossier AXA Assurance associé
Contrat lié
Polices associées
Montant
Statut
Consultation du détail de l'opération

Ces éléments correspondent directement à la structure d'une opération donnée dans le brief.

5. Demande de cotation

C'est le workflow principal du portail.

Le transitaire :

Rapatrie un dossier AXA Assurance
Sélectionne un contrat
Sélectionne les polices d'assurance
Définit les spécificités de l'opération
Description
Date de début
Date de fin
Joint les documents attendus
Soumet la demande de cotation

6. Suivi des cotations

Après l'envoi, le transitaire doit pouvoir suivre la réponse de l'assureur.

Demande envoyée
Demande en cours de traitement
Compléments demandés
Cotation reçue
Montant coté pour chaque police
Acceptation de la cotation

L'assureur peut soit demander des compléments, soit effectuer la cotation avec un montant pour chaque police.

7. Contrat final

Après acceptation :

Mise à jour des montants
Liaison de l'opération avec le contrat sélectionné
Réception du scan du contrat
Consultation du contrat
Téléchargement du document

Le brief précise également que le système pourrait générer le contrat.

8. Notifications

Pour le POC, je garderais un module léger permettant notamment d'indiquer :

Nouvelle demande traitée
Complément demandé
Cotation disponible
Cotation à accepter
Contrat disponible
9. Profil
Informations de l'agent transitaire
Souscripteur auquel il est rattaché
Informations du compte

Le brief précise que l'Agent transitaire est rattaché à un souscripteur.

Pour le POC, je garderais finalement 6 modules visibles

Dashboard
Dossiers AXA Assurance
Contrats
Opérations
Cotations
Notifications

Et dans le header : Profil / compte.

Le bouton « Nouvelle demande de cotation » peut être particulièrement visible dans le Dashboard et dans Dossiers AXA Assurance, puisqu'il constitue le parcours métier central.