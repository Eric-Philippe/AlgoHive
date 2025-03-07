# AlgoHive

> Sweeten your skills, but the competition stings

AlgoHive is a web, self-hostable plateform that allows developers to create puzzles for developers to solve. Each puzzle contains two parts to solve, allowing developers to test their skills in a variety of ways. The puzzles are created using a proprietary file format that is compiled into a single file for distribution.

## CLI - HiveCraft

Hivecraft is a command line interface for creating and managing AlgoHive puzzles. It is a tool for developers to create, test, manage and compile puzzles for the AlgoHive platform. AlgoHive works by using a proprietary file format to define puzzles, and Hivecraft is a tool to help developers create these files.

## Self-Hostable API - BeeAPI

API will be able to load puzzles from .alghive files, verify them using the same algorithm as the CLI. (Generate an API-KEY)

## Self-Hostable Web Platform - AlgoHive

The self-hostable web platform will contains an API for the User and Competition management, and a front-end for the users to interact with the platform. The Web Plateform will be completely usable with the Puzzle API.

### Account types

> Each users under Admin will be linked to an environment. For example, a self-hosted solutions wil have two BeeAPI and one AlgoHive environment. The Algohive web instance will allow for a lightweigth management. And by this plateform the super admin will be able to associate the users with the right API.

| Account Type | Description                                                            | Features                                       |
| ------------ | ---------------------------------------------------------------------- | ---------------------------------------------- |
| Admin        | Admins have access to all the environments                             |
| Queen        | Admins have access to all features of the platform                     | CRUD operations on all resources               |
| Architect    | Architects can manage puzzles, and reload API puzzles                  | CRUD operations on puzzles                     |
| Host         | Hosts can manage competitions, select puzzles, and manage participants | CRUD operations on competitions                |
| Worker       | Workers can solve puzzles, and participate in competitions             | Solve puzzles, and participate in competitions |

## Website

## AlgoHive file format

The AlgoHive file format is a concealing ZIP file that contains multiple files and directories to define a puzzle. The extension of the file is `.alghive`.

### Contents of the file

The file contains the following directories and files:

| Name             | Description                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `forge.py`       | This executable python file will generate a unique input for a given seed for the puzzle.                    |
| `decrypt.py`     | This executable python file will decrypt the input and output the solution for the first part of the puzzle  |
| `unveil.py`      | This executable python file will decrypt the input and output the solution for the second part of the puzzle |
| `cipher.html`    | This HTML file contains the puzzle's first part text and example input/output.                               |
| `unveil.html`    | This HTML file contains the puzzle's second part text and example input/output.                              |
| `props/`         | This directory contains the properties of the puzzle, such as the author, creation date and difficulty.      |
| `props/meta.xml` | This XML file contains the meta properties of the file                                                       |
| `props/desc.xml` | This markdown file contains the description of the puzzle.                                                   |

#### `forge.py`

This file is an executable python file that will generate a unique input for a given seed for the puzzle. The file should contain a class called `Forge` that has a method constructor `__init__` that takes a lines_count and a seed as arguments. The class should have a method called `run` that returns a list of strings that will be the input for the puzzle. The implementation should be inside the `generate_line` method that contains an index as an argument and returns a string. The python file should be executable and should generate the input file `input.txt` for debugging purposes.

```python
# forge.py - Génère input.txt
import sys
import random

class Forge:
    def __init__(self, lines_count: int, unique_id: str = None):
        self.lines_count = lines_count
        self.unique_id = unique_id

    def run(self) -> list:
        random.seed(self.unique_id)
        lines = []
        for _ in range(self.lines_count):
            lines.append(self.generate_line(_))
        return lines

    def generate_line(self, index: int) -> str:
        # TODO: TO BE IMPLEMENTED
        pass

if __name__ == '__main__':
    lines_count = int(sys.argv[1])
    unique_id = sys.argv[2]
    forge = Forge(lines_count, unique_id)
    lines = forge.run()
    with open('input.txt', 'w') as f:
        f.write('\n'.join(lines))
```

> Using this template will allow to just focus on the `generate_line` method to generate the input for the puzzle.

#### `decrypt.py`

This file is an executable python file that will decrypt the input and output the solution for the first part of the puzzle. The file should contain a class called `Decrypt` that has a method constructor `__init__` that takes a list of lines as arguments. The class should have a method called `run` that, given the previously setup lines, return a string or a number that is the solution for the first part of the puzzle. The python file should be executable.

```python
class Decrypt:
    def __init__(self, lines: list):
        self.lines = lines

    def run(self):
        # TODO: TO BE IMPLEMENTED
        pass

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    decrypt = Decrypt(lines)
    solution = decrypt.run()
    print(solution)
```

#### `unveil.py`

This file is an executable python file that will decrypt the input and output the solution for the second part of the puzzle. The file should contain a class called `Unveil` that has a method constructor `__init__` that takes a list of lines as arguments. The class should have
a method called `run` that, given the previously setup lines, return a string or a number that is the solution for the second part of the puzzle. The python file should be executable.

```python
class Unveil:
    def __init__(self, lines: list):
        self.lines = lines

    def run(self):
        # TODO: TO BE IMPLEMENTED
        pass

if __name__ == '__main__':
    with open('input.txt') as f:
        lines = f.readlines()
    unveil = Unveil(lines)
    solution = unveil.run()
    print(solution)
```

#### `cipher.html`

This file is an HTML file that contains the puzzle's first part text and example input/output. The file must contain a `<article>` surrounding the content. The content can be written using `<p>` tags for paragraphs and `<pre>` or `<code>` tags for code blocks. This file should contain basic examples of the input and output of the puzzle.

```html
<article>
  <h2>First part of the puzzle</h2>

  <p>I'm a paragraph</p>

  <code>
    <pre>
      I'm a code block
    </pre>
  </code>
</article>
```

#### `unveil.html`

This file is an HTML file that contains the puzzle's second part text and example input/output. The file must contain a `<article>` surrounding the content. The content can be written using `<p>` tags for paragraphs and `<pre>` or `<code>` tags for code blocks. This file should contain basic examples of the input and output of the puzzle.

```html
<article>
  <h2>Second part of the puzzle</h2>

  <p>I'm a paragraph</p>

  <code>
    <pre>
      I'm a code block
    </pre>
  </code>
</article>
```

#### `props/meta.xml`

This file is an XML file that contains the meta properties of the file. The file should contain the following properties:

```xml
<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <author>$AUTHOR</author>
    <created>$CREATED</created>
    <modified>$MODIFIED</modified>
    <title>Meta</title>
</Properties>
```

> This file will allow to be able to define the author, the creation date and the modification date of the puzzle.

#### `props/desc.xml`

This file is an XML file that contains the description of the puzzle. The file should contain the following properties:

```xml
<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <difficulty>$DIFFICULTY</difficulty>
    <language>$LANGUAGE</language>
</Properties>
```
