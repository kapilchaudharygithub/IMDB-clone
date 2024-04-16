// Show Favorite Movie List
export async function showFavMovieList() {
  const favList = JSON.parse(localStorage.getItem(dbObjectFavList)) || [];
  const url = "https://www.omdbapi.com/?apikey=7b6b319d&i=";

  let html = "";
  if (favList.length === 0) {
    html = `<div class="fav-item nothing"><h1>Nothing To Show.....</h1></div>`;
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
