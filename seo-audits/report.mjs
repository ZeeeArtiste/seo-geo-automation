import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  VerticalAlign, PageNumber,
} from 'docx';
import fs from 'fs';

const NAVY='1B2A4A', BLUE='2563EB', GREEN='16A34A', AMBER='D97706', RED='DC2626',
      ORANGE='EA580C', GRAY='F8F9FA', BORDER='E2E8F0', DARK='1E293B',
      LIGHTBG='EFF6FF', GREENBG='F0FDF4', WHITE='FFFFFF', LBLUE='93C5FD', MUTED='94A3B8';
const F='Arial', W=9360, DATE='20 septembre 2026', DOMAIN='aspirob.com';
const SCORES={SEO:7,GEO:8,AEO:7};
const colorFor=s=>s>=8?GREEN:s>=5?AMBER:RED;
const statusFor=s=>s>=8?'Strong':s>=5?'On Track':'Needs Work';

const noBorder={top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}};
const thin={style:BorderStyle.SINGLE,size:4,color:BORDER};
const cellBorders={top:thin,bottom:thin,left:thin,right:thin};

const P=(t,o={})=>new Paragraph({alignment:o.align,spacing:{before:o.before||0,after:o.after??120},
  shading:o.shading?{fill:o.shading}:undefined,
  children:[new TextRun({text:t,font:F,size:(o.size||11)*2,bold:o.bold,italics:o.italic,color:o.color||DARK})]});
const H=(t,lvl)=>new Paragraph({heading:lvl,spacing:{before:lvl===HeadingLevel.HEADING_1?360:280,after:160},
  children:[new TextRun({text:t,font:F,size:lvl===HeadingLevel.HEADING_1?48:lvl===HeadingLevel.HEADING_2?36:28,bold:true,color:NAVY})]});
const cell=(t,o={})=>new TableCell({shading:o.fill?{fill:o.fill}:undefined,borders:o.borders||cellBorders,
  width:o.width?{size:o.width,type:WidthType.DXA}:undefined,verticalAlign:VerticalAlign.CENTER,
  margins:{top:o.pad||90,bottom:o.pad||90,left:110,right:110},
  children:(Array.isArray(t)?t:[t]).map(x=>typeof x==='string'
    ? new Paragraph({alignment:o.align,spacing:{after:0},children:[new TextRun({text:x,font:F,size:(o.size||10)*2,bold:o.bold,italics:o.italic,color:o.color||DARK})]})
    : x)});
const table=(rows,widths)=>new Table({width:{size:W,type:WidthType.DXA},columnWidths:widths,rows});

const STATUS={Good:GREEN,'Needs Attention':AMBER,Missing:RED};
const findings=(items,widths=[2600,5200,1560])=>table([
  new TableRow({tableHeader:true,children:['Signal','Constat','Statut'].map((h,i)=>
    cell(h,{fill:NAVY,color:WHITE,bold:true,size:9,width:widths[i],align:i===2?AlignmentType.CENTER:undefined}))}),
  ...items.map(([sig,find,st],i)=>new TableRow({children:[
    cell(sig,{fill:i%2?GRAY:WHITE,bold:true,width:widths[0]}),
    cell(find,{fill:i%2?GRAY:WHITE,width:widths[1]}),
    cell(st,{fill:STATUS[st],color:WHITE,bold:true,align:AlignmentType.CENTER,size:9,width:widths[2]}),
  ]})),
],widths);

// ───────────────────────────── COVER
const navyP=(h)=>new Paragraph({shading:{fill:NAVY},spacing:{after:h},children:[new TextRun({text:'',font:F})]});
const coverCell=(dim)=>{const s=SCORES[dim];return new TableCell({shading:{fill:colorFor(s)},borders:noBorder,
  margins:{top:260,bottom:260,left:80,right:80},verticalAlign:VerticalAlign.CENTER,children:[
  new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:dim,font:F,size:20,bold:true,color:WHITE})]}),
  new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:String(s),font:F,size:72,bold:true,color:WHITE})]}),
  new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[new TextRun({text:statusFor(s),font:F,size:18,italics:true,color:WHITE})]}),
]});};

const cover=[
  navyP(1800),
  new Paragraph({alignment:AlignmentType.CENTER,shading:{fill:NAVY},spacing:{after:120},children:[new TextRun({text:DOMAIN,font:F,size:72,bold:true,color:WHITE})]}),
  new Paragraph({alignment:AlignmentType.CENTER,shading:{fill:NAVY},spacing:{after:120},children:[new TextRun({text:'SEO / GEO / AEO Audit Report',font:F,size:36,color:LBLUE})]}),
  new Paragraph({alignment:AlignmentType.CENTER,shading:{fill:NAVY},spacing:{after:400},children:[new TextRun({text:'AUDIT COMPLET',font:F,size:22,color:WHITE})]}),
  new Table({width:{size:W,type:WidthType.DXA},borders:noBorder,rows:[new TableRow({children:[coverCell('SEO'),coverCell('GEO'),coverCell('AEO')]})]}),
  navyP(1800),
  new Paragraph({alignment:AlignmentType.CENTER,shading:{fill:NAVY},spacing:{after:40},children:[new TextRun({text:DATE,font:F,size:18,color:MUTED})]}),
  new Paragraph({alignment:AlignmentType.CENTER,shading:{fill:NAVY},spacing:{after:0},children:[new TextRun({text:'Claude Skill and Plugin by Alex Labat',font:F,size:18,color:MUTED})]}),
];

// ───────────────────────────── BODY
const body=[];
body.push(H('Executive Summary',HeadingLevel.HEADING_1));
body.push(new Table({width:{size:W,type:WidthType.DXA},rows:[new TableRow({children:[cell(
  "aspirob.com est un site jeune — publié le 18 septembre 2026 — dont les fondations techniques sont nettement au-dessus de la moyenne pour son âge : HTTPS, canoniques auto-référencées sur les 10 pages, un H1 unique partout, un balisage structuré riche (BlogPosting, BreadcrumbList, FAQPage, Organization, WebSite) et des articles de 1 434 à 1 650 mots. Sa force distinctive est le GEO : un fichier llms.txt qui déclare la méthode éditoriale et expose les cinq réponses directes, doublé d'une autorisation explicite de GPTBot, ClaudeBot, PerplexityBot et Google-Extended. C'est rare et c'est exactement ce que les moteurs génératifs consomment. Le défaut le plus urgent est trivial à corriger et coûteux à laisser : robots.txt déclare Sitemap: https://example.com/sitemap-index.xml, un reste de gabarit qui empêche la découverte du sitemap par cette voie. Viennent ensuite cinq titres d'articles de 88 à 118 caractères, tous tronqués en résultats de recherche, et deux pages de catégorie quasi vides. L'opportunité principale : les articles portent déjà des blocs de réponse directe, des tableaux comparatifs et une FAQ balisée — il suffit de reformuler les intertitres en questions pour viser les extraits enrichis.",
  {borders:cellBorders,fill:LIGHTBG,size:11,pad:200,width:W})]})]}));
body.push(P('',{after:200}));

const sw=[2000,1200,1900,4260];
body.push(table([
  new TableRow({tableHeader:true,children:['Dimension','Score','Statut','Enseignement clé'].map((h,i)=>cell(h,{fill:NAVY,color:WHITE,bold:true,size:9,width:sw[i]}))}),
  ...[['SEO',7,'On Track','Fondations saines ; titres trop longs et pages de catégorie trop maigres.'],
      ['GEO',8,'Strong','llms.txt et méthode déclarée ; manquent les profils sociaux et les sources citées.'],
      ['AEO',7,'On Track','Réponses directes et FAQ balisées ; intertitres rarement formulés en questions.']]
    .map(([d,s,st,k],i)=>new TableRow({children:[
      cell(d,{bold:true,fill:i%2?GRAY:WHITE,width:sw[0]}),
      cell(`${s}/10`,{fill:colorFor(s),color:WHITE,bold:true,align:AlignmentType.CENTER,width:sw[1]}),
      cell(st,{fill:i%2?GRAY:WHITE,width:sw[2]}),
      cell(k,{fill:i%2?GRAY:WHITE,width:sw[3]}),
    ]})),
  new TableRow({children:[cell('Combiné',{bold:true,fill:NAVY,color:WHITE,width:sw[0]}),
    cell('22/30',{bold:true,fill:NAVY,color:WHITE,align:AlignmentType.CENTER,width:sw[1]}),
    cell('',{fill:NAVY,width:sw[2]}),cell('',{fill:NAVY,width:sw[3]})]}),
],sw));

body.push(H('Pages Audited',HeadingLevel.HEADING_1));
const pw=[4400,1900,3060];
body.push(table([
  new TableRow({tableHeader:true,children:['URL','Type','Notes'].map((h,i)=>cell(h,{fill:NAVY,color:WHITE,bold:true,size:9,width:pw[i]}))}),
  ...[['/','Accueil','303 mots, 4 H2, 6 images — 5 vignettes en alt vide'],
      ['/articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/','Comparatif','1 650 mots, 9 H2, 2 tableaux, titre 88 car.'],
      ['/articles/aspirateur-robot-poils-animaux-chat-chien/','Comparatif','1 454 mots, 7 images, 19 listes, titre 115 car.'],
      ['/articles/aspirateur-robot-animaux-erreurs-eviter/','Guide','1 498 mots, 8 H2, aucun H2 en question'],
      ['/articles/navigation-lidar-aspirateur-robot-explication/','Guide','1 434 mots, 3 H2 sur 6 en question — le meilleur du site'],
      ['/articles/navigation-lidar-camera-aspirateur-robot-differences/','Guide','1 444 mots, titre 118 car. — le plus long'],
      ['/comparatifs/','Catégorie','101 mots, 0 H2, méta-description 52 car.'],
      ['/guides/','Catégorie','114 mots, 0 H2, méta-description 47 car.'],
      ['/mentions-legales/','Légal','390 mots, 7 H2, méthode éditoriale incluse'],
      ['/confidentialite/','Légal','290 mots, 5 H2'],
     ].map(([u,t,n],i)=>new TableRow({children:[
       cell(u,{fill:i%2?GRAY:WHITE,size:9,width:pw[0]}),
       cell(t,{fill:i%2?GRAY:WHITE,size:9,width:pw[1]}),
       cell(n,{fill:i%2?GRAY:WHITE,size:9,width:pw[2]})]})),
],pw));

body.push(H('SEO Analysis — 7/10',HeadingLevel.HEADING_1));
body.push(H('Technical On-Page',HeadingLevel.HEADING_2));
body.push(findings([
  ['Balise title','Présente sur les 10 pages, mais les 5 articles font 88 à 118 caractères — au-delà des ~60 affichés par Google. Le plus long : « Navigation LiDAR vs caméra : comment votre aspirateur robot \'voit\' votre maison (et pourquoi ça change tout) ». Les pages de catégorie tombent à l\'inverse à 16 et 21 caractères.','Needs Attention'],
  ['Méta-description','Bonne sur les articles (134-168 car.). Trop courte sur /guides/ (47) et /comparatifs/ (52) : la moitié de l\'espace disponible est perdue.','Needs Attention'],
  ['Hiérarchie des titres','Un H1 unique sur chacune des 10 pages. Articles bien structurés (6 à 9 H2). Les deux pages de catégorie n\'ont aucun H2.','Needs Attention'],
  ['Structure d\'URL','Propre, lisible, porteuse de mots-clés, sans paramètre ni mot vide. Exemple : /articles/roomba-j9-plus-vs-roborock-s8-pro-ultra/','Good'],
  ['Balise canonique','Présente et auto-référencée sur les 10 pages sans exception. Vérifié une par une.','Good'],
  ['Méta robots','Aucune directive noindex nulle part — rien ne bloque l\'indexation.','Good'],
  ['Viewport mobile','Présente sur les 10 pages.','Good'],
  ['robots.txt','Autorise tout, mais déclare Sitemap: https://example.com/sitemap-index.xml — un placeholder de gabarit jamais substitué. Le sitemap réel est introuvable par cette voie.','Missing'],
  ['Sitemap XML','sitemap-index.xml et sitemap-0.xml répondent en 200 et déclarent les 10 URLs, brouillons exclus.','Good'],
  ['Texte alternatif','Les photos d\'en-tête et les schémas portent un alt descriptif. Les vignettes de liste sont en alt="" (5 sur 6 en accueil, 2/2 et 3/3 sur les catégories) : défendable pour du décoratif doublé d\'un titre lisible, mais une occasion manquée.','Needs Attention'],
  ['Liens internes','12 liens internes par article, ancres descriptives, fil d\'Ariane et bloc « À lire aussi » sur chaque article.','Good'],
  ['Open Graph / Twitter','8 propriétés og: et 4 twitter: sur les 10 pages, avec une image de partage propre à chaque article.','Good'],
]));
body.push(H('Content Quality',HeadingLevel.HEADING_2));
body.push(findings([
  ['Volume de contenu','Articles de 1 434 à 1 650 mots — au-dessus du seuil de 500 et proche du format pilier. Pages de catégorie à 101 et 114 mots : trop maigres pour se positionner.','Needs Attention'],
  ['Signaux de sujet','Sujet établi sans ambiguïté dès le titre et la réponse directe. Champ lexical cohérent : navigation, brosse, station, LiDAR, caméra.','Good'],
  ['Fraîcheur','datePublished et dateModified présents en JSON-LD et affichés via une balise <time> sur chaque article.','Good'],
  ['Lisibilité','Contenu scannable : intertitres fréquents, 7 à 19 listes par article, tableaux comparatifs, encadrés points forts / à savoir.','Good'],
]));
body.push(H('Structured Data',HeadingLevel.HEADING_2));
body.push(findings([
  ['Types détectés','Articles : BlogPosting, BreadcrumbList, FAQPage, Question, Answer, ListItem, Organization, WebPage, WebSite. Autres pages : Organization, WebSite.','Good'],
  ['Complétude','BlogPosting porte headline, description, inLanguage, datePublished, dateModified, author (Person), publisher, mainEntityOfPage et articleSection.','Good'],
  ['Product / Offer','Absent. Les fiches produit et les tableaux comparatifs ne sont pas balisés en Product, faute de prix et de caractéristiques vérifiées — choix éditorial assumé, mais des extraits enrichis produit restent hors d\'atteinte.','Needs Attention'],
]));

body.push(H('GEO Analysis — 8/10',HeadingLevel.HEADING_1));
body.push(H('E-E-A-T Assessment',HeadingLevel.HEADING_2));
body.push(findings([
  ['Auteur nommé','« Par Dany Derensy » affiché sur chaque article, et author: {"@type":"Person"} dans le JSON-LD.','Good'],
  ['Page auteur','Le champ author.url renvoie vers /mentions-legales/ : aucune biographie ni élément de légitimité. C\'est le maillon faible de l\'E-E-A-T.','Needs Attention'],
  ['Méthode déclarée','/mentions-legales/ porte une section « Méthode éditoriale » qui énonce ce que le site ne fait pas : aucun test produit, aucun prix affiché, aucune donnée chiffrée invérifiable. Cette transparence est un signal de confiance fort.','Good'],
  ['Coordonnées','Adresse e-mail publiée, éditeur et directeur de publication nommés, hébergeur identifié. L\'adresse postale de l\'éditeur reste à compléter.','Needs Attention'],
  ['Signaux de réputation','Aucun avis, prix, certification ni mention presse. Normal pour un site de deux jours, mais absent.','Needs Attention'],
  ['Organization schema','Déclaré sur les 10 pages avec name et url.','Good'],
]));
body.push(H('Content for AI Synthesis',HeadingLevel.HEADING_2));
body.push(findings([
  ['Densité factuelle','Contenu structurel et citable : différences de brosse, technologies de navigation, modules de station. Volontairement dépourvu de chiffres — ce qui protège de l\'erreur mais réduit la matière brute qu\'un moteur peut extraire.','Needs Attention'],
  ['Affirmation en tête','Chaque article ouvre sur un bloc « L\'essentiel » qui répond directement à la question du titre. Présent sur les 5 articles.','Good'],
  ['Sources citées','Aucun lien vers une source externe faisant autorité. Les seuls liens sortants sont affiliés. C\'est le manque le plus net côté GEO.','Missing'],
  ['Clarté de l\'entité','Marque nommée de façon constante — Aspirob — après correction d\'une incohérence antérieure où le site s\'appelait CleanTop sur le domaine aspirob.com.','Good'],
  ['Originalité','Six schémas explicatifs originaux (cartographie LiDAR, angles morts, brosse caoutchouc contre soies, plan de balayage contre champ de vision, contenu de station, placement) plus sept fiches produit schématiques. Un moteur génératif préfère citer ce type de matériel.','Good'],
]));
body.push(H('Technical GEO',HeadingLevel.HEADING_2));
body.push(findings([
  ['Crawlers IA','robots.txt autorise nommément GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot et Google-Extended. Peu de sites le font explicitement.','Good'],
  ['llms.txt','Présent, 4 579 octets. Liste les 5 articles avec URL, catégorie, date et réponse directe, et expose la méthode éditoriale. C\'est le meilleur atout GEO du site.','Good'],
  ['HTTPS','Certificat Let\'s Encrypt valide, TLS 1.2 et 1.3 uniquement, redirection 301 depuis HTTP.','Good'],
  ['Rendu sans JavaScript','Site statique : le contenu est présent dans le HTML source, aucun rendu client requis.','Good'],
  ['sameAs / profils sociaux','Absent. Aucun profil social lié, donc aucun renfort du graphe d\'entité.','Missing'],
  ['Schémas avancés','Ni Speakable, ni Dataset, ni ClaimReview.','Needs Attention'],
]));

body.push(H('AEO Analysis — 7/10',HeadingLevel.HEADING_1));
body.push(H('Featured Snippet Eligibility',HeadingLevel.HEADING_2));
body.push(findings([
  ['Paragraphe de réponse directe','Bloc « L\'essentiel » sur les 5 articles. Longueurs : 51, 76, 84, 84 et 84 mots. La fenêtre idéale d\'un extrait enrichi est 40-60 mots : seul l\'article poils d\'animaux y entre.','Needs Attention'],
  ['Motif de définition','Présent dans l\'explicatif LiDAR (« Un aspirateur robot LiDAR utilise un faisceau laser tournant pour... »). Absent ailleurs.','Needs Attention'],
  ['Contenu en listes','7 à 19 listes par article, dont des encadrés points forts / à savoir bien délimités.','Good'],
  ['Contenu en tableaux','Tableaux comparatifs sur 3 articles (2 sur le comparatif Roomba/Roborock). Format directement éligible aux extraits tabulaires.','Good'],
]));
body.push(H('Structured Answer Formats',HeadingLevel.HEADING_2));
body.push(findings([
  ['FAQPage','5 questions balisées sur chacun des 5 articles, avec Question et Answer. Rendu en accordéon dépliable.','Good'],
  ['Intertitres en question','Le point faible : 0 H2 sur 8 pour l\'article « 5 erreurs », 1 sur 6 et 1 sur 9 ailleurs. Seul l\'explicatif LiDAR atteint 3 sur 6.','Needs Attention'],
  ['HowTo','Absent. La section « Comment améliorer la couverture de votre robot LiDAR » est une procédure qui gagnerait à être balisée.','Missing'],
  ['Speakable','Absent sur les 10 pages.','Missing'],
]));
body.push(H('Voice Search Readiness',HeadingLevel.HEADING_2));
body.push(findings([
  ['Langage conversationnel','Ton direct, phrases courtes, adresse au lecteur. Adapté à une restitution vocale.','Good'],
  ['Couverture des questions longues','25 questions couvertes au total via les FAQ, sur des intentions précises (« Un robot LiDAR fonctionne-t-il dans le noir complet ? »).','Good'],
  ['Signaux locaux','Aucun NAP ni schéma local. Non pertinent : le site n\'a pas d\'activité locale.','Good'],
]));

body.push(H('Priority Recommendations',HeadingLevel.HEADING_1));
const rw=[1500,4000,1200,1250,1410];
const PRIO={'🔴 Critique':RED,'🟠 Élevée':ORANGE,'🟡 Moyenne':AMBER,'🟢 Gain rapide':GREEN};
body.push(table([
  new TableRow({tableHeader:true,children:['Priorité','Problème','Dimension','Effort','Impact'].map((h,i)=>cell(h,{fill:NAVY,color:WHITE,bold:true,size:9,width:rw[i]}))}),
  ...[['🔴 Critique','Corriger la directive Sitemap de robots.txt, qui pointe vers example.com au lieu d\'aspirob.com','SEO','5 min','Élevé'],
      ['🟠 Élevée','Raccourcir les 5 titres d\'articles à 55-60 caractères ; le plus long en fait 118','SEO','30 min','Élevé'],
      ['🟠 Élevée','Étoffer /comparatifs/ et /guides/ : 101 et 114 mots, aucun H2, méta-descriptions de 47 et 52 caractères','SEO','1 h','Moyen'],
      ['🟠 Élevée','Reformuler les intertitres en questions — 0 sur 8 pour l\'article « 5 erreurs »','AEO','1 h','Élevé'],
      ['🟡 Moyenne','Ramener les blocs « L\'essentiel » à 40-60 mots ; quatre sur cinq font 76 à 84 mots','AEO','30 min','Moyen'],
      ['🟡 Moyenne','Citer des sources externes faisant autorité — aucun lien sortant non affilié aujourd\'hui','GEO','2 h','Élevé'],
      ['🟡 Moyenne','Créer une page auteur ; author.url renvoie vers les mentions légales','GEO','1 h','Moyen'],
      ['🟢 Gain rapide','Ajouter sameAs avec les profils sociaux dans le schéma Organization','GEO','15 min','Moyen'],
      ['🟢 Gain rapide','Baliser en HowTo la section « Comment améliorer la couverture de votre robot LiDAR »','AEO','20 min','Moyen'],
      ['🟢 Gain rapide','Compléter l\'adresse postale de l\'éditeur dans les mentions légales','SEO','5 min','Faible'],
     ].map(([p,iss,d,e,imp],i)=>new TableRow({children:[
       cell(p,{fill:PRIO[p],color:WHITE,bold:true,size:9,width:rw[0]}),
       cell(iss,{fill:i%2?GRAY:WHITE,size:9,width:rw[1]}),
       cell(d,{fill:i%2?GRAY:WHITE,size:9,align:AlignmentType.CENTER,width:rw[2]}),
       cell(e,{fill:i%2?GRAY:WHITE,size:9,align:AlignmentType.CENTER,width:rw[3]}),
       cell(imp,{fill:i%2?GRAY:WHITE,size:9,align:AlignmentType.CENTER,width:rw[4]})]})),
],rw));

body.push(H("What's Working Well",HeadingLevel.HEADING_1));
const ww=[3000,6360];
body.push(table([
  new TableRow({tableHeader:true,children:['Point fort','Preuve relevée au crawl'].map((h,i)=>cell(h,{fill:GREEN,color:WHITE,bold:true,size:9,width:ww[i]}))}),
  ...[['Préparation au GEO','robots.txt autorise nommément GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot et Google-Extended ; llms.txt expose les 5 articles avec leur réponse directe et la méthode éditoriale.'],
      ['Balisage structuré','Neuf types de schéma sur les articles : BlogPosting, BreadcrumbList, FAQPage, Question, Answer, ListItem, Organization, WebPage, WebSite.'],
      ['Hygiène des canoniques','Canonique auto-référencée sur les 10 pages, vérifiée une par une. Aucune dérive.'],
      ['Profondeur du contenu','1 434 à 1 650 mots par article, avec 6 à 9 H2 et 7 à 19 listes.'],
      ['Visuels originaux','Six schémas explicatifs et sept fiches produit dessinés pour le site — matériel que les moteurs génératifs préfèrent citer à une fiche catalogue recopiée.'],
      ['Transparence éditoriale','Le site déclare ne pas tester les produits, ne pas afficher de prix et ne publier aucune donnée invérifiable. Rare, et directement lisible par un moteur dans llms.txt.'],
      ['Maillage interne','12 liens internes par article, fil d\'Ariane et bloc « À lire aussi » systématiques.'],
      ['Conformité affiliation','Les 14 liens affiliés portent rel="sponsored nofollow noopener" et une divulgation est affichée au contact des liens.'],
     ].map(([s,e],i)=>new TableRow({children:[
       cell(s,{fill:i%2?GREENBG:WHITE,bold:true,size:9,width:ww[0]}),
       cell(e,{fill:i%2?GREENBG:WHITE,size:9,width:ww[1]})]})),
],ww));

body.push(H('Ce que cet audit ne peut pas mesurer',HeadingLevel.HEADING_1));
body.push(P("Cet audit repose sur l'analyse du HTML servi. Quatre dimensions lui échappent et demandent d'autres outils :",{after:160}));
[['Core Web Vitals et vitesse réelle','pagespeed.web.dev'],
 ['Rendu mobile effectif','Google Search Console, rapport Ergonomie mobile'],
 ['Profil de liens entrants et autorité de domaine','Ahrefs, Semrush ou Moz'],
 ['Indexation réelle et requêtes de positionnement','Google Search Console — à connecter en priorité, le site n\'ayant que deux jours']]
 .forEach(([k,v])=>body.push(P(`•  ${k} — ${v}`,{after:80})));

body.push(H('Glossaire',HeadingLevel.HEADING_1));
[['SEO — Search Engine Optimization','Optimisation pour les moteurs classiques (Google, Bing) : structure technique, contenu, balisage, liens. L\'objectif est de figurer dans la liste des résultats.'],
 ['GEO — Generative Engine Optimization','Optimisation pour les moteurs génératifs (ChatGPT Search, Perplexity, Google AI Overviews, Gemini), qui synthétisent une réponse à partir de plusieurs sources et citent leurs références. L\'objectif n\'est plus d\'être classé mais d\'être cité, ce qui récompense la clarté, l\'attribution et l\'originalité.'],
 ['AEO — Answer Engine Optimization','Optimisation pour les réponses directes : extraits enrichis, encadrés « Autres questions posées », recherche vocale. L\'objectif est de fournir une réponse suffisamment nette pour être extraite telle quelle.']]
 .forEach(([t,d])=>{body.push(P(t,{bold:true,size:12,after:60}));body.push(P(d,{after:200}));});

// ───────────────────────────── DOC
const doc=new Document({sections:[
  {properties:{page:{size:{width:12240,height:15840},margin:{top:0,right:0,bottom:0,left:0}}},children:cover},
  {properties:{page:{size:{width:12240,height:15840},margin:{top:1440,right:1440,bottom:1440,left:1440}}},
   headers:{default:new Header({children:[new Paragraph({
     border:{bottom:{style:BorderStyle.SINGLE,size:8,color:NAVY}},
     tabStops:[{type:'right',position:W}],
     children:[new TextRun({text:DOMAIN,font:F,size:18,color:NAVY,bold:true}),
               new TextRun({text:'\tSEO / GEO / AEO Audit Report',font:F,size:18,color:MUTED})]})]})},
   footers:{default:new Footer({children:[new Paragraph({
     border:{top:{style:BorderStyle.SINGLE,size:6,color:BORDER}},
     tabStops:[{type:'right',position:W}],
     children:[new TextRun({text:'Claude Skill and Plugin by Alex Labat',font:F,size:18,color:MUTED}),
               new TextRun({text:'\t',font:F,size:18}),
               new TextRun({children:[PageNumber.CURRENT],font:F,size:18,color:MUTED})]})]})},
   children:body},
]});

fs.writeFileSync(process.env.AUDIT_OUT, await Packer.toBuffer(doc));
console.log('DOCX écrit :', process.env.AUDIT_OUT);
