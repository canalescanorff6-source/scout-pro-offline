'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const web = path.join(root, 'web');
const Positional = require('../web/craque-positional-v311.js');
const MainSheet = require('../web/craque-main-sheet-v378.js');
const Rating = require('../web/craque-rating-v376.js');
const Managers = require('../web/craque-managers-v302.js');
const deps = {
  training: require('../web/craque-friends-training-v228.js'),
  skills: require('../web/skills-booster-v162.js'),
  boosters: require('../web/booster-engine-v103.js'),
  tactical: require('../web/scout-multitactic-engine-v220.js'),
  managers: {
    find: id => id === Managers.KOVAC_20261022.catalog_id ? Managers.KOVAC_20261022 : null,
    proficiency: Managers.proficiency
  }
};
const { training, tactical } = deps;
const schema = 'CRAQUE_TRAINING_AUDIT_V389';
const managerId = Managers.KOVAC_20261022.catalog_id;
const datasets = ['SCOUT_V69_AUDITORIA.json', 'ct364-owned-cards.json', 'ct376-card-references.json'];
const normalize = value => String(value || '').normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase();
const digest = value => createHash('sha256').update(value).digest('hex');
const asJson = value => JSON.stringify(value);

function publicEvidence(card, entry) {
  const ref = entry?.reference;
  const usable = entry?.identityUsable === true && entry.cardKey === card.localKey &&
    /^\d+$/.test(String(card.cardId)) && String(card.cardId) === ref?.cardId &&
    [entry.edition, ref.edition].includes(card.edition);
  if (!usable) return { status: 'sem_base_exata' };
  const stats = ref.baseStats || {};
  const complete = new Set(Rating.GROUPS.flat()).size === Object.keys(stats).length &&
    Rating.GROUPS.flat().every(key => Number.isInteger(stats[key]) && stats[key] >= 0 && stats[key] <= 120) &&
    /^https:\/\/pesdb\.net\/efootball\/players\//.test(ref.url) &&
    /^[a-f\d]{64}$/.test(ref.htmlSha256);
  return {
    status: complete ? 'base_publica_da_edicao' : 'referencia_sem_base_completa',
    binding: entry.identityStatus,
    url: ref.url,
    sha256: ref.htmlSha256,
    accountConfirmed: ref.accountConfirmed === true,
    height: ref.height ?? null,
    baseStats: complete ? stats : null
  };
}

function auditedScenario(key, style, card, outcome, reference) {
  const { result, review } = MainSheet.resolve(card, outcome, {
    source: 'proposal', reference, managerLabel: Managers.KOVAC_20261022.nome
  }, deps);
  const budget = result.plan.pp ?? null;
  const vector = review.proposed ?? null;
  const cost = vector ? tactical.total(vector) : null;
  const analysis = result.plan.analysis ?? review.individualAnalysis ?? null;
  const source = analysis?.reference;
  const expectedSource = reference?.reference;
  const identityMatches = review.identity?.localKey === card.localKey &&
    review.identity.cardId === String(card.cardId || '') && review.identity.edition === String(card.edition || '') &&
    review.tactic === style && review.position === Positional.normalize(card.position) &&
    (!source || source.cardId === String(card.cardId) && source.edition === expectedSource?.edition &&
      source.htmlSha256 === expectedSource?.htmlSha256);
  return {
    key: key + '|' + style,
    cardKey: key,
    localKey: card.localKey,
    name: card.name,
    cardId: card.cardId || null,
    edition: card.edition || null,
    position: Positional.normalize(card.position),
    individualStyle: card.style,
    defensiveStyle: card.defenceStyle || null,
    managerId,
    style,
    budget,
    budgetSource: outcome.progress.source,
    vector,
    cost,
    fixedProgression: review.fixedProgression === true,
    source: review.competitiveReview ? 'editorial' : review.sourceKind,
    identityMatches,
    analysis,
    prioritySignals: result.plan.evidence || [],
    evidence: publicEvidence(card, reference),
    nativeSkills: review.nativeSkills,
    fixedBooster: review.fixedBooster,
    skills: review.skills.map(item => item.name),
    booster: review.boosters[0]?.name ?? null
  };
}

function ownedEngineCard(card, reference) {
  const data = Rating.ownedMetadata(card, {}, reference);
  return {
    localKey: card.key,
    name: card.name,
    position: card.position,
    originalPosition: card.position,
    style: card.style,
    defenceStyle: card.secondaryStyle || '',
    level: data.level,
    pp: null,
    cardId: data.cardId,
    edition: data.engineEdition || '',
    reference,
    managerId,
    nativeSkills: card.observed.nativeSkills.join('; '),
    skills: '',
    fixedBooster: '',
    booster: '',
    boosterSlot: 'pendente',
    trainingLevels: ''
  };
}

function classifyPair(left, right) {
  const bothExact = Boolean(left.evidence.baseStats && right.evidence.baseStats);
  const differences = [];
  if (bothExact && asJson(left.evidence.baseStats) !== asJson(right.evidence.baseStats)) differences.push('atributos_base');
  if (bothExact && left.evidence.height !== right.evidence.height) differences.push('altura');
  if (left.nativeSkills.length && right.nativeSkills.length &&
      asJson(left.nativeSkills.map(normalize).sort()) !== asJson(right.nativeSkills.map(normalize).sort())) differences.push('nativas');
  if (left.defensiveStyle && right.defensiveStyle &&
      normalize(left.defensiveStyle) !== normalize(right.defensiveStyle)) differences.push('estilo_defensivo');
  const leftFixed = deps.boosters.boosterName(left.fixedBooster);
  const rightFixed = deps.boosters.boosterName(right.fixedBooster);
  if (leftFixed && rightFixed && leftFixed !== rightFixed) differences.push('impeto_fixo');

  const pair = { cards: [left.cardKey, right.cardKey], bothExact, differences };
  if (left.identityMatches === false || right.identityMatches === false)
    return { ...pair, classification: 'D', triage: null, reason: 'Identidade do cálculo ou da ficha diverge do contexto solicitado.' };
  const individuallyAnalyzed = row => row.analysis?.reference && ['documentada', 'calculada'].includes(row.analysis.status);
  if (bothExact && individuallyAnalyzed(left) && individuallyAnalyzed(right))
    return { ...pair, classification: 'A', triage: null, reason: 'As análises das duas edições chegaram ao mesmo vetor com o mesmo custo.' };
  if (left.analysis?.status === 'dados_insuficientes' || right.analysis?.status === 'dados_insuficientes' || !differences.length)
    return { ...pair, classification: 'C', triage: null, reason: 'A evidência disponível não basta para distinguir as propostas deste par.' };
  // A difference in source data alone does not prove a missed relevant input.
  return { ...pair, classification: null, triage: 'B_a_investigar', reason: 'Diferenças documentadas sem análise individual rastreável dos dois lados.' };
}

function repeatedGroups(scenarios) {
  const groups = new Map();
  for (const row of scenarios) {
    if (!row.vector || row.budget === 0 || row.cost !== row.budget) continue;
    const fields = [row.style, row.position, normalize(row.individualStyle), row.budget, row.vector];
    const key = asJson(fields);
    if (!groups.has(key)) groups.set(key, { fields, members: [] });
    groups.get(key).members.push(row);
  }
  return [...groups.values()].filter(group => group.members.length > 1).map(group => {
    const [style, position, individualStyle, budget, vector] = group.fields;
    const pairs = [];
    for (const [i, left] of group.members.entries()) {
      for (const right of group.members.slice(i + 1)) pairs.push(classifyPair(left, right));
    }
    return { style, position, individualStyle, budget, vector, cards: group.members.map(row => row.cardKey), pairs };
  });
}

function summarizeRepetitions(groups) {
  const pairs = groups.flatMap(group => group.pairs);
  return {
    groups: groups.length,
    pairs: pairs.length,
    pairsWithPublicBaseForBoth: pairs.filter(pair => pair.bothExact).length,
    triageB: pairs.filter(pair => pair.triage === 'B_a_investigar').length,
    classifications: Object.fromEntries(['A', 'B', 'C', 'D'].map(code =>
      [code, pairs.filter(pair => pair.classification === code).length]))
  };
}

function generateIndex(report) {
  const entries = {};
  const scenarios = new Map(report.scenarios.map(row => [row.key, row]));
  for (const group of report.groups.filter(group => group.style !== 'posse')) {
    for (const cardKey of group.cards) {
      const pairs = group.pairs.filter(pair => pair.cards.includes(cardKey));
      const documentedPairs = pairs.filter(pair => pair.classification === 'A').length;
      const pendingPairs = pairs.filter(pair => pair.classification === 'C').length;
      if (documentedPairs + pendingPairs === 0) continue;
      const row = scenarios.get(cardKey + '|' + group.style);
      entries[row.localKey + '|' + row.style] = {
        cardId: row.cardId,
        edition: row.edition,
        position: row.position,
        pp: row.budget,
        levels: row.vector,
        evidenceSignature: row.analysis?.evidenceSignature ?? null,
        documentedPairs,
        pendingPairs
      };
    }
  }
  return { schema: 'CRAQUE_TRAINING_REPETITIONS_V389', managerId: report.managerId, entries };
}

function compare(before, after) {
  if (before.schema !== schema || before.managerId !== after.managerId ||
      asJson(before.summary.cards) !== asJson(after.summary.cards) ||
      before.scenarios.length > after.scenarios.length) throw Error('Linha de base incompatível.');
  const original = new Map(before.scenarios.map(row => [row.key, row]));
  const updated = new Map(after.scenarios.map(row => [row.key, row]));
  if (original.size !== before.scenarios.length || updated.size !== after.scenarios.length)
    throw Error('Contextos duplicados na comparação.');
  const resolvedIdentities=[];
  const currentReferences=JSON.parse(fs.readFileSync(path.join(web,'ct376-card-references.json'),'utf8')).cards;
  const changes = after.scenarios.flatMap(row => {
    const previous = original.get(row.key);
    if(!previous)return [];
    if(previous.cardId!==row.cardId||previous.edition!==row.edition){
      const entry=currentReferences.find(ref=>ref.key===row.key.split('|')[0]);
      const proof=entry?.publicIdentityV393;
      if(!proof||proof.catalogueId!==previous.cardId||proof.catalogueEdition!==previous.edition||
         entry.reference?.cardId!==row.cardId||entry.reference?.edition!==row.edition)
        throw Error('Identidade mudou sem vínculo público auditado para '+row.key);
      resolvedIdentities.push(row.key);
    }
    if (previous.position !== row.position)
      throw Error('Identidade ou posição mudou para ' + row.key);
    return asJson(previous.vector) === asJson(row.vector) ? [] : [{
      key: row.key, name: row.name, before: previous.vector, after: row.vector,
      beforeBudget: previous.budget, afterBudget: row.budget
    }];
  });
  let previouslyFlaggedPairsSeparated = 0;
  for (const group of before.groups) {
    for (const pair of group.pairs.filter(pair => pair.triage === 'B_a_investigar')) {
      const [left, right] = pair.cards.map(key => updated.get(key + '|' + group.style));
      if (left.vector && right.vector && asJson(left.vector) !== asJson(right.vector)) previouslyFlaggedPairsSeparated++;
    }
  }
  return {
    baselineRevision: before.revision,
    unchangedInputs: asJson(before.inputSha256) === asJson(after.inputSha256),
    unchangedCardCatalogues:datasets.filter(file=>file!=='ct376-card-references.json')
      .every(file=>before.inputSha256[file]===after.inputSha256[file]),
    resolvedIdentities,
    addedScenarios:after.scenarios.filter(row=>!original.has(row.key)).map(row=>row.key),
    changedVectors: changes.length,
    changesByStyle: Object.fromEntries(training.MODES.map(style => [style, changes.filter(row => row.key.endsWith('|' + style)).length])),
    beforeRepetitions: before.summary.repetitions,
    afterRepetitions: after.summary.repetitions,
    previouslyFlaggedPairsSeparated,
    changes
  };
}

function generate() {
  const raw = datasets.map(file => fs.readFileSync(path.join(web, file), 'utf8'));
  const [originals, owned, references] = raw.map(text => JSON.parse(text).cards);
  const refs = new Map(references.map(entry => [entry.key, entry]));
  const scenarios = [];
  for (const card of originals) {
    const model = Positional.fromPersonal(card);
    const key = 'cap:' + card.numero;
    const reference = refs.get(key);
    for (const style of training.MODES) {
      const scenario = Positional.compute(model, model.position, style, managerId, { ...deps, reference });
      const input = { ...MainSheet.cardFromModel(model, scenario.position), managerId };
      scenarios.push(auditedScenario(key, style, { ...input, pp: scenario.outcome.plan.pp }, scenario.outcome, reference));
    }
  }
  for (const card of owned) {
    const reference = refs.get(card.key);
    const input = ownedEngineCard(card, reference);
    for (const style of training.MODES) {
      const outcome = training.evaluate(input, style, { ...deps, reference });
      scenarios.push(auditedScenario(card.key, style, input, outcome, reference));
    }
  }

  const groups = repeatedGroups(scenarios);
  return {
    schema,
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    managerId,
    scope: 'Propostas na posição original das cartas embarcadas, sem armazenamento de usuário.',
    notes: [
      'Base pública da edição e confirmação na conta são critérios separados.',
      'B em triagem exige confirmar a relevância e a ausência do sinal no cálculo. A requer rastreio individual suficiente.',
      'D exige evidência de contexto incorreto na seleção, armazenamento ou cache. Esta auditoria limpa não exercita armazenamento.',
      'Fichas de zero PP não entram nos grupos de distribuição repetida.'
    ],
    inputSha256: Object.fromEntries(datasets.map((file, i) => [file, digest(raw[i])])),
    summary: {
      cards: { originals: originals.length, owned: owned.length, total: originals.length + owned.length },
      scenarios: scenarios.length,
      publicBaseScenarios: scenarios.filter(row => row.evidence.status === 'base_publica_da_edicao').length,
      pendingVectors: scenarios.filter(row => row.vector === null).length,
      fixedProgression: scenarios.filter(row => row.fixedProgression).length,
      costErrors: scenarios.filter(row => row.vector && row.cost !== row.budget).length,
      identityErrors: scenarios.filter(row => !row.identityMatches).length,
      repetitions: summarizeRepetitions(groups),
      byStyle: Object.fromEntries(training.MODES.map(style => [style, summarizeRepetitions(groups.filter(group => group.style === style))]))
    },
    groups,
    scenarios
  };
}

function parseArgs(args) {
  const options = new Map();
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i], file = args[i + 1];
    if (!['--output', '--baseline', '--index'].includes(flag) || !file || file.startsWith('--') || options.has(flag))
      return null;
    options.set(flag, path.resolve(file));
  }
  const output = options.get('--output'), baseline = options.get('--baseline'), index = options.get('--index');
  if ((!output && !index) || new Set(options.values()).size !== options.size) return null;
  return { output, baseline, index };
}

function writeJson(file, content, indent, flag) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(content, null, indent) + '\n', { flag });
}

if (require.main === module) {
  const options = parseArgs(process.argv.slice(2));
  if (!options) {
    console.error('Uso: node scripts/audit-fichas-individuais-v389.cjs [--output <arquivo.json>] [--baseline <antes.json>] [--index <indice.json>]');
    process.exitCode = 1;
  } else {
    const { output, baseline, index } = options;
    const report = generate();
    if (baseline) report.comparison = compare(JSON.parse(fs.readFileSync(baseline, 'utf8')), report);
    if (output) writeJson(output, report, 2, 'wx');
    console.log(JSON.stringify(report.summary, null, 2));
    if (report.summary.costErrors || report.summary.identityErrors) process.exitCode = 1;
    else if (index) writeJson(index, generateIndex(report), 0, 'w');
  }
}

module.exports = { generate, compare, generateIndex };
