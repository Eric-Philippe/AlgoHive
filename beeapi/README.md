<p align="center">
  <img width="150px" src="../images/beeapi-logo.png" title="Algohive">
</p>

<h1 align="center">BeeAPI</h1>

## Self-Hostable API for AlgoHive

BeepAPI is a self-hostable API that will be able to load puzzles from `.alghive` files, under themes and serve them to the AlgoHive platform independently. It comes with a Swagger UI to test the API endpoints and a simple web interface to manage the puzzles.

![Swagger](img/swagger.png)

## AlgoHive

AlgoHive is a web, self-hostable plateform that allows developers to create puzzles for developers to solve. Each puzzle contains two parts to solve, allowing developers to test their skills in a variety of ways. The puzzles are created using a proprietary file format that is compiled into a single file for distribution.

## Installation

### Local

To use BeeAPI, you need to have Python 3.6 or higher installed on your system.

Then, you can install the dependencies using the following command:

```bash
pip install -r requirements.txt
```

Feed the `puzzles` directory with themes folders containing `.alghive` files or by simply using the Web interface to manage the puzzles for the BeeAPI instance.

```
beeapi/
├── puzzles/
│   ├── theme1/
│   │   ├── puzzle1.alghive
│   │   ├── puzzle2.alghive
│   ├── theme2/
│   │   ├── puzzle3.alghive
│   │   ├── puzzle4.alghive
```

Run the API using the following command:

```bash
python3 server.py
```

### Docker

You can also run the API using Docker. To do so, you need to build the Docker image using the following command:

```bash
docker build -t beeapi .
```

Then, you can run the Docker container using the following command:

```bash
docker run -d -p 5000:5000 --name beeapi -v $(pwd)/puzzles:/app/puzzles beeapi
```
