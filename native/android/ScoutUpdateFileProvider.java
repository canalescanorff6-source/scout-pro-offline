package br.com.scoutpro.offline;

import androidx.core.content.FileProvider;

/**
 * FileProvider exclusivo do atualizador do Scout PRO.
 *
 * O Capacitor registra seu proprio androidx.core.content.FileProvider sob
 * br.com.scoutpro.offline.fileprovider. Usar o mesmo android:name em outra
 * entrada <provider> provoca a fusao de manifests e o erro:
 * "The authority ...scoutupdate.files does not match ...fileprovider".
 *
 * Uma classe distinta impede esse conflito de merge e mantem o escopo
 * limitado a cache/scout-updates por @xml/scout_update_paths.
 */
public class ScoutUpdateFileProvider extends FileProvider {
}
