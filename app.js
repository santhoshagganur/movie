const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const changeIntoUpper = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const changeToUpperDirectors = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//get all movies names
app.get("/movies/", async (request, response) => {
  const moviesNamesQuery = `
    SELECT movie_name FROM movie`;
  const movieNamesArray = await db.all(moviesNamesQuery);
  response.send(movieNamesArray.map(changeIntoUpper, movieNamesArray));
});

//add movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES('${directorId}', '${movieName}', '${leadActor}')`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//get single movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id= ${movieId}`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

//update movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie SET directorId= ${directorId},
    movieName= ${movieName}, leadActor= ${leadActor}
    WHERE movie_id= ${movieId}`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete movie
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const removeMovieQuery = `
    DElETE FROM movie WHERE movie_id= ${movieId}`;
  await db.run(removeMovieQuery);
  response.send("Movie Removed");
});

//all directors
app.get("/directors/", async (request, response) => {
  const allDirectorsQuery = `
    SELECT * FROM director ORDER BY director_id`;
  const directorsArray = await db.all(allDirectorsQuery);
  response.send(directorsArray.map(changeToUpperDirectors, directorsArray));
});

//all movies of specified director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getAllMoviesDirector = `
    SELECT movie_name FROM movie WHERE director_id= ${directorId}`;
  const movieArray = await db.all(getAllMoviesDirector);
  response.send(movieArray.map(changeIntoUpper, movieArray));
});

module.exports = app;
