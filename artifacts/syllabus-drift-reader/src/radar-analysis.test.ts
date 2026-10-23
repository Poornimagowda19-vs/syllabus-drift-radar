import assert from 'node:assert/strict';
import test from 'node:test';
import { DOMAIN_OPTIONS, ROLE_OPTIONS, SAMPLE_DEMOS, getRoleOptions } from './domain-catalog.ts';
import { analyzeCurriculum } from './radar-analysis.ts';

test('offers all requested engineering, computing, and AI role options by domain', () => {
  const allRoleLabels = Object.values(ROLE_OPTIONS).flat().map((role) => role.label);
  for (const label of [
    'VLSI Design Engineer',
    'VLSI Verification Engineer',
    'Embedded Systems Engineer',
    'Software Developer',
    'Cybersecurity Analyst',
    'Machine Learning Engineer',
    'AI Engineer',
    'Data Scientist',
    'Data Analyst',
  ]) {
    assert.ok(allRoleLabels.includes(label), `Missing role option: ${label}`);
  }
  assert.equal(DOMAIN_OPTIONS.length, 4);
  assert.equal(getRoleOptions('custom')[0]?.id, 'custom');
});

test('every built-in syllabus is clearly identified as illustrative, not institution-verified', () => {
  for (const demo of Object.values(SAMPLE_DEMOS)) {
    assert.match(demo.syllabusFileName, /not institution-verified/i);
    assert.match(demo.syllabusText, /not verified against a real institution/i);
    assert.ok(demo.jobs.every((job) => job.title.startsWith('SAMPLE AD')));
  }
});

test('ECE VLSI analysis matches domain skills, quotes job evidence, and separates coverage states', () => {
  const demo = SAMPLE_DEMOS.ece;
  const result = analyzeCurriculum({
    domainId: 'ece',
    roleId: demo.roleId,
    customRoleTitle: '',
    syllabusText: demo.syllabusText,
    syllabusFileName: demo.syllabusFileName,
    jobDescriptions: demo.jobs,
    isSample: true,
  });

  assert.equal(result.domainId, 'ece');
  assert.equal(result.roleLabel, 'VLSI Design Engineer');
  assert.equal(result.isSample, true);
  assert.ok(result.skills.some((item) => item.skill.id === 'digital-design'));
  assert.ok(result.skills.some((item) => item.skill.id === 'verilog-systemverilog'));
  assert.ok(result.skills.some((item) => item.skill.id === 'fpga'));
  assert.ok(result.skills.some((item) => item.skill.id === 'semiconductor-testing' && item.status === 'missing'));
  assert.ok(result.skills.every((item) => item.jobEvidence.length > 0));
  assert.ok(result.skills.some((item) => item.status === 'covered'));
  assert.ok(result.skills.some((item) => item.status === 'partial' || item.status === 'missing'));
});

test('CSE built-in demonstration runs through the same analysis path', () => {
  const demo = SAMPLE_DEMOS.cse;
  const result = analyzeCurriculum({
    domainId: 'cse',
    roleId: demo.roleId,
    syllabusText: demo.syllabusText,
    syllabusFileName: demo.syllabusFileName,
    jobDescriptions: demo.jobs,
    isSample: true,
  });

  assert.equal(result.isSample, true);
  assert.equal(result.domainLabel, 'Computer Science & Engineering (CSE/CS)');
  assert.ok(result.skills.some((item) => item.skill.id === 'programming'));
  assert.ok(result.skills.every((item) => item.jobEvidence.length > 0));
});

test('CSE Cybersecurity Analyst can be selected and scored against supplied descriptions', () => {
  const result = analyzeCurriculum({
    domainId: 'cse',
    roleId: 'cybersecurity-analyst',
    syllabusText: SAMPLE_DEMOS.cse.syllabusText,
    syllabusFileName: 'Pasted CSE syllabus',
    jobDescriptions: [{
      id: 'cyber-role',
      title: 'Sample Cybersecurity Analyst posting',
      text: 'The analyst reviews cybersecurity alerts, performs incident response, and uses SIEM and network security logs to investigate security events.',
    }],
  });

  assert.ok(result.skills.some((item) => item.skill.id === 'cybersecurity'));
  assert.ok(result.skills.some((item) => item.skill.id === 'network-security'));
  assert.ok(result.skills.every((item) => item.jobEvidence[0]?.source === 'Sample Cybersecurity Analyst posting'));
  assert.equal(result.isSample, false);
});

test('AI/ML sample returns a weighted coverage percentage consistent with its counts', () => {
  const demo = SAMPLE_DEMOS['ai-ml'];
  const result = analyzeCurriculum({
    domainId: 'ai-ml',
    roleId: demo.roleId,
    syllabusText: demo.syllabusText,
    syllabusFileName: demo.syllabusFileName,
    jobDescriptions: demo.jobs,
    isSample: true,
  });

  const expected = Math.round(
    ((result.summary.covered + result.summary.partial * 0.5) / result.summary.required) * 100,
  );
  assert.equal(result.summary.coveragePercent, expected);
  assert.equal(
    result.summary.covered + result.summary.partial + result.summary.missing,
    result.summary.required,
  );
  assert.ok(result.skills.some((item) => item.skill.id === 'python'));
  assert.ok(result.skills.some((item) => item.skill.id === 'model-evaluation'));
  assert.ok(result.skills.every((item) => item.jobEvidence.length > 0));
});

test('custom domains accept a custom role and skill phrases without claiming sample data', () => {
  const result = analyzeCurriculum({
    domainId: 'custom',
    roleId: 'custom',
    customDomainName: 'Biotechnology',
    customRoleTitle: 'Laboratory Quality Analyst',
    customSkills: ['ELISA', 'protein assay'],
    syllabusText: 'Protein assay laboratory\nImmunoassays and ELISA',
    syllabusFileName: 'Pasted biotechnology syllabus',
    jobDescriptions: [{
      id: 'lab-role',
      title: 'Laboratory Quality Analyst posting',
      text: 'The analyst performs ELISA and protein assay work, maintains documentation, and follows quality assurance checks.',
    }],
  });

  assert.equal(result.domainLabel, 'Biotechnology');
  assert.equal(result.roleLabel, 'Laboratory Quality Analyst');
  assert.equal(result.isSample, false);
  assert.ok(result.skills.some((item) => item.skill.name === 'ELISA'));
  assert.ok(result.skills.some((item) => item.skill.name === 'protein assay'));
  assert.ok(result.skills.every((item) => item.jobEvidence.length > 0));
});

test('input validation explains missing syllabus, job descriptions, and custom title', () => {
  const base = {
    domainId: 'ece' as const,
    roleId: 'vlsi-design' as const,
    syllabusText: 'Digital logic design',
    syllabusFileName: 'test.txt',
    jobDescriptions: [{ id: 'one', title: 'Role', text: 'Digital design and FPGA.' }],
  };

  assert.throws(
    () => analyzeCurriculum({ ...base, syllabusText: '' }),
    /choose an illustrative sample, upload a readable PDF, or paste the syllabus/i,
  );
  assert.throws(
    () => analyzeCurriculum({ ...base, jobDescriptions: [] }),
    /paste at least one job description/i,
  );
  assert.throws(
    () => analyzeCurriculum({ ...base, roleId: 'custom', customRoleTitle: '' }),
    /enter a custom job title/i,
  );
});
