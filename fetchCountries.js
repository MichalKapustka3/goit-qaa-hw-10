import Notiflix from "notiflix"; // Import biblioteki Notiflix
import debounce from "lodash.debounce";

export async function fetchCountries(name) {
  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${name}?fields=name.official,capital,population,flags.svg,languages`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching countries:", error.message);
    if (error instanceof Response && error.status === 404) {
      // Obsługa błędu 404 - kraj nie został znaleziony
      Notiflix.Notify.Failure("Oops, there is no country with that name");
    }
    throw error;
  }
}

const searchBox = document.getElementById("search-box");
const countryInfo = document.querySelector(".country-info");

searchBox.addEventListener(
  "input",
  debounce(async (event) => {
    const searchTerm = event.target.value.trim();
    if (searchTerm === "") {
      // Jeśli pole wyszukiwania jest puste, wyczyść wyniki
      countryInfo.innerHTML = "";
      return;
    }
    try {
      const countries = await fetchCountries(searchTerm);
      // Wyświetl wyniki wyszukiwania
      displayResults(countries);
    } catch (error) {
      // Obsługa błędów
      console.error("Error fetching countries:", error.message);
    }
  }, 300)
);

function displayResults(countries) {
  if (countries.length > 10) {
    // Komunikat dla więcej niż 10 krajów
    Notiflix.Notify.Info(
      "Too many matches found. Please enter a more specific name."
    );
  } else if (countries.length >= 2 && countries.length <= 10) {
    // Lista dla od 2 do 10 krajów
    const countriesList = document.createElement("ul");
    countries.forEach((country) => {
      const listItem = document.createElement("li");
      listItem.textContent = country.name.official;
      countriesList.appendChild(listItem);
    });
    countryInfo.innerHTML = ""; // Wyczyść poprzednie wyniki
    countryInfo.appendChild(countriesList);
  } else if (countries.length === 1) {
    // Karta dla jednego kraju
    const country = countries[0];
    const countryCard = document.createElement("div");
    countryCard.innerHTML = `
      <div>
        <img src="${country.flags.svg}" alt="Flag of ${country.name.official}">
        <h2>${country.name.official}</h2>
        <p>Capital: ${country.capital}</p>
        <p>Population: ${country.population}</p>
        <p>Languages: ${country.languages.join(", ")}</p>
      </div>
    `;
    countryInfo.innerHTML = ""; // Wyczyść poprzednie wyniki
    countryInfo.appendChild(countryCard);
  }
}
