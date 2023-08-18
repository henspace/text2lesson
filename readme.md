# Text2Lesson UNDER CONSTRUCTION

Text2Lesson is an application to simplify the creation of lessons and quizzes
using a simple plain text file.

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
preceded by up to three spaces. For example, the following lines are all valid
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

## Missing words

Missing words are created by adding three points followed by the word that
should be regarded as missing. So `...REMOVE` would not display the word
`REMOVE` but would leave a gap. This is used for questions where the user must
select the missing word from a number of options.
