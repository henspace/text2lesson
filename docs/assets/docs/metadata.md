---
title: Metadata
---

Metadata is additional information about the lesson that can be included later
in your problems. This allows you to give some text a label, and then repeat
that text later in your lesson by using the label.

# Defining metadata

Metadata is defined by adding additional information at the beginning of the
lesson file before the first problem is defined.

All lines at the start of the lesson preceding the first problem are regarded as
potential metadata.

The format of a metadata definition is a line starting with a `key` followed by
its value. The key cannot have any spaces in its name and can only comprise the
characters a to z, A to Z, 0 to 9, and the underscore.

`Key: the value`

The key must be separated from its value by a colon, semi-colon, or period. Any
of these can be immediately followed by a hyphen if preferred. There can be any
number of spaces surrounding the key, separator and values. Keywords are
converted to uppercase, so _mykey_, _MYKEY_ and _MyKey_ will be treated as the
same key.

Here are some examples of valid keys:

```
AUTHOR: John Doe
mykey:- some text
```

If a definition is repeated, it overwrites any previous value. Any other lines
that preceding and which are not identified as metadata are ignored. This allows
you to add your own comments to the start of the lesson by just starting the line
with any invalid key character such as `@` or `#`.

You can create your own keys but the following have special meaning within the
application.

```
TITLE: the lesson title
AUTHOR: the lesson's author
DATE: the date of the lesson
REVISION: the revision of the lesson
```

Here is an example of the start of a valid lesson file:

```
# this is just a comment and is ignored.
AUTHOR: John Doe
MyKey: some text to use later
AnotherKey   :  more text but note the use of spaces.

(i) Here is the first problem which prevents any further definitions.
```

# Using metadata

Metadata can be incorporated into your lessons by utilising the `meta:key` text.

Look at this lesson file:

```
MyName: John

(i) Welcome to this lesson written by meta:MyName.
```

The lesson starts by creating metadata using the key `MyName`. Then the
introduction uses the key with the text `meta:MyName`. The resulting introduction
is shown below:

```
Welcome to this lesson written by John.
```

Notice how `meta:MyName` has been replaced by the metadata's value of `John`.

# Limitations

Metadata can only be used for simple replacements. You cannot include any
[Markdown](./markdown-light.md) formatting in the metadata values.

[Home](./about.md)
