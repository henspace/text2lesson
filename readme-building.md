# RapidQandA

RapidQandA is an application to simplify the creation of lessons and quizzes
using a simple plain text file.

## Build process

The build process relies on [Rollup](https://rollupjs.org/) to bundle the
JavaScript modules. Although there are a number of plugins available for Rollup,
a decision has been made to minimise the number of plugins required for the
build process. At the moment no Rollup plugins are in use.

Google Workbox is used to create the service worker, but this is used in the
_postbuild_ scripts rather than via a plugin.

Likewise, string replacements and compression, via _Terser_, take place in the
_postbuild_ script.

Packages used for actions such as compressing code and linting are run via their
command line commands or from within prebuild and postbuild scripts.

All other external packages used for the build process are managed by the
following scripts:

- build-utilities/prebuild.js
- build-utilities/postbuild.js

### String replacements

String replacements take place in _postbuild.js_. The placeholders which are
replaced are given names wrapped between <span>$</span>\_ and \_<span>$</span>
characters.

String replacements are normally provided without quotes. These string
replacements are given names ending with _TXT_ and should be quoted in the code.
This allows code to be viewed before building. String replacements which are
provided with quotes and which should be not enclosed in quotes in the code, are
given names ending with _STR_. The following code snippets show how this
convention is applied.

```
var a = "__NAME_TXT__";
var b = __NAME_STR__;
```

At present, the following substitutions are available:

- <span>$</span>\_APP\_VERSION\_TXT\_<span>$</span> - application version
- <span>$</span>\_BUILD\_DATE\_TXT\_<span>$</span> - date of the build
- <span>$</span>\_BUILD\_MODE\_TXT\_<span>$</span> - build mode: production or
  developement.
- <span>$</span>\_BUNDLE\_NAME\_TXT\_<span>$</span> - name of the final code
  bundle
- <span>$</span>\_BUILD\_YEAR\_<span>$</span> - year of the build. Numeric
  replacement.
- <span>$</span>\_PRODUCT\_NAME\_TXT\_<span>$</span> - year of the build.
  Numeric replacement.

Build information is provided via _constants.js_.

### Internationalisation

Translations are controlled by using template literals with an _i18n_ tag
function. During the build process, the final javascript bundle is processed and
this strings are replace by template literals beginning with a hash of the
original text. The extracted original definitions are extracted to the master
language file. This can then be used to create translations. Refer to
_tools\i18n-build-tools.js_ for more details.

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

### Build information

Information for the build is encapsulated by the _build-utilities/project-info_
module. Where possible, all information used by scripts should be picked up from
the _ProjectInfo_ object. The _ProjectInfo_ object is populated as far as
possible from the _package.json_ file with addition information that is either
not included as standard or not exposed in the _process.env_ object place in the
_config_ property.

In general, all build information should come from _package.json_ and then be
accessed via _ProjectInfo_. This means that only the
_build-utilities/project-info_ needs to worry about processing any variables.

### A word on production and development modes

The _production_ and _development_ build modes present a particular problem.
Because the environment variable _process.env.NODE_ENV_ is commonly used by
plugins and third-party packages, this needs to be set to the appropriate mode.

To facilitate this, the script _./build-utilities/run-in-env.js_ can be used. In
general, if you think the output from a script may depend on the build mode, you
should create the npm script as a child and then invoke that using the
_run-in-env.js_ script. An example is shown below:

    "scripts": {
      "buildDev": "node ./build-utilities/run-in-env.js -d buildChild",
      "buildChild": "rollup -c",
      ...
    },
