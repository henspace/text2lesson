# Text2Lesson

**Text2Lesson** has been designed to make the creation of lessons quick and
simple using just plain text.

# Lesson format

All lessons are created using plain text files.

Lessons are written using a very simple, intuitive format. The file is then
broken up into a number of problems. Each problem then comprises a number of
items.

Before the problems, the file can contain meta data for the lesson. Any lines
which precede the first problem are automatically assumed to form the meta data.

With the exception of meta data, different items are identified by a lines which
start with a key character. Any other characters following the key character
form part of the data for the item.

Item identifiers are as follows:

- i introduction
- ? question
- = right answer
- x wrong answer
- & explanation
- / problem separator

If preferred, the key character can be enclosed between brackets. In addition,
the key character and opening and closing brackets, if present, can be repeated
allowing for more visually distinctive item separators to be created. Brackets
will be necessary if the text following the indentifier starts with one of the
identification characters.

The separator can also be preceded by up to three spaces. For example, the
following lines are all valid ways of identifing the start of an introduction
item:

- i
- &nbsp;&nbsp;&nbsp;i
- i optional data following the key
- (i)optional data following the key
- iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
- (((((((((((i)))))))))))
- (iiiiiiiiiiiiiiiiiiiii)

The items can appear in any order but normally introduction, question, right
answers, wrong answers, and explanation would be the most logical.

Each problem can only contain one introduction, question and explanation item. A
second introduction or question item identifies the start of a new problem. You
can make the separation between problems clearer by using a separator item,
which is the underscore, like this:

- //////////////////////////////////////

Each problem can contain multiple right and wrong answers. The program uses the
presence of multiple answers to determine the type of question that is being
asked.

# Metadata

Metadata is additional information about the lesson that can be included later
in your problems. See {@tutorial metadata} for more information.

# Question types

The program supports six question types. The type is automatically derived from
the way the question is defined:

- simple: a multiple choice question with just one correct answer.
- multi: a multiple choice question where the user can select more than one
  correct answer.
- fill: a fill the blank question. Users have a selection of words which they
  must select to fill in the blanks in the question. This type is created if the
  question has an array of missing words which are not blank. Any wrong answers
  are added as red herrings. Note that only the first word of any wrong answer
  is used. If right answers have also been added, they are ignored. Note that if
  the question has one missing word with no content at the end, this is taken as
  the trigger to add an extra answer line at the end and this becomes an order
  question.
- order: a select the answers in the correct order question. Users have a
  selection of words which they must select in the correct order. Any wrong
  answers that have been defined are treated as red herrings. This is similar to
  the fill question, but with the correct selections being added to a separate
  answer line rather than being inserted into blanks in the question. This type
  is created if there is a single missing word (...) at the end with no content.
- slide: there is no question to answer. The user can just continue when ready.
  This is the default if the question does not fall into any of the other
  categories.

# Markdown

ToDo

## Missing words

Missing words are created by adding three points followed by the word that
should be regarded as missing. So `...REMOVE` would not display the word
`REMOVE` but would leave a gap. This is used for questions where the user must
select the missing word from a number of options.
