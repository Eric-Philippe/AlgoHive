# Hivecraft - CLI

Hivecraft is a command line interface for creating and managing AlgoHive puzzles. It is a tool for developers to create, test, manage and compile puzzles for the AlgoHive platform. AlgoHive works by using a proprietary file format to define puzzles, and Hivecraft is a tool to help developers create these files.

## AlgoHive

AlgoHive is a web, self-hostable plateform that allows developers to create puzzles for developers to solve. Each puzzle contains two parts to solve, allowing developers to test their skills in a variety of ways. The puzzles are created using a proprietary file format that is compiled into a single file for distribution.

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
