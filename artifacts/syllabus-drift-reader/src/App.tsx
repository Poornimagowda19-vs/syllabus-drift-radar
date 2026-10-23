import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  FileText,
  FlaskConical,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  analyzeCurriculum,
  DOMAIN_OPTIONS,
  getRoleOptions,
  SAMPLE_DEMOS,
  SKILL_TAXONOMY,
} from '@/radar-analysis';
import type { DomainId, JobDescriptionInput, RadarAnalysis, RoleId, SkillAssessment, SkillStatus } from '@/radar-analysis';
import { extractSyllabusPdf } from '@/pdf-extractor';

function App() {
  const [domainId, setDomainId] = useState<DomainId>('ai-ml');
  const [roleId, setRoleId] = useState<RoleId>('ml-engineer');
  const [customDomainName, setCustomDomainName] = useState('');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [customSkillText, setCustomSkillText] = useState('');
  const [syllabusMode, setSyllabusMode] = useState<'sample' | 'pdf' | 'paste'>('sample');
  const [selectedSampleDomain, setSelectedSampleDomain] = useState<Exclude<DomainId, 'custom'>>('ai-ml');
  const [syllabus, setSyllabus] = useState<{ fileName: string; text: string; pageCount?: number; isSample?: boolean; sampleDomainId?: Exclude<DomainId, 'custom'> } | null>(null);
  const [pastedSyllabus, setPastedSyllabus] = useState('');
  const [jobs, setJobs] = useState<JobDescriptionInput[]>([{ id: 'job-1', title: '', text: '' }]);
  const [result, setResult] = useState<RadarAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activityLabel, setActivityLabel] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const roleSkillCount = useMemo(
    () => SKILL_TAXONOMY.filter((skill) => skill.domains.includes(domainId) && (roleId === 'custom' || skill.roles.includes(roleId))).length,
    [domainId, roleId],
  );
  const roleOptions = getRoleOptions(domainId);
  const usableJobs = jobs.filter((job) => job.text.trim().length > 0);

  const clearResult = () => {
    setResult(null);
    setExpandedSkills([]);
  };

  const processFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    clearResult();
    setBusy(true);
    setActivityLabel('Reading PDF…');
    setProgress(2);
    try {
      const extracted = await extractSyllabusPdf(file, setProgress);
      setSyllabus({ ...extracted, isSample: false });
      setPastedSyllabus('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to read that PDF. Choose another text-based syllabus.');
      setSyllabus(null);
    } finally {
      setBusy(false);
      setActivityLabel('');
      setProgress(0);
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void processFile(event.target.files?.[0]);
    event.target.value = '';
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void processFile(event.dataTransfer.files[0]);
  };

  const updateJob = (id: string, key: 'title' | 'text', value: string) => {
    setJobs((current) => current.map((job) => job.id === id ? { ...job, [key]: value } : job));
    clearResult();
  };
  const addJob = () => {
    setJobs((current) => [...current, { id: `job-${Date.now()}-${current.length}`, title: '', text: '' }]);
    clearResult();
  };
  const removeJob = (id: string) => {
    setJobs((current) => current.length === 1 ? [{ id: `job-${Date.now()}`, title: '', text: '' }] : current.filter((job) => job.id !== id));
    clearResult();
  };

  const runAnalysis = () => {
    setError(null);
    if (syllabusMode === 'sample' && domainId !== selectedSampleDomain) {
      setError('Load the illustrative sample for the selected domain before analyzing.');
      return;
    }
    const activeSyllabus = syllabusMode === 'paste'
      ? { fileName: 'Pasted syllabus text', text: pastedSyllabus, isSample: false }
      : syllabusMode === 'sample'
        ? (syllabus?.isSample && syllabus.sampleDomainId === selectedSampleDomain ? syllabus : null)
        : (syllabus && !syllabus.isSample ? syllabus : null);
    if (!activeSyllabus?.text.trim()) {
      setError(syllabusMode === 'paste'
        ? 'Paste syllabus text before running the radar.'
        : 'Choose an illustrative sample or add a readable syllabus PDF before running the radar.');
      return;
    }
    if (!usableJobs.length) {
      setError('Paste at least one job description so the radar has role-specific evidence to review.');
      return;
    }
    setBusy(true);
    setActivityLabel('Analyzing…');
    setProgress(100);
    window.setTimeout(() => {
      try {
        const analysis = analyzeCurriculum({
          domainId,
          roleId,
          customDomainName,
          customRoleTitle,
          customSkills: customSkillText.split(/[\n,]/).map((skill) => skill.trim()).filter(Boolean),
          syllabusText: activeSyllabus.text,
          syllabusFileName: activeSyllabus.fileName,
          jobDescriptions: usableJobs,
          isSample: activeSyllabus.isSample === true,
        });
        setResult(analysis);
        setExpandedSkills([]);
        setError(null);
        window.setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Analysis could not be completed. Review the inputs and try again.');
        setResult(null);
      } finally {
        setBusy(false);
        setActivityLabel('');
        setProgress(0);
      }
    }, 120);
  };

  const loadSample = (sampleDomain = selectedSampleDomain, runDemo = false) => {
    const demo = SAMPLE_DEMOS[sampleDomain];
    const sampleJobs = demo.jobs.map((job) => ({ ...job }));
    setDomainId(demo.domainId);
    setRoleId(demo.roleId);
    setCustomDomainName('');
    setCustomRoleTitle(demo.customRoleTitle);
    setSyllabusMode('sample');
    setSelectedSampleDomain(demo.domainId);
    setSyllabus({ fileName: demo.syllabusFileName, text: demo.syllabusText, isSample: true, sampleDomainId: demo.domainId });
    setPastedSyllabus('');
    setJobs(sampleJobs);
    setError(null);
    clearResult();
    if (!runDemo) return;
    setBusy(true);
    setActivityLabel('Analyzing illustrative demo…');
    window.setTimeout(() => {
      try {
        const analysis = analyzeCurriculum({
          domainId: demo.domainId,
          roleId: demo.roleId,
          customRoleTitle: demo.customRoleTitle,
          syllabusText: demo.syllabusText,
          syllabusFileName: demo.syllabusFileName,
          jobDescriptions: sampleJobs,
          isSample: true,
        });
        setResult(analysis);
        setExpandedSkills([]);
        window.setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'The sample demonstration could not be loaded.');
      } finally {
        setBusy(false);
        setActivityLabel('');
      }
    }, 120);
  };

  const reset = () => {
    setDomainId('ai-ml');
    setRoleId('ml-engineer');
    setCustomDomainName('');
    setCustomRoleTitle('');
    setCustomSkillText('');
    setSyllabusMode('sample');
    setSelectedSampleDomain('ai-ml');
    setSyllabus(null);
    setPastedSyllabus('');
    setJobs([{ id: `job-${Date.now()}`, title: '', text: '' }]);
    setResult(null);
    setError(null);
    setBusy(false);
    setActivityLabel('');
    setProgress(0);
    setExpandedSkills([]);
    if (fileInput.current) fileInput.current.value = '';
  };

  const toggleEvidence = (id: string) => setExpandedSkills((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="/" className="brand" aria-label="Syllabus Drift Radar home" data-testid="link-home">
          <span className="brand-mark"><Activity size={17} strokeWidth={2.2} /></span>
          <span>Syllabus Drift Radar<small>BY TEAM VERINEXUS</small></span>
        </a>
        <div className="header-note"><span className="privacy-dot" /> Local analysis <span aria-hidden="true">·</span> no upload</div>
      </header>

      <main className="workspace">
        <section className="hero">
          <div>
            <div className="eyebrow"><span className="eyebrow-rule" /> CURRICULUM × WORKFORCE SIGNAL</div>
            <h1>Spot the skills<br />between the lines.</h1>
            <p className="hero-copy">See which skills show up in real role descriptions but are <strong>missing or lightly practiced</strong> in a degree syllabus. A clear starting point for the next curriculum conversation.</p>
          </div>
          <aside className="hero-aside"><strong>Built for faculty & students</strong>Evidence stays visible at every step. Suggestions are small, specific, and never applied to your syllabus.</aside>
        </section>

        <section className="panel builder" aria-labelledby="workspace-heading">
          <div className="section-head">
            <div><h2 id="workspace-heading">Set up your radar</h2><p>Choose a domain and role, then add syllabus text and one or more job descriptions.</p></div>
            <div className="local-badge"><LockKeyhole size={12} /> Everything stays in this browser</div>
          </div>

          <div className="input-layout">
            <div>
              <label className="field-label" htmlFor="domain-select">01 / Curriculum domain <span>Choose a skill taxonomy</span></label>
              <select
                id="domain-select"
                className="role-select"
                value={domainId}
                onChange={(event) => {
                  const nextDomain = event.target.value as DomainId;
                  setDomainId(nextDomain);
                  setRoleId(getRoleOptions(nextDomain)[0]?.id ?? 'custom');
                  setCustomRoleTitle('');
                  if (nextDomain === 'custom') {
                    if (syllabusMode === 'sample') setSyllabusMode('paste');
                  } else {
                    setSelectedSampleDomain(nextDomain);
                  }
                  if (syllabus?.isSample && syllabus.sampleDomainId !== nextDomain) setSyllabus(null);
                  clearResult();
                }}
                data-testid="select-domain"
              >
                {DOMAIN_OPTIONS.map((domain) => <option key={domain.id} value={domain.id}>{domain.label}</option>)}
              </select>

              {domainId === 'custom' && (
                <div className="custom-fields">
                  <label className="field-label" htmlFor="custom-domain-name">Custom domain name <span>Optional label</span></label>
                  <input id="custom-domain-name" className="role-select" value={customDomainName} onChange={(event) => { setCustomDomainName(event.target.value); clearResult(); }} placeholder="e.g. Environmental Engineering" data-testid="input-custom-domain" />
                  <label className="field-label custom-skills-label" htmlFor="custom-skills">Custom skill phrases <span>Optional · up to 30 recognized</span></label>
                  <textarea id="custom-skills" className="custom-skills" value={customSkillText} onChange={(event) => { setCustomSkillText(event.target.value); clearResult(); }} placeholder={'One phrase per line or separated by commas'} data-testid="input-custom-skills" />
                </div>
              )}

              <div className="field-label role-label"><label htmlFor="role-select">02 / Job role</label><span>Options filtered by domain</span></div>
              <select
                id="role-select"
                className="role-select"
                value={roleId}
                onChange={(event) => { setRoleId(event.target.value as RoleId); clearResult(); }}
                data-testid="select-role"
              >
                {roleOptions.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
              </select>
              {roleId === 'custom' && (
                <label className="custom-title-field">
                  <span className="field-label">Custom job title <span>Required</span></span>
                  <input className="role-select" value={customRoleTitle} onChange={(event) => { setCustomRoleTitle(event.target.value); clearResult(); }} placeholder="e.g. Sustainability Analyst" data-testid="input-custom-role-title" />
                </label>
              )}

              <div style={{ height: 17 }} />
              <div className="field-label">03 / Degree syllabus <span>Sample · PDF · pasted text</span></div>
              <div className="mode-tabs" role="group" aria-label="Syllabus input mode">
                <button type="button" className={syllabusMode === 'sample' ? 'mode-tab active' : 'mode-tab'} onClick={() => { setSyllabusMode('sample'); clearResult(); }} disabled={domainId === 'custom'} data-testid="button-mode-sample">Illustrative sample</button>
                <button type="button" className={syllabusMode === 'pdf' ? 'mode-tab active' : 'mode-tab'} onClick={() => { setSyllabusMode('pdf'); clearResult(); }} data-testid="button-mode-pdf">Upload PDF</button>
                <button type="button" className={syllabusMode === 'paste' ? 'mode-tab active' : 'mode-tab'} onClick={() => { setSyllabusMode('paste'); clearResult(); }} data-testid="button-mode-paste">Paste text</button>
              </div>
              {domainId === 'custom' && <p className="sample-disclaimer">Built-in syllabi are available for ECE, CSE/CS, and AI/ML. For a custom domain, upload or paste your syllabus.</p>}
              {syllabusMode === 'sample' && (
                <div className="sample-picker">
                  <label className="field-label" htmlFor="sample-domain">Built-in demonstration <span>Illustrative only</span></label>
                  <select id="sample-domain" className="role-select" value={selectedSampleDomain} onChange={(event) => {
                    const nextSample = event.target.value as Exclude<DomainId, 'custom'>;
                    setSelectedSampleDomain(nextSample);
                    if (syllabus?.isSample && syllabus.sampleDomainId !== nextSample) setSyllabus(null);
                    clearResult();
                  }} data-testid="select-sample-domain">
                    {DOMAIN_OPTIONS.filter((option) => option.id !== 'custom').map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                  <p className="sample-disclaimer">Examples are illustrative, not institution-verified. Each demo uses its bundled sample job description and the same local analyzer.</p>
                  <div className="sample-actions">
                    <button type="button" className="choose-button" onClick={() => loadSample()} data-testid="button-load-sample">Load sample inputs</button>
                    <button type="button" className="primary-button demo-button" onClick={() => loadSample(selectedSampleDomain, true)} disabled={busy} data-testid="button-run-domain-demo">Run {selectedSampleDomain === 'ece' ? 'ECE' : selectedSampleDomain === 'cse' ? 'CSE/CS' : 'AI/ML'} demo</button>
                  </div>
                  {syllabus?.isSample && <p className="sample-ready" data-testid="status-sample-ready">Loaded: {syllabus.fileName}</p>}
                </div>
              )}
              {syllabusMode === 'paste' && (
                <div className="paste-panel">
                  <label className="field-label" htmlFor="syllabus-paste">Syllabus text <span>Processed locally</span></label>
                  <textarea id="syllabus-paste" className="syllabus-paste" value={pastedSyllabus} onChange={(event) => { setPastedSyllabus(event.target.value); clearResult(); }} placeholder="Paste course titles, topics, labs, and project descriptions…" data-testid="input-syllabus-text" />
                  <p className="upload-desc">Pasted text is analyzed in this browser and is not labeled as sample data.</p>
                </div>
              )}
              {syllabusMode === 'pdf' && <div
                className={`upload-card${dragging ? ' dragging' : ''}`}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                data-testid="dropzone-syllabus"
              >
                <input ref={fileInput} className="hidden-file" type="file" accept=".pdf,application/pdf" onChange={onFileChange} aria-label="Choose syllabus PDF" data-testid="input-syllabus-file" />
                <div className="upload-icon">{activityLabel === 'Reading PDF…' ? <LoaderCircle size={19} className="spin" /> : <FileText size={20} />}</div>
                <div className="upload-content">
                  {activityLabel === 'Reading PDF…' ? (
                    <>
                      <h3 className="upload-title">Reading syllabus PDF…</h3>
                      <p className="upload-desc">Extracting selectable text on this device · {progress}%</p>
                      <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                    </>
                  ) : syllabus && !syllabus.isSample ? (
                    <>
                      <p className="file-name" data-testid="text-syllabus-filename">{syllabus.fileName}</p>
                      <p className="upload-desc">{syllabus.pageCount ? `${syllabus.pageCount} pages · ` : ''}Syllabus text ready</p>
                      <div className="upload-actions">
                        <button type="button" className="choose-button" onClick={() => fileInput.current?.click()} data-testid="button-replace-syllabus"><RefreshCw size={12} /> Replace PDF</button>
                        <button type="button" className="small-button" onClick={() => { setSyllabus(null); clearResult(); }} data-testid="button-remove-syllabus"><X size={12} /> Remove</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="upload-title">Drop a syllabus PDF here</h3>
                      <p className="upload-desc">Text-based PDF, up to 25 MB. Scanned PDFs are not supported.</p>
                      <div className="upload-actions"><button type="button" className="choose-button" onClick={() => fileInput.current?.click()} data-testid="button-choose-syllabus"><Upload size={12} /> Choose PDF</button><span className="upload-desc">or drag it in</span></div>
                    </>
                  )}
                </div>
              </div>}
            </div>

            <div>
              <div className="field-label">04 / Job descriptions <span>{usableJobs.length} with text</span></div>
              <div className="job-list">
                {jobs.map((job, index) => (
                  <article className="job-card" key={job.id} data-testid={`card-job-${index}`}>
                    <div className="job-top">
                      <input
                        className="job-title"
                        aria-label={`Job description ${index + 1} source title`}
                        placeholder={`Source title (e.g. Company · ${roleOptions.find((role) => role.id === roleId)?.label ?? (customRoleTitle || 'target role')})`}
                        value={job.title}
                        onChange={(event) => updateJob(job.id, 'title', event.target.value)}
                        data-testid={`input-job-title-${index}`}
                      />
                      <button type="button" className="job-remove" aria-label={`Remove job description ${index + 1}`} onClick={() => removeJob(job.id)} data-testid={`button-remove-job-${index}`}><Trash2 size={14} /></button>
                    </div>
                    <textarea
                      className="job-text"
                      aria-label={`Job description ${index + 1} text`}
                      placeholder="Paste the responsibilities and qualifications from a job ad…"
                      value={job.text}
                      onChange={(event) => updateJob(job.id, 'text', event.target.value)}
                      data-testid={`input-job-text-${index}`}
                    />
                  </article>
                ))}
                <button type="button" className="add-job" onClick={addJob} data-testid="button-add-job"><Plus size={14} /> Add another job description</button>
              </div>
            </div>
          </div>

          {error && <div className="error-message" role="alert" data-testid="status-analysis-error"><AlertCircle size={15} /> <span>{error}</span></div>}
          <div className="builder-footer">
            <div className="method-note"><ShieldCheck size={14} /> Private by design · no accounts, APIs, or external AI</div>
            <div className="action-buttons">
              {(syllabus || result || usableJobs.some((job) => job.text)) && <button type="button" className="text-button" onClick={reset} data-testid="button-reset">Reset</button>}
              <button type="button" className="primary-button" onClick={runAnalysis} disabled={busy} data-testid="button-run-analysis">
                {busy ? <><LoaderCircle size={14} className="spin" /> {activityLabel || 'Working…'}</> : <>Run skill-gap radar <ArrowRight size={14} /></>}
              </button>
            </div>
          </div>
          <p className="sample-row">Quick demonstrations: {(['ece', 'cse', 'ai-ml'] as const).map((sampleDomain) => <button key={sampleDomain} type="button" className="sample-button" onClick={() => loadSample(sampleDomain, true)} disabled={busy} data-testid={`button-demo-${sampleDomain}`}>Run {sampleDomain === 'ece' ? 'ECE' : sampleDomain === 'cse' ? 'CSE/CS' : 'AI/ML'} demo</button>)}</p>
        </section>

        <div className="method-strip" data-testid="text-method-summary">
          <strong>How the radar reads</strong>
            <span>Deterministic keyword matching against a curated domain-and-role taxonomy. Coverage weights each covered skill as 1, partial as 0.5, and missing as 0. Evidence is inspectable; no semantic AI or hidden scoring.</span>
          <span className="method-count">{roleSkillCount} role skills in taxonomy</span>
        </div>

        {busy && result === null && (
          <section className="panel welcome" aria-live="polite" data-testid="status-analysis-loading">
            <div className="welcome-mark"><ScanSearch size={24} /></div>
            <div><h2>{activityLabel || 'Following the evidence'}</h2><p>{activityLabel === 'Reading PDF…' ? `Extracting text locally · ${progress}% complete` : 'Comparing role-specific phrases with syllabus coverage…'}</p><div className="skeleton" style={{ marginTop: 12 }} /></div>
          </section>
        )}

        {result ? (
          <Results
            result={result}
            expandedSkills={expandedSkills}
            onToggleEvidence={toggleEvidence}
              onRetry={runAnalysis}
          />
        ) : !busy ? (
          <section className="panel welcome" aria-label="How the skill-gap radar works">
            <div className="welcome-mark"><FlaskConical size={24} /></div>
            <div><h2>A practical map, not a verdict.</h2><p>Start with a role and real job-ad language. The radar reports only the skills its transparent taxonomy recognizes, quotes the matching evidence, and proposes focused additions for you to consider.</p></div>
          </section>
        ) : null}

        <section className="how-section" aria-label="Analysis steps">
          <div className="how-step"><span className="step-num">1</span><div><h3>Bring the source material</h3><p>A selected domain and role, sample or syllabus text, and job descriptions.</p></div></div>
          <div className="how-step"><span className="step-num">2</span><div><h3>Inspect matching phrases</h3><p>Role skills are matched with exact keyword evidence.</p></div></div>
          <div className="how-step"><span className="step-num">3</span><div><h3>Choose a small next step</h3><p>Review suggested topics and labs; nothing changes automatically.</p></div></div>
        </section>
        <footer className="footer-note">Syllabus Drift Radar <span aria-hidden="true">·</span> Team VeriNexus <span aria-hidden="true">·</span> Offline-first hackathon prototype</footer>
      </main>
    </div>
  );
}

function Results({
  result,
  expandedSkills,
  onToggleEvidence,
  onRetry,
}: {
  result: RadarAnalysis;
  expandedSkills: string[];
  onToggleEvidence: (id: string) => void;
  onRetry: () => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, SkillAssessment[]>();
    result.skills.forEach((assessment) => map.set(assessment.skill.category, [...(map.get(assessment.skill.category) ?? []), assessment]));
    return [...map.entries()];
  }, [result]);
  const recommendationSkills = result.skills.filter((item) => item.status !== 'covered');

  return (
    <section className="results" id="results" aria-live="polite" data-testid="section-results">
      <div className="results-top">
        <div><div className="results-kicker">SKILL GAP REVIEW / {result.domainLabel.toUpperCase()} · {result.roleLabel.toUpperCase()}</div><h2>Here’s where to look closer.</h2>{result.isSample && <span className="sample-label" data-testid="status-sample"><Sparkles size={11} /> ILLUSTRATIVE SAMPLE · NOT INSTITUTION-VERIFIED</span>}</div>
        <div className="result-context"><div data-testid="text-result-filename">{result.syllabusFileName}</div><div>{result.skills.length} skills surfaced from {result.taxonomySkillCount} taxonomy entries</div></div>
      </div>

      {result.isSample && <div className="provenance-note" data-testid="text-sample-provenance">Illustrative built-in syllabus text, not verified against a real institution. Bundled sample job ads are marked SAMPLE AD. This demonstrates phrase matching; it is not a curriculum audit.</div>}
      <div className="coverage-banner" data-testid="value-coverage-percent"><div><span>Weighted skill coverage</span><small>Covered = 1 · Partial = 0.5 · Missing = 0</small></div><strong>{result.summary.coveragePercent}%</strong><div className="coverage-track" aria-label={`${result.summary.coveragePercent}% weighted skill coverage`}><span style={{ width: `${result.summary.coveragePercent}%` }} /></div></div>

      <div className="summary-grid" aria-label="Skill coverage summary">
        <div className="summary-item"><span>Skills found in job ads</span><strong data-testid="value-skills-required">{result.summary.required}</strong></div>
        <div className="summary-item covered"><span>Covered · hands-on cue</span><strong data-testid="value-covered-count">{result.summary.covered}</strong></div>
        <div className="summary-item partial"><span>Partial · mention only</span><strong data-testid="value-partial-count">{result.summary.partial}</strong></div>
        <div className="summary-item missing"><span>Missing · not found</span><strong data-testid="value-missing-count">{result.summary.missing}</strong></div>
      </div>

      <div className="result-layout">
        <section className="panel skill-panel" aria-labelledby="skill-results-title">
          <div className="panel-title-row"><h3 id="skill-results-title">Role-specific skill evidence</h3><span>{result.domainLabel} / {result.roleLabel} / {result.skills.length} signals</span></div>
          <div className="skill-list">
            {grouped.map(([category, assessments]) => (
              <div key={category}>
                <div className="panel-title-row"><h3>{category}</h3><span>{assessments.length} skills</span></div>
                {assessments.map((assessment) => (
                  <SkillRow
                    key={assessment.skill.id}
                    assessment={assessment}
                    expanded={expandedSkills.includes(assessment.skill.id)}
                    onToggle={() => onToggleEvidence(assessment.skill.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>

        <aside className="panel recommend-panel">
          <div className="panel-title-row"><h3>Small changes to consider</h3><span>{recommendationSkills.length} ideas</span></div>
          {recommendationSkills.length ? (
            <div className="recommend-list">
              {recommendationSkills.map((item) => (
                <article className="recommend-item" key={item.skill.id} data-testid={`recommendation-${item.skill.id}`}>
                  <div className="rec-top"><span className="rec-skill">{item.skill.name}</span><span className="rec-status">{item.status}</span></div>
                  <div className="rec-subject">Suggested subject · {item.recommendedSubject}</div>
                  <p className="rec-change">{item.proposedChange}</p>
                </article>
              ))}
            </div>
          ) : <div className="recommend-item"><p className="rec-change">Every surfaced skill has a hands-on cue in the syllabus. No additions suggested by this run.</p></div>}
        </aside>
      </div>

      <section className="panel before-after" aria-labelledby="curriculum-heading">
        <div className="before-after-head"><div><h3 id="curriculum-heading">Curriculum view</h3><p>Suggested additions are preview-only; your source text is untouched.</p></div><span className="not-applied">NOT APPLIED</span></div>
        <div className="before-after-grid">
          <div className="curriculum-column">
            <div className="curriculum-label"><BookOpen size={12} /> BEFORE · SYLLABUS EVIDENCE</div>
            {recommendationSkills.length ? recommendationSkills.map((item) => (
              <article className="curriculum-change" key={item.skill.id}>
                <strong>{item.skill.name}</strong>
                <span>{item.recommendedSubject}</span>
                <pre className="curriculum-text">{item.before.join('\n')}</pre>
              </article>
            )) : <p className="curriculum-empty">No proposed curriculum changes for this analysis.</p>}
            <div className="sr-only" data-testid="text-before-curriculum">{recommendationSkills.map((item) => item.before.join('\n')).join('\n\n')}</div>
          </div>
          <div className="curriculum-column">
            <div className="curriculum-label"><Plus size={12} /> AFTER · SUGGESTED CURRICULUM</div>
            {recommendationSkills.length ? recommendationSkills.map((item) => (
              <article className="curriculum-change proposed" key={item.skill.id}>
                <strong>{item.skill.name}</strong>
                <span>{item.recommendedSubject}</span>
                <pre className="curriculum-text">{item.after.join('\n')}</pre>
              </article>
            )) : <p className="curriculum-empty">No additions suggested from this analysis.</p>}
            <div className="sr-only" data-testid="text-suggested-additions">{recommendationSkills.map((item) => item.after.join('\n')).join('\n\n')}</div>
          </div>
        </div>
      </section>

      <div className="tax-card" data-testid="text-taxonomy-explanation">
        <h3><CircleHelp size={12} style={{ verticalAlign: 'middle', marginRight: 5 }} /> Taxonomy & method</h3>
        <p>We check {result.taxonomySkillCount} curated skill definitions relevant to {result.domainLabel.toLowerCase()} and {result.roleLabel.toLowerCase()}, each with inspectable aliases. Only phrases found in the job-description text are included below. Evidence quotes preserve the matching sentence and source title. Weighted coverage is covered = 1, partial = 0.5, missing = 0. It is a phrase match plus a hands-on cue on the same or neighboring syllabus line—not a judgment of course quality or graduate readiness.</p>
      </div>
      <div className="result-actions"><button type="button" className="text-button" onClick={onRetry} data-testid="button-try-again">Run this analysis again <ArrowRight size={12} /></button></div>
    </section>
  );
}

function SkillRow({ assessment, expanded, onToggle }: { assessment: SkillAssessment; expanded: boolean; onToggle: () => void }) {
  const statusLabel: Record<SkillStatus, string> = { covered: 'Covered', partial: 'Partial', missing: 'Missing' };
  const StatusIcon = assessment.status === 'covered' ? Check : assessment.status === 'partial' ? CircleHelp : X;
  return (
    <article className="skill-row" data-testid={`skill-${assessment.skill.id}`}>
      <div className="skill-main">
        <div><h4 className="skill-name">{assessment.skill.name}</h4><span className="skill-category">Aliases: {assessment.skill.aliases.slice(0, 4).join(' · ')}</span></div>
        <span className={`status-pill ${assessment.status}`} data-testid={`status-skill-${assessment.skill.id}`}><StatusIcon size={11} />{statusLabel[assessment.status]}</span>
      </div>
      <div className="skill-summary">
        {assessment.status === 'covered' ? `${assessment.syllabusEvidence[0] ?? 'Hands-on syllabus evidence found.'} Practical cue detected nearby.` : assessment.status === 'partial' ? `Mentioned without a nearby practice cue: ${assessment.syllabusEvidence.join(' · ')}` : 'No matching skill phrase found in the syllabus text.'}
      </div>
      <button type="button" className="evidence-toggle" onClick={onToggle} aria-expanded={expanded} data-testid={`button-evidence-${assessment.skill.id}`}>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {expanded ? 'Hide' : 'View'} job-ad evidence ({assessment.jobEvidence.length})
      </button>
      {expanded && (
        <div className="evidence-content" data-testid={`evidence-${assessment.skill.id}`}>
          <div className="evidence-source">JOB DESCRIPTION MATCHES</div>
          {assessment.jobEvidence.length ? assessment.jobEvidence.map((evidence, index) => <div className="evidence-group" key={`${evidence.source}-${index}`}><div className="evidence-source">{evidence.source}</div><blockquote className="quote">“{evidence.excerpt}”</blockquote></div>) : <p className="no-evidence">No exact keyword evidence was returned.</p>}
          <div className="evidence-source" style={{ marginTop: 10 }}>SYLLABUS MATCHES</div>
          {assessment.syllabusEvidence.length ? assessment.syllabusEvidence.map((line, index) => <blockquote className="quote" key={`${line}-${index}`}>{line}</blockquote>) : <p className="no-evidence">No matching syllabus phrase.</p>}
        </div>
      )}
    </article>
  );
}

export default App;
