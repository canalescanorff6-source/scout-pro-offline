const repoFull = process.env.GITHUB_REPOSITORY || process.env.SCOUT_GITHUB_REPOSITORY || 'canalescanorff6-source/scout-pro-offline';
const [owner, repo] = repoFull.split('/');
if (!owner || !repo) throw new Error('Configure GITHUB_REPOSITORY=owner/repository');
module.exports = {
  appId: 'br.com.scoutpro.offline', productName: 'Scout PRO',
  directories: { output: 'dist' },
  files: ['desktop/**/*', 'web/**/*', 'package.json', '!web/prints_originais_226_a_246/**/*'],
  extraMetadata: { name: 'scout-pro-elite-offline' },
  win: { icon: 'web/assets/icon.ico', target: ['nsis'], verifyUpdateCodeSignature: false, artifactName: 'ScoutPRO-Setup-${version}.${ext}' },
  nsis: { oneClick: false, allowToChangeInstallationDirectory: true, perMachine: false },
  publish: [{ provider: 'github', owner, repo, releaseType: 'release' }],
  asar: true,
};
