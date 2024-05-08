const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
const initializDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is Runing at http://localhost:3000/movies/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializDbAndServer()
const convertingIntoString = dbObject => {
  return {
    movieName: dbObject.movie_name,
  }
}
const convertingIntoStringItem = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const convertingDirectorIntoString = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}
//Returns a list of all movie names in the movie table
app.get('/movies/', async (request, response) => {
  const movieNameQuery = `
            SELECT movie_name FROM movie;
    `
  const movieNameArray = await db.all(movieNameQuery)
  response.send(movieNameArray.map(each => convertingIntoString(each)))
})

//Creates a new movie in the movie table
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
      INSERT INTO movie (director_id, movie_name, lead_actor)
      VALUES (${directorId}, "${movieName}", "${leadActor}");
  `
  await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

//Returns a movie based on the movie ID
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
      SELECT * FROM movie WHERE movie_id = ${movieId};
  `
  const movieArray = await db.get(getMovieQuery)
  response.send(convertingIntoStringItem(movieArray))
})

//Updates the details of a movie in the movie table based on the movie ID
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const putMovieQuery = `
      UPDATE movie
      SET 
        director_id = ${directorId},
        movie_name = "${movieName}",
        lead_actor = "${leadActor}"
      WHERE movie_id = ${movieId};
  `
  await db.run(putMovieQuery)
  response.send('Movie Details Updated')
})

//delete movie
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
      DELETE FROM movie WHERE movie_id = ${movieId};
  `
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//Returns a list of all directors in the director table
app.get('/directors/', async (request, response) => {
  const directorQuery = `
      SELECT * FROM director;
  `
  const directorArray = await db.all(directorQuery)
  response.send(directorArray.map(each => convertingDirectorIntoString(each)))
})

//Returns a list of all movie names directed by a specific director
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorQuery = `
      SELECT 
        movie.movie_name as movieName 
      FROM 
        director NATURAL JOIN movie
      WHERE 
        director.director_id = ${directorId};
  `
  const direcotArray = await db.all(getDirectorQuery)
  response.send(direcotArray)
})

module.exports = app
