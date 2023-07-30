# Metadata

Metadata is additional information about the lesson that can be included later
in your problems.

## Creating metadata

Metadata is defined by adding additional information at the beginning of the
text file before the first problem is defined.

All lines at the start of the lesson preceding the first problem are regarded as
potential metadata.

The format of a metadata definition is a line starting with a key followed by
its value. The key cannot have any spaces in its name and can only comprise the
characters a to z, A to Z, 0 to 9, and the underscore.

> `Key: the value`

If a key is repeated, it overwrites the previous value. Any lines preceding the
first problem that are not identified as metadata are ignored. This allows you
to add your own comments to the start of the lesson by just starting the line
with a character such as _@_ or _#_.

The key must be separated from its value by a colon, semi-colon, or period. Any
of these can be immediately followed by a hyphen if preferred. There can be any
number of spaces surrounding the key, separator and values. Keywords are
converted to uppercase, so _mykey_, _MYKEY_ and _MyKey_ will be treated as the
same key.

The following are valid keys:

```
AUTHOR: John Doe
mykey:- some text
```

You can create your own keys but the following have special meaning within the
application.

```
AUTHOR: the lesson's author
DATE: the date of the lesson
REVISION: the revision of the lesson
```

Here is an example of a valid lesson file.

```
# this is just a comment and is ignored.
AUTHOR: John Doe
MyKey: some text to use later
AnotherKey&nbsp;&nbsp;&nbsp;:-&nbsp;&nbsp;more text but note the use of spaces.
```

## Using metadata

Metadata can be used by utilising the `meta:key` text in your lesson.

Look at this lesson file:

```
# Start of my file
MyName: John
(i)
Welcome to this lesson written by meta:MyName.
```

The introduction to the first problem would appear as:

> Welcome to this lesson written by John.

## Limitations of metadata

Metadata can only be used for simple replacements. You cannot include any markup
or formatting in the metadata values.
