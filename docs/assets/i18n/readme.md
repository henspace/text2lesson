#i18n With the exception of en.json, translation files are placed here.

The English master file, en.json is created automatically by the build process.
Translations are controlled by using template literals with an _i18n_ tag
function. Only single line literals are processed. During the build process, the
final javascript bundle is processed and the strings are replaced by template
literals beginning with a hash of the original text. The extracted original
definitions are extracted to the master language file. This can then be used to
create translations. Refer to _tools\i18n-build-tools.js_ for more details.

Translation files are json files containing key and value entries. The _key_
contains the hash of the original translation. The _value_ contains the
translated value.

Replacement values are inserted in the template at ocations marked with
<span>$</span>{n}, where n is the index of the replacement provided in the
values. If n is omitted or is not a number, the index used is derived from it's
position in the template. So these are equivalent:

- 'This is my <span>$</span>{0} replacement <span>$</span>{1} string'
- 'This is my <span>$</span>{} replacement <span>$</span>{} string'
- 'This is my
  <span>$</span>{BUILD-INFO.date()} replacement <span>$</span>{BUILD-INFO.mode()}
  string'

This means it is only necessary to amend the original placeholders if it is
necessary to rearrange the position of the strings.

The location of files is controlled by following options in the _config_
property of _package.json_.

- "i18nMasterLanguage": "en",
- "i18nAssetsDirRelToSource": "assets/i18n",

The master file, will be created in the _i18nAssetsDirRelToSource_ folder.
Translations should also be placed here.

Reports about the status of translations will be created in the folder defined
by _buildReportDir_ in _config_ property of _package.json_. These reports will
identify and missing or unused translations contained in the translations.
