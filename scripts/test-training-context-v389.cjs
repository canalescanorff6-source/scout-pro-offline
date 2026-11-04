'use strict';

const assert = require('node:assert/strict');
const Positional = require('../web/craque-positional-v311.js');
const Sheet = require('../web/craque-main-sheet-v378.js');
const Planner = require('../web/craque-style-planner-v303.js');
const deps = {
  training: require('../web/craque-friends-training-v228.js'),
  skills: require('../web/skills-booster-v162.js'),
  boosters: require('../web/booster-engine-v103.js'),
  tactical: require('../web/scout-multitactic-engine-v220.js')
};
const { cards } = require('../web/SCOUT_V69_AUDITORIA.json');
const { cards: references } = require('../web/ct376-card-references.json');
const audit = require('../web/ct389-training-repetitions.json');
const selection = { audit, managerId: 'CT-MGR-071' };

function context(capture, position, tactic = 'rapido') {
  const source = cards.find(card => card.numero === capture);
  const model = Positional.fromPersonal(source);
  const role = position || model.position;
  const card = Sheet.cardFromModel(model, role);
  const reference = references.find(entry => entry.cardKey === model.cardKey);
  const outcome = Positional.compute(model, role, tactic, selection.managerId, { ...deps, reference }).outcome;
  return { source, card, reference, outcome };
}

function resolve({ card, reference, outcome }, options = {}) {
  return Sheet.resolve(card, outcome, { ...selection, reference, ...options }, deps);
}

const nihat = context(37);
const aubameyang = context(183);
const first = resolve(nihat);
const second = resolve(aubameyang);
assert.equal(first.review.spent, 62);
assert.equal(second.review.spent, 62);
assert.notDeepEqual(first.review.proposed, second.review.proposed);
assert.deepEqual(nihat.outcome.plan.levels, first.review.proposed);
assert.deepEqual(aubameyang.outcome.plan.levels, second.review.proposed);
assert.equal(first.result.plan.analysis.status, 'documentada');
assert.equal(second.result.plan.analysis.status, 'documentada');
assert.notEqual(first.result.plan.analysis.evidenceSignature, second.result.plan.analysis.evidenceSignature);
const preview = Planner.proposal({ ...nihat.source, reference: nihat.reference }, 'rapido', nihat.source.niveis);
assert.deepEqual(preview.levels, first.review.proposed);

const nihatSA = context(37, 'SA');
const shifted = resolve({ ...nihatSA, outcome: nihat.outcome });
assert.equal(shifted.review.position, 'SA');
assert.equal(shifted.result.plan.analysis.context[3], 'SA');
assert.equal(shifted.review.spent, 62);
const staleEdition = resolve({ ...aubameyang, outcome: nihat.outcome });
assert.deepEqual(staleEdition.review.proposed, second.review.proposed);
assert.equal(staleEdition.result.plan.analysis.reference.cardId, aubameyang.card.cardId);
const missingBudget = resolve({ ...nihat, card: { ...nihat.card, pp: null, level: null } });
assert.equal(missingBudget.review.pp, null);
assert.equal(missingBudget.review.proposed, null);
assert(missingBudget.review.pending.includes('nível e PP'));
const beckhamMAT = resolve(context(4, 'MAT'));
assert(!beckhamMAT.result.plan.evidence.some(reason => reason.startsWith('Orquestrador:')));
assert(resolve(context(4)).result.plan.evidence.some(reason => reason.startsWith('Orquestrador:')));
const rijkaard = resolve(context(104));
const tchouameni = resolve(context(107));
assert.equal(rijkaard.review.spent, 64);
assert.equal(tchouameni.review.spent, 64);
assert.notDeepEqual(rijkaard.review.proposed, tchouameni.review.proposed);
assert.equal(resolve(context(191, 'CA')).review.position, 'CA');
assert.equal(resolve(context(246)).result.plan.analysis.status, 'dados_insuficientes');

const mbappe = context(49);
const thuram = context(182);
const sameVector = resolve(mbappe);
assert.deepEqual(sameVector.review.proposed, resolve(thuram).review.proposed);
assert(sameVector.review.repetitionAudit.documentedPairs > 0);
assert.equal(resolve(mbappe, { managerId: 'CT-MGR-001' }).review.repetitionAudit, null);
assert.equal(resolve(mbappe, { reference: nihat.reference }).result.plan.analysis.status, 'dados_insuficientes');
assert.equal(resolve(mbappe, { reference: nihat.reference }).review.repetitionAudit, null);
const manual = [0, 4, 4, 4, 0, 0, 0, 0, 0, 0];
const saved = resolve(mbappe, { levels: manual, skills: [], booster: '', source: 'profile' });
assert.deepEqual(saved.review.proposed, manual);
assert.equal(saved.review.spent, 12);
assert.deepEqual(saved.review.skills, []);
assert.deepEqual(saved.review.boosters, []);
assert.deepEqual(saved.result.booster.alternatives, []);
assert.equal(saved.review.repetitionAudit, null);
assert.equal(saved.result.plan.analysis, null);
console.log('V389 PASS: edição, posição, técnico, ficha manual, coincidência e prévia.');
