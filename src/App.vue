<template>
  <header>
    <nav class="navbar navbar-dark bg-primary">
      <div class="container-fluid">
        <img src="@/assets/pokeball.png" class="navbar-icon"/>
        <form class="d-flex input-group w-auto">
          <input
              type="search"
              class="form-control rounded"
              :placeholder="searchLabel"
              aria-label="Search"
              v-model="searchInput"
              @keyup.enter="scrollToPokemon"
          />
          <!-- @input fuer Suche mit Enter -->
        </form>
        <!-- Dropdown for filtering by type -->
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
            Filter by Type
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li v-for="type in pokemonTypes" :key="type">
              <a class="dropdown-item" href="#">
                <input type="checkbox" :value="type" v-model="selectedTypes">
                {{ type }}
              </a>
            </li>
          </ul>
          <button class="btn btn-primary" @click="applyFilter">Apply Filter</button>
        </div>
        <button class="btn btn-warning" @click="resetFilter">Reset Filter</button>
      </div>
    </nav>
  </header>
    <main>
      <div class="pokemon-list">
        <div v-for="pokemon in pokemons" :key="pokemon.name" class="pokemon-card" :id="`pokemon-${pokemon.number}`" :class="{ 'highlighted': pokemon.number === foundPokemonNumber }">
          <h2>{{ pokemon.name }}</h2>
          <img
              :src="pokemon.image"
              :alt="pokemon.name"
              :class="{ 'jump-animation': pokemon.number === foundPokemonNumber }"
          />
          <div class="pokemon-details">
            <p><strong>Height:</strong> {{ pokemon.details.height }}</p>
            <p><strong>Weight:</strong> {{ pokemon.details.weight }}</p>
            <p><strong>Type:</strong> {{ pokemon.types.join(', ') }}</p>
            <p><strong>Number:</strong> {{ pokemon.number }}</p>
            <p><strong>Region:</strong> {{ pokemon.region }}</p>
            <div class="pokemon-moves">
              <h3>Moves:</h3>
              <ul>
                <li v-for="move in pokemon.moves" :key="move">{{ move }}</li>
              </ul>
            </div>
            <div class="pokemon-stats">
              <h3>Stats:</h3>
              <ul>
                <li v-for="stat in pokemon.stats" :key="stat.stat.name">
                  {{ stat.stat.name }}: {{ stat.base_stat }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
</template>
<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return { //hier variablen anlegen key für language anlegen this. neue sprache zuweisen. vue.js ist reactiv ändert alle vorkommen im code, wo variablen referenziert
      pokemons: [],
      pokemonTypes: [],
      allPokemons: [],
      selectedTypes: [],
      foundPokemonNumber: null,
      searchInput: '',
      searchLabel: 'search'
    };
  },
  async mounted() { //Lifecyclehook
    await this.getPokemon();
    await this.fetchPokemonTypes();
  },
  methods: {
    scrollToPokemon() {
      // Convert search input to lower case for case-insensitive comparison
      const searchQuery = this.searchInput.toLowerCase();

      // Find the first Pokémon that matches the name or number
      const foundPokemon = this.pokemons.find(pokemon =>
          pokemon.name.toLowerCase() === searchQuery || pokemon.number.toString() === searchQuery
      );

      if (foundPokemon) {
        this.foundPokemonNumber = foundPokemon.number;

        // Scroll to the Pokémon card
        this.$nextTick(() => {
          const element = document.getElementById(`pokemon-${foundPokemon.number}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        });
      } else {
        this.foundPokemonNumber = null;
      }
    },
    resetFilter() {
      this.selectedTypes = [];
      this.pokemons = this.allPokemons;
      this.searchInput = '';
      this.foundPokemonNumber = null; // Clear the found Pokémon
    },
    // Call this method when a new search is performed
    clearSearch() {
      this.foundPokemonNumber = null;
    },
    applyFilter() {
      if (this.selectedTypes.length === 0) {
        // Show all pokemons if no type is selected
        this.pokemons = this.allPokemons;
      } else {
        // Filter by selected types
        this.pokemons = this.allPokemons.filter(pokemon =>
            this.selectedTypes.every(type => pokemon.types.includes(type))
        );
      }
    },
    async getPokemon() {
      const localStorageKey = 'pokemonsData';
      let pokemonsData = localStorage.getItem(localStorageKey);

      if (!pokemonsData) { //!pokemonsData um nicht die api zu callen
        try {
          const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=5');
          const pokemonData = response.data.results;

          const pokemonDetails = await Promise.all(
              pokemonData.map(async (pokemon) => {
                const detailResponse = await axios.get(pokemon.url);
                const moves = detailResponse.data.moves.map(m => m.move.name);
                const randomMoves = moves.sort(() => 0.5 - Math.random()).slice(0, 4);
                const types = detailResponse.data.types.map(t => t.type.name);
                const number = detailResponse.data.id; // Pokedex number
                const region = this.determineRegion(number);

                return {
                  name: this.capitalizeFirstLetter(pokemon.name),
                  image: detailResponse.data.sprites.front_default,
                  details: {
                    height: detailResponse.data.height,
                    weight: detailResponse.data.weight,
                  },
                  stats: detailResponse.data.stats,
                  moves: randomMoves,
                  types,
                  number,
                  region,
                };
              })
          );

          pokemonsData = pokemonDetails;
          localStorage.setItem(localStorageKey, JSON.stringify(pokemonsData));
        } catch (error) {
          console.error(error);
        }
      } else {
        pokemonsData = JSON.parse(pokemonsData);
      }
      this.allPokemons = pokemonsData;
      this.pokemons = pokemonsData;
    },
    determineRegion(number) {
      if (number >= 1 && number <= 151) return 'Kanto';
      if (number >= 152 && number <= 251) return 'Johto';
      if (number >= 252 && number <= 386) return 'Hoenn';
      if (number >= 387 && number <= 493) return 'Sinnoh';
      if (number >= 494 && number <= 649) return 'Unova';
      if (number >= 650 && number <= 721) return 'Kalos';
      if (number >= 722 && number <= 809) return 'Alola';
      if (number >= 810) return 'Galar';
      return 'Unknown'; // For numbers that don't fall into any category
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    async fetchPokemonTypes() {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/type');
        this.pokemonTypes = response.data.results.map(type => type.name);
      } catch (error) {
        console.error('Error fetching Pokémon types:', error);
      }
    },
  },
};
</script>

<style> // evtl noch scoped, dann gilt es nur für Komponente

body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  flex-direction: column;
}

main {
  padding-top: 70px; /* Adjust this value based on your header's height */
}

@keyframes jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.jump-animation {
  animation: jump 0.5s ease-in-out infinite;
}

.pokemon-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
.highlighted {
  border: 2px solid #FFD700; /* Gold border for highlighting */
  background-color: #E0FFFF; /* Lighter background for highlighting */
}

.pokemon-card {
  background-color: rgba(199, 199, 199, 0.16);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 10px;
  padding: 20px;
  width: calc(33.333% - 20px); /* Adjusted width for 3 cards per row */
  text-align: center;
}

.pokemon-card img {
  max-width: 100px;
  height: auto;
  margin: 0 auto;
}

.pokemon-details {
  margin-top: 20px;
  text-align: left;
}

.pokemon-stats ul {
  list-style-type: none;
  padding: 0;
}

.pokemon-stats li {
  margin-bottom: 5px;
  font-size: 0.9em;
}

.navbar-icon {
  max-height: 50px;
}

</style>
