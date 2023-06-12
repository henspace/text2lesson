# Lesson format

All lessons are created using plain text files.

Lessons are written using a very simple, intuitive format. The file is then
broken up into a number of problems. Each problem then comprises a number of
items.

Before the problems, the file can contain meta data for the lesson. Any lines
which precede the first problem are automatically assumed to form the meta data.

With the exception of meta data, items are separated by a lines which start with
a key character enclosed in () brackets. Any other characters following the
brackets forms part of the data for the item.

Item identifiers are as follows:

- (i) introduction
- (?) question
- (=) right answer
- (x) wrong answer
- (+) explanation

The key character and opening and closing brackets can be repeated allowing more
visually distinctive item separators to be created. The separator can also be
preceded but up to three spaces. For example, the following lines are all valid
separators for an introduction item:

- (i)
- &nbsp;&nbsp;&nbsp;(i)
- (i)optional data following key
- (((((((((((i)))))))))))
- (iiiiiiiiiiiiiiiiiiiii)

These can appear in any order but normally introduction, question, right
answers, wrong answers, and explanation would be the most logical.

Each problem can only contain one introduction, question and explanation item. A
new introduction, question or explanation item identifies the start of a new
problem.

Each problem can contain multiple right and wrong answers. The program uses the
presence of multiple answers to determine the type of question that is being
asked.

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
with a character such as _!_, _@_ or _#_.

The key must be separated from its value by a colon, semi-colon, or period. Any
of these can be immediately followed by a hyphen if preferred. There can be any
number of spaces surrounding the key, separator and values. Keywords are
converted to uppercase, so _mykey_, _MYKEY_ and _MyKey_ will be treated as the
same key.

The following are valid keys:

```plain
AUTHOR: John Doe
mykey:- some text
```

You can create your own keys but the following have special meaning within the
application.

```plain
AUTHOR: the lesson's author
DATE: the date of the lesson
REVISION: the revision of the lesson
```

Here is an example of a valid lesson file.

```plain
! this is just a comment and is ignored.
AUTHOR: John Doe MyKey: some text to use later
AnotherKey&nbsp;&nbsp;&nbsp;:-&nbsp;&nbsp;more text but note the use of spaces.
```

## Using metadata

Metadata can be used by utilising the `meta:key` text in your lesson.

Look at this lesson file:

```plain
! Start of my file
MyName: John
(i) Welcome to this lesson written by meta:MyName.
(?) What is the capital of the UK?
(=) London
(x) New York
(x) Paris
```

The introduction to the first problem would appear as:

> Welcome to this lesson written by John.

## Limitations of metadata

Metadata can only be used for simple replacements. You cannot include any markup
or formatting in the metadata values.
