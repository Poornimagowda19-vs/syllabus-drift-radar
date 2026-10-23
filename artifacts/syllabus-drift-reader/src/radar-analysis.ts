import {
  DOMAIN_OPTIONS,
  getRoleOptions,
  SKILL_TAXONOMY,
  type DomainId,
  type RoleId,
  type SkillDefinition,
} from './domain-catalog.ts';

export type { DomainId, RoleId, SkillDefinition } from './domain-catalog.ts';
export { DOMAIN_OPTIONS, getRoleOptions, ROLE_OPTIONS, SAMPLE_DEMOS, SKILL_TAXONOMY } from './domain-catalog.ts';

export type SkillStatus = 'covered' | 'partial' | 'missing';

export type JobDescriptionInput = {
  id: string;
  title: string;
  text: string;
};

export type SkillEvidence = {
  source: string;
  excerpt: string;
};

export type SkillAssessment = {
  skill: SkillDefinition;
  status: SkillStatus;
  jobEvidence: SkillEvidence[];
  syllabusEvidence: string[];
  recommendedSubject: string;
  proposedChange: string;
  before: string[];
  after: string[];
};

export type RadarAnalysis = {
  domainId: DomainId;
  domainLabel: string;
  roleId: RoleId;
  roleLabel: string;
  syllabusFileName: string;
  skills: SkillAssessment[];
  taxonomySkillCount: number;
  summary: {
    covered: number;
    partial: number;
    missing: number;
    required: number;
    coveragePercent: number;
  };
  isSample: boolean;
};

function normalizeForMatch(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function includesAlias(text: string, alias: string): boolean {
  const haystack = ` ${normalizeForMatch(text)} `;
  const needle = ` ${normalizeForMatch(alias)} `;
  return needle.length > 2 && haystack.includes(needle);
}

function splitEvidence(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\r?\n+/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter((part) => part.length > 0);
}

function shorten(text: string, limit = 240): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

function getJobEvidence(skill: SkillDefinition, jobDescriptions: JobDescriptionInput[]): SkillEvidence[] {
  const evidence: SkillEvidence[] = [];
  const seen = new Set<string>();
  for (const job of jobDescriptions) {
    for (const sentence of splitEvidence(job.text)) {
      if (!skill.aliases.some((alias) => includesAlias(sentence, alias))) continue;
      const uniqueKey = `${job.id}:${normalizeForMatch(sentence)}`;
      if (seen.has(uniqueKey)) continue;
      seen.add(uniqueKey);
      evidence.push({ source: job.title.trim() || 'Job description', excerpt: shorten(sentence) });
      if (evidence.length >= 5) return evidence;
    }
  }
  return evidence;
}

function getSyllabusEvidence(skill: SkillDefinition, syllabusText: string): string[] {
  const lines = syllabusText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return lines.filter((line) => skill.aliases.some((alias) => includesAlias(line, alias)));
}

const PRACTICE_CUE = /\b(lab|laboratory|project|assignment|implement|implementation|build|built|deploy|practical|workshop|capstone|exercise|hands[- ]on)\b/i;

function hasNearbyPracticeCue(skill: SkillDefinition, syllabusText: string): boolean {
  const lines = syllabusText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return lines.some((line, index) => {
    if (!skill.aliases.some((alias) => includesAlias(line, alias))) return false;
    return [lines[index - 1], line, lines[index + 1]]
      .some((nearby) => nearby && PRACTICE_CUE.test(nearby));
  });
}

function findSubject(skill: SkillDefinition, syllabusText: string): string {
  const lines = syllabusText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const hints = skill.subjectHints.map(normalizeForMatch);
  const matchingLine = lines.find((line) =>
    hints.some((hint) => hint && ` ${normalizeForMatch(line)} `.includes(` ${hint} `)),
  );
  if (matchingLine) return shorten(matchingLine, 90);
  const fallbackHint = skill.subjectHints[0] ?? skill.category.toLowerCase();
  return `Existing ${fallbackHint} subject (confirm course name)`;
}

function createCustomSkillDefinitions(
  phrases: string[],
  existingSkills: SkillDefinition[],
): SkillDefinition[] {
  const existingTerms = new Set(
    existingSkills.flatMap((skill) => [skill.name, ...skill.aliases]).map(normalizeForMatch),
  );
  const seen = new Set<string>();
  return phrases
    .map((phrase) => phrase.trim().replace(/\s+/g, ' '))
    .filter((phrase) => phrase.length > 1 && phrase.length <= 80)
    .filter((phrase) => {
      const normalized = normalizeForMatch(phrase);
      if (!normalized || seen.has(normalized) || existingTerms.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .slice(0, 30)
    .map((phrase, index) => {
      const slug = normalizeForMatch(phrase).replace(/\s+/g, '-');
      return {
        id: `custom-${slug}-${index}`,
        name: phrase,
        category: 'Custom skill phrases',
        aliases: [phrase],
        domains: ['custom'] as DomainId[],
        roles: ['custom'] as RoleId[],
        subjectHints: [],
        topicSuggestion: `An introductory unit on ${phrase}`,
        labSuggestion: `A small applied exercise using ${phrase}`,
      };
    });
}

export function analyzeCurriculum(input: {
  domainId: DomainId;
  roleId: RoleId;
  customDomainName?: string;
  customRoleTitle?: string;
  customSkills?: string[];
  syllabusText: string;
  syllabusFileName: string;
  jobDescriptions: JobDescriptionInput[];
  isSample?: boolean;
}): RadarAnalysis {
  const domain = DOMAIN_OPTIONS.find((option) => option.id === input.domainId);
  if (!domain) throw new Error('Choose a supported curriculum domain.');
  const role = getRoleOptions(input.domainId).find((option) => option.id === input.roleId);
  if (!role) throw new Error('Choose a job role that belongs to the selected domain.');
  const roleLabel = input.roleId === 'custom'
    ? input.customRoleTitle?.trim()
    : role.label;
  if (!roleLabel) throw new Error('Enter a custom job title before running the radar.');
  const domainLabel = input.domainId === 'custom'
    ? input.customDomainName?.trim() || 'Other / Custom Domain'
    : domain.label;
  if (!input.syllabusText.trim()) {
    throw new Error('Add syllabus text first: choose an illustrative sample, upload a readable PDF, or paste the syllabus.');
  }
  const usableJobs = input.jobDescriptions.filter((job) => job.text.trim().length > 0);
  if (usableJobs.length === 0) throw new Error('Paste at least one job description before analyzing.');

  const domainTaxonomy = SKILL_TAXONOMY.filter((skill) =>
    skill.domains.includes(input.domainId)
    && (input.roleId === 'custom' || skill.roles.includes(input.roleId)),
  );
  const customSkills = input.domainId === 'custom'
    ? createCustomSkillDefinitions(input.customSkills ?? [], domainTaxonomy)
    : [];
  const roleTaxonomy = [...domainTaxonomy, ...customSkills];
  const detected = roleTaxonomy
    .map((skill) => ({ skill, jobEvidence: getJobEvidence(skill, usableJobs) }))
    .filter((match) => match.jobEvidence.length > 0);
  if (detected.length === 0) {
    throw new Error(`No exact ${domainLabel} skill phrases from the built-in taxonomy were found in these job descriptions. Try including specific role terms or add custom skill phrases.`);
  }

  const skills: SkillAssessment[] = detected.map(({ skill, jobEvidence }) => {
    const syllabusEvidence = getSyllabusEvidence(skill, input.syllabusText);
    const status: SkillStatus = syllabusEvidence.length === 0
      ? 'missing'
      : hasNearbyPracticeCue(skill, input.syllabusText)
        ? 'covered'
        : 'partial';
    const recommendedSubject = findSubject(skill, input.syllabusText);
    const suggestedWork = status === 'partial' ? skill.labSuggestion : skill.topicSuggestion;
    const proposedChange = status === 'partial'
      ? `Add one applied lab: ${skill.labSuggestion}.`
      : `Add a short topic: ${skill.topicSuggestion}.`;
    const before = syllabusEvidence.length > 0
      ? syllabusEvidence.slice(0, 2)
      : ['No matching skill phrase found in the supplied syllabus.'];
    const after = [
      ...syllabusEvidence.slice(0, 2),
      `Proposed addition to ${recommendedSubject}: ${suggestedWork}.`,
    ];
    return {
      skill,
      status,
      jobEvidence,
      syllabusEvidence: syllabusEvidence.slice(0, 3),
      recommendedSubject,
      proposedChange,
      before,
      after,
    };
  });

  const covered = skills.filter((item) => item.status === 'covered').length;
  const partial = skills.filter((item) => item.status === 'partial').length;
  const missing = skills.filter((item) => item.status === 'missing').length;
  const required = skills.length;

  return {
    domainId: input.domainId,
    domainLabel,
    roleId: input.roleId,
    roleLabel,
    syllabusFileName: input.syllabusFileName,
    skills,
    taxonomySkillCount: roleTaxonomy.length,
    summary: {
      covered,
      partial,
      missing,
      required,
      coveragePercent: required === 0 ? 0 : Math.round(((covered + partial * 0.5) / required) * 100),
    },
    isSample: input.isSample ?? false,
  };
}
