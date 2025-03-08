<p align="center">
  <img width="150px" src="images/algohive-logo.png" title="Algohive">
</p>

<h1 align="center">AlgoHive</h1>

<p align="center"><i><b>[Project under "active" development, some features may be unstable or change in the future. A first release version is planned to be packed soon].</b></i></p>

<p align="center">Algohive is a <b>self-hosted coding game platform.</b><br>that allows developers to create puzzles for developers to solve.</p>

> Sweeten your skills, but the competition stings

Each puzzle contains two parts to solve, allowing developers to test their skills in a variety of ways. The puzzles are created using a proprietary file format that is compiled into a single file for distribution.

## Why

Algohive is a coding game plateform for developers by developers. It is a self-hosted solution that allows developers, schools to create puzzles for other developers to solve. The platform is designed to be lightweight and easy to use, with a focus on creating and solving puzzles.

## Features Highlights

- A file format created for defining puzzles
- A command line interface forge for creating, testing, and managing puzzles
- A self-hostable API for loading and serving puzzles
- A self-hostable web platform for managing users, competitions, and puzzles
- [LATER] A web platform for users to interact with the puzzles

## Quick Start

Installing Alghive is pretty straight forward, in order to do so follow these steps:

- Create a folder where you want to place all the Algohive related files.
- Inside that folder, create a file named docker-compose.yml with this content:

```yaml
name: algohive
services:
  server:
    image: ghcr.io/eric-philippe/algohive/algohive/api:latest
    env_file: server.env
    depends_on:
      - db
      - cache
    restart: unless-stopped
    ports:
      - "3000:3000"
    networks:
      - algohive-network

  client:
    image: ghcr.io/eric-philippe/algohive/algohive/client:latest
    restart: unless-stopped
    ports:
      - "8000:8000"
    networks:
      - algohive-network

  beeapi-server1:
    image: ghcr.io/eric-philippe/algohive/beeapi:latest
    restart: unless-stopped
    volumes:
      - ./data/beeapi-server1/puzzles:/app/puzzles
    ports:
      - "5000:5000"
    networks:
      - algohive-network

  beeapi-server2:
    image: ghcr.io/eric-philippe/algohive/beeapi:latest
    restart: unless-stopped
    volumes:
      - ./data/beeapi-server2/puzzles:/app/puzzles
    ports:
      - "5001:5000"
    networks:
      - algohive-network

  db:
    image: postgres:17-alpine
    env_file: server.env
    volumes:
      - ./db-data:/var/lib/postgresql/data
    networks:
      - algohive-network

  cache:
    image: redis:alpine
    restart: always
    networks:
      - algohive-network

volumes:
  db-data:

networks:
  algohive-network:
```

- Create a file named server.env with this content:

```env

```

- Start the services by running the following command:

```bash
docker-compose up -d --build
```

- Authorize access to the BeeAPI folder(s) for every instance of the BeeAPI server:

> This will allow you to put puzzles in the folder and have them available in the API.

````bash
sudo chown -R $USER:$USER ./data/beeapi-server1/puzzles
```

## Quick Overview

### CLI - HiveCraft

Hivecraft is a command line interface for creating and managing AlgoHive puzzles. It is a tool for developers to create, test, manage and compile puzzles for the AlgoHive platform. AlgoHive works by using a proprietary file format to define puzzles, and Hivecraft is a tool to help developers create these files.

### Self-Hostable API - BeeAPI

API will be able to load puzzles from .alghive files, verify them using the same algorithm as the CLI. (Generate an API-KEY)

### Self-Hostable Web Platform - AlgoHive

The self-hostable web platform will contains an API for the User and Competition management, and a front-end for the users to interact with the platform. The Web Plateform will be completely usable with the Puzzle API.

### AlgoHive file format

The AlgoHive file format is a concealing ZIP file that contains multiple files and directories to define a puzzle. The extension of the file is `.alghive`.

#### Contents of the file

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

##### `forge.py`

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
````

> Using this template will allow to just focus on the `generate_line` method to generate the input for the puzzle.

##### `decrypt.py`

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

##### `unveil.py`

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

##### `cipher.html`

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

##### `unveil.html`

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

##### `props/meta.xml`

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

##### `props/desc.xml`

This file is an XML file that contains the description of the puzzle. The file should contain the following properties:

```xml
<Properties xmlns="http://www.w3.org/2001/WMLSchema">
    <difficulty>$DIFFICULTY</difficulty>
    <language>$LANGUAGE</language>
</Properties>
```
