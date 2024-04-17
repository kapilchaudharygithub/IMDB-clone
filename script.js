// Initialization
document.addEventListener("DOMContentLoaded", initialize);

// Constants
const dbObjectFavList = "favMovieList";

// DOM Elements
let toggleButton, sidebar, flexBox, searchbar;

// Initialize function
function initialize() {
  // Get DOM elements
  toggleButton = document.getElementById("toggle-sidebar");
  sidebar = document.getElementById("sidebar");
  flexBox = document.getElementById("flex-box");
  searchbar = document.getElementById("search-bar");

  // Add event listeners
  toggleButton.addEventListener("click", toggleSidebar);
  flexBox.onscroll = toggleSearchBar;

  // Check and initialize local storage
  initializeLocalStorage();

  // Update task counter
  updateTask();

  // Show favorite movies list
  showFavMovieList();
}

// Check and initialize local storage
function initializeLocalStorage() {
  if (!localStorage.getItem(dbObjectFavList)) {
    localStorage.setItem(dbObjectFavList, JSON.stringify([]));
  }
}

// Update Task Counter
function updateTask() {
  const favCounter = document.getElementById("total-counter");
  const db = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];
  favCounter.innerText = db.length;
}

// Toggle Sidebar
function toggleSidebar() {
  sidebar.classList.toggle("show");
  flexBox.classList.toggle("shrink");
}

// Toggle Search Bar
function toggleSearchBar() {
  searchbar.classList.toggle("fixed", flexBox.scrollTop > searchbar.offsetTop);
}

// Fetch Movies from API
async function fetchMoviesFromApi(url, value) {
  const response = await fetch(`${url + value}`);
  return await response.json();
}

// Show Movie List
async function showMovieList() {
  const list = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];
  const inputValue = document.getElementById("search-input").value;
  const url = "https://www.omdbapi.com/?apikey=9483c861&s=";
  const moviesData = await fetchMoviesFromApi(url, inputValue);
  let html = "";
  if (moviesData.Search) {
    html = moviesData.Search.map((element) =>
      createMovieCard(element, list)
    ).join("");
    document.getElementById("cards-holder").innerHTML = html;
  }
}

// Create Movie Card HTML
function createMovieCard(element, list) {
  return `
        <div class="card">
            <div class="card-top" onclick="showMovieDetails('${
              element.imdbID
            }')">
                <div class="movie-poster">
                    <img src="${
                      element.Poster == "N/A"
                        ? "./assets/backdrop.jpg"
                        : element.Poster
                    }" alt="">
                </div>
                <div class="movie-name">${element.Title}</div>
                <div class="movie-year">
                    (${element.Year})
                    <span class="button" onclick="showMovieDetails('${
                      element.imdbID
                    }')">Know More</span>
                </div>
            </div>
            <div class="card-bottom">
                <div class="like">
                    <strong> Add to Favourite: </strong>
                    <i class="fa-solid fa-star ${
                      isFav(list, element.imdbID) ? "active" : ""
                    }" onclick="addRemoveToFavList('${element.imdbID}')"></i>
                </div>
            </div>
        </div>
    `;
}

// Check if an ID is in a list of favorites
function isFav(list, id) {
  return list.includes(id);
}

// Add/Remove Movie to/from Favorite List
function addRemoveToFavList(id) {
  const list = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];
  const index = list.indexOf(id);
  if (index !== -1) {
    list.splice(index, 1);
  } else {
    list.push(id);
  }
  localStorage.setItem(dbObjectFavList, JSON.stringify(list));
  updateTask();
  showFavMovieList();
  showMovieList(); // Update the movie list to reflect changes in favorites
}

// Show details for a specific movie
async function showMovieDetails(itemId) {
  const url = `https://www.omdbapi.com/?apikey=9483c861&i=${itemId}`;
  const movieDetails = await fetchMoviesFromApi(url, "");
  const list = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];

  let html = `
        <div class="container remove-top-margin">
            <div class="item-details">
                <div class="item-details-left">
                    <img src="${
                      movieDetails.Poster == "N/A"
                        ? "./assets/backdrop.jpg"
                        : movieDetails.Poster
                    }" alt="">
                </div>
                <div class="item-details-right">
                    <div class="item-name">
                        <strong>Movie Name: </strong>
                        <span class="item-text">${movieDetails.Title}</span>
                    </div>
                    <div class="movie-category">
                        <strong>Genre: </strong>
                        <span class="item-text">${movieDetails.Genre}</span>
                    </div>
                    <div class="movie-info">
                        <strong>Actors: </strong>
                        <span class="item-text">${movieDetails.Actors}</span>
                    </div>
                    <div class="movie-info">
                        <strong>Directors: </strong>
                        <span class="item-text">${movieDetails.Director}</span>
                    </div>
                    <div class="movie-plot">
                        <strong>Plot: </strong>
                        <span class="item-text">${movieDetails.Plot}</span>
                    </div>
                    <div class="movie-rating">
                        <strong>Ratings: </strong>
                        <span class="item-text">${
                          movieDetails.Ratings[0].Value
                        }</span>
                        <div id="like-button" onclick="addRemoveToFavList('${
                          movieDetails.imdbID
                        }')">
                            ${
                              isFav(list, movieDetails.imdbID)
                                ? "Remove From Favourite"
                                : "Add To Favourite"
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  document.getElementById("flex-box").innerHTML = html;
}

// Show Favorite Movie List
async function showFavMovieList() {
  const favList = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];
  const url = "https://www.omdbapi.com/?apikey=9483c861&i=";

  let html = "";
  if (favList.length === 0) {
    html = `<div class="fav-item nothing"><h1>Favourite Item Not Found.....</h1></div>`;
  } else {
    for (let i = 0; i < favList.length; i++) {
      const favMovie = await fetchMoviesFromApi(url, favList[i]);
      if (favMovie) {
        html += `
                    <div class="fav-item">
                        <div class="fav-item-photo" onclick="showMovieDetails('${
                          favMovie.imdbID
                        }')">
                            <img src="${
                              favMovie.Poster == "N/A"
                                ? "./assets/backdrop.jpg"
                                : favMovie.Poster
                            }" alt="">
                        </div>
                        <div class="fav-item-details">
                            <div class="fav-item-name">
                                <strong>Name: </strong>
                                <span class="fav-item-text">${truncate(
                                  favMovie.Title,
                                  20
                                )}</span>
                            </div>
                            <div id="fav-like-button" onclick="addRemoveToFavList('${
                              favMovie.imdbID
                            }')">
                                Remove
                            </div>
                        </div>
                    </div>
                `;
      }
    }
  }

  document.getElementById("fav").innerHTML = html;
}

// Truncate function to shorten movie titles
function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "&hellip;" : str;
}

// Initial call to show the movie list
showMovieList();
