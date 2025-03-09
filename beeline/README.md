<p align="center">
  <img width="150px" src="../images/beeline-logo.png" title="Algohive">
</p>

<h1 align="center">BeeLine</h1>

## Beeline - CLI for AlgoHive puzzles files management

Beeline is a command line interface for managing AlgoHive puzzles files. It allows you to create, test and manage puzzles files (`.algohive`) for the Algohive platform.

> Beeline is the quickest and more direct way to create puzzles for AlgoHive.

## AlgoHive

AlgoHive is a web, self-hostable plateform that allows developers to create puzzles for developers to solve. Each puzzle contains two parts to solve, allowing developers to test their skills in a variety of ways. The puzzles are created using a proprietary file format that is compiled into a single file for distribution.

## Installation

Beeline runs on Python 3.6 and above. It does not require any external dependencies.

## Usage

To create a new puzzle, run the following command:

> TODO: To be implemented, right now the CLI only supports testing and compiling puzzles with `python3 --test folder/`

```bash
python3 beeline.py new <puzzle-name>
# Creates a new puzzle uncompressed file
```

To test a puzzle, run the following command:

```bash
python3 beeline.py test <puzzle-file>
# Tests the puzzle file
```

To compile a puzzle, run the following command:

```bash
python3 beeline.py compile [--test] [--test-count] <puzzle-file>
# Compiles the puzzle file
```
