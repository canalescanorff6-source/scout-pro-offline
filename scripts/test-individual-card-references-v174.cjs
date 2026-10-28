'use strict';
/** Document-only evidence for two Highlight cards; NEVER grant video approval. */
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const r=json('web/SCOUT_V172_CONCLUSAO_QUATRO_VIDEOS.json');
const catalogue=json('web/SCOUT_V106_PESQUISA_VIDEOS.json');
const previous=json('web/SCOUT_V171_MATRIZ_EVIDENCIAS_246.json');
assert.equal(r.research_update_v174.new_specific_card_sources,2);
assert.equal(r.research_update_v174.new_videos_found,0);
assert.deepEqual(r.research_update_v174.card_nums,[234,235]);
assert.equal(r.research_update_v174.video_associations_unchanged,true);
assert.equal(r.research_update_v174.registered_training_and_pp_unchanged,true);
assert.equal(catalogue.cards.length,246);
assert.equal(catalogue.summary.total_videos_unicos,377);
assert.equal(catalogue.summary.total_videos,393);
assert.equal(previous.coverage.quarantined_links,44);
const data={234:{max:32,pp:62,suffix:'kakita-yuki'},235:{max:33,pp:64,suffix:'kumasaka-koki'}};
for(const c of r.cases){
 if(!data[c.cap])continue;
 const expected=data[c.cap],a=c.new_specialist_reference_v174;
 assert(a);
 assert.equal(a.url,'https://boooost.jp/efootball-'+expected.suffix+'-r-rodriguez-26-27/');
 assert(c.external_identification.sources.includes(a.url));
 assert.equal(a.max_level_reported,expected.max);
 assert.equal(a.pp_budget_derived_from_level,expected.pp);
 assert.equal(c.registered_pp_budget,expected.pp);
 assert.equal(a.matches_registered_pp,true);
 assert.equal(a.source_role,'CORROBORATION_OF_EDITION_AND_LEVEL_ONLY');
 assert.equal(a.verified_video_of_card,false);
 assert.equal(a.frame_inspected,false);
 assert.equal(a.training_used_in_game_verified,false);
 assert.equal(c.video_leads.length,2);
 assert(c.video_leads.every(v=>v.verified_exact_edition===false));
 assert.equal(c.card_id_registered,null);
}
assert.equal(r.verified_video_exact_editions,0);
assert.equal(r.new_official_associations,0);
console.log('V174 OK: 2 novas fontes individuais, zero vídeo inventado; 246 cartas e 44 reservas preservadas.');
