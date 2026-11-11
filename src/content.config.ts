import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Schémas du contenu. Toute donnée publiée passe par ces schémas :
 * un fichier invalide fait échouer `npm run build`.
 */

const date = z.coerce.date();
const yaml = (dir: string) => glob({ pattern: '**/*.{yaml,yml}', base: `./src/content/${dir}` });

/** Compte les mots d'une citation (règle : moins de 15 mots). */
const nbMots = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/* ------------------------------------------------------------------ */
/* Sources : registre de tous les documents cités                      */
/* ------------------------------------------------------------------ */
const sources = defineCollection({
  loader: yaml('sources'),
  schema: z.object({
    titre: z.string(),
    organisme: z.string(),
    date_publication: date.optional(),
    date_consultation: date,
    url: z.url(),
    type: z
      .enum(['statistique', 'evaluation', 'rapport-public', 'think-tank', 'loi', 'programme', 'presse', 'autre'])
      .default('autre'),
    factice: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ */
/* Candidats                                                           */
/* ------------------------------------------------------------------ */
const candidats = defineCollection({
  loader: yaml('candidats'),
  schema: z.object({
    prenom: z.string(),
    nom: z.string(),
    parti: z.string(),
    /** déclaré = candidature annoncée ; investi = désigné par son parti ; pressenti = non déclaré */
    statut: z.enum(['declare', 'investi', 'pressenti', 'retire']),
    statut_source: z.url(),
    /** date de déclaration ou d'investiture */
    date_statut: date.optional(),
    /** précision factuelle sur le statut (procédure en cours, départage prévu…) */
    precision: z.string().optional(),
    programme_url: z.url().optional(),
    /** pages supplémentaires à surveiller (sites de campagne, pages programme du parti) */
    veille_urls: z.array(z.url()).default([]),
    date_verification: date,
    /** sigles des groupes de l'Assemblée où siègent les députés du parti (selon la législature) */
    groupes_assemblee: z.array(z.string()).default([]),
    /** précision sur ce rattachement (ex. parti sans groupe, apparentement) */
    groupes_note: z.string().optional(),
    actif: z.boolean().default(true),
    factice: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ */
/* Glossaire                                                           */
/* ------------------------------------------------------------------ */
const glossaire = defineCollection({
  loader: yaml('glossaire'),
  schema: z.object({
    terme: z.string(),
    /** 2 à 3 phrases simples */
    definition: z.string(),
    exemple: z.string().optional(),
    lien: z.object({ titre: z.string(), url: z.url() }).optional(),
    factice: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ */
/* Thèmes                                                              */
/* ------------------------------------------------------------------ */
const chiffre = z.object({
  libelle: z.string(),
  valeur: z.string(),
  precision: z.string().optional(),
  annee: z.union([z.string(), z.number()]).transform(String),
  source: reference('sources'),
});

const loi = z.object({
  titre: z.string(),
  resume: z.string(),
  url: z.url().refine(
    (u) => /legifrance\.gouv\.fr|vie-publique\.fr|eur-lex\.europa\.eu|conseil-constitutionnel\.fr|assemblee-nationale\.fr|senat\.fr|\.gouv\.fr/.test(u),
    'Lien attendu vers Légifrance, vie-publique.fr, EUR-Lex, le Conseil constitutionnel le Parlement ou un site officiel .gouv.fr',
  ),
});

const constat = z.object({
  /** fonctionne / ne fonctionne pas / fait débat, selon les évaluations citées */
  nature: z.enum(['fonctionne', 'ne-fonctionne-pas', 'debat']),
  texte: z.string(),
  sources: z.array(reference('sources')).min(1),
});

const evaluation = z.object({
  source: reference('sources'),
  /** ce que dit l'évaluateur, en une ou deux phrases */
  resume: z.string(),
  fourchette: z.string().optional(),
});

const effet = z.object({
  sujet: z.string(),
  /** axes de mesures concernés (identifiants de `axes`) */
  axes: z.array(z.string()).default([]),
  evaluations: z.array(evaluation).min(1),
  /** points de désaccord entre évaluateurs */
  desaccords: z.string().optional(),
});

const themes = defineCollection({
  loader: yaml('themes'),
  schema: z.object({
    numero: z.number().int().min(1),
    titre: z.string(),
    sous_titre: z.string().optional(),
    /** nom d'icône Lucide (outline monochrome), ex. "briefcase" */
    icone: z.string().optional(),
    date_maj: date,
    /** fiche remplie ou en attente */
    etat: z.enum(['en-preparation', 'publie']).default('en-preparation'),
    /** les questions sur lesquelles on compare les candidats (lignes du tableau) */
    axes: z.array(z.object({ id: z.string(), libelle: z.string(), description: z.string().optional() })).default([]),
    situation: z
      .object({
        texte: z.string(),
        chiffres: z.array(chiffre).default([]),
        lois: z.array(loi).default([]),
      })
      .optional(),
    bilan: z.array(constat).default([]),
    effets: z.array(effet).default([]),
    glossaire: z.array(reference('glossaire')).default([]),
    factice: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------ */
/* Mesures : une mesure = un candidat × un thème × un axe              */
/* ------------------------------------------------------------------ */
const STATUTS_SOURCES = ['programme', 'orale'] as const;

const mesures = defineCollection({
  loader: yaml('mesures'),
  schema: z
    .object({
      theme: reference('themes'),
      axe: z.string(),
      candidat: reference('candidats'),
      /**
       * programme   : écrite dans le programme officiel
       * orale       : annoncée oralement (interview, meeting)
       * aucune      : le programme publié ne contient pas de mesure sur ce point
       * non-publie  : le candidat n'a pas encore publié son programme sur ce thème
       */
      statut: z.enum(['programme', 'orale', 'aucune', 'non-publie']),
      /** résumé descriptif et neutre, en langage simple (140 caractères max) */
      intitule: z.string().max(140, 'Intitulé : 140 caractères maximum').optional(),
      detail: z.string().optional(),
      /** formulation originale, moins de 15 mots */
      citation: z
        .string()
        .refine((s) => nbMots(s) < 15, 'La citation doit faire moins de 15 mots')
        .optional(),
      source: z
        .object({
          url: z.url(),
          titre: z.string(),
          /** pour une annonce orale : média, émission, meeting */
          contexte: z.string().optional(),
          date_consultation: date,
        })
        .optional(),
      /** chiffrage annoncé par le candidat lui-même (≠ estimation d'un évaluateur) */
      chiffrage_annonce: z.string().optional(),
      /** estimation du coût par un évaluateur indépendant */
      cout: z
        .object({
          fourchette: z.string(),
          source: reference('sources'),
          note: z.string().optional(),
        })
        .optional(),
      evaluations: z.array(evaluation).default([]),
      date_maj: date,
    })
    .superRefine((m, ctx) => {
      if (m.statut !== 'non-publie' && !m.source) {
        ctx.addIssue({ code: 'custom', message: `Statut « ${m.statut} » : source obligatoire (document consulté)` });
      }
      if ((STATUTS_SOURCES as readonly string[]).includes(m.statut)) {
        if (!m.intitule) ctx.addIssue({ code: 'custom', message: `Statut « ${m.statut} » : intitulé obligatoire` });
      }
      if (m.statut === 'orale' && m.source && !m.source.contexte) {
        ctx.addIssue({ code: 'custom', message: 'Annonce orale : préciser le contexte (média, date, lieu)' });
      }
    }),
});

/* ------------------------------------------------------------------ */
/* Votes à l'Assemblée nationale (scrutins publics)                    */
/* ------------------------------------------------------------------ */
const nb = z.number().int().min(0).nullable().optional();
const votes = defineCollection({
  loader: yaml('votes'),
  schema: z.object({
    theme: reference('themes'),
    titre: z.string(),
    /** ce qui a été voté (ensemble, article, motion de censure…) */
    objet: z.string(),
    date: date,
    legislature: z.number().int(),
    numero_scrutin: z.number().int(),
    url: z.url().refine((u) => u.includes('assemblee-nationale.fr'), 'URL du scrutin sur assemblee-nationale.fr attendue'),
    axes: z.array(z.string()).default([]),
    resultat: z.enum(['adopte', 'rejete']),
    decompte: z.object({ pour: z.number().int(), contre: nb, abstention: nb }),
    groupes: z.array(z.object({ groupe: z.string(), sigle: z.string(), pour: nb, contre: nb, abstention: nb, non_votants: nb })).min(1),
    note: z.string().optional(),
    date_consultation: date,
  }),
});

export const collections = { sources, candidats, glossaire, themes, mesures, votes };
