
<template>
  <div id="app">
    <header>
      <img src="@/assets/pokeball.png" alt="Pokeball" class="pokeball-icon" />
      <h1>WINGS Pokedex</h1>
      <button id="header-button"></button>
    </header>
    <main>
      <div class="pokemon-list">
        <div v-for="pokemon in pokemons" :key="pokemon.name" class="pokemon-card">
          <h2>{{ pokemon.name }}</h2>
          <img :src="pokemon.image" :alt="pokemon.name" />
          <div class="pokemon-details">
            <p><strong>Height:</strong> {{ pokemon.details.height }}</p>
            <p><strong>Weight:</strong> {{ pokemon.details.weight }}</p>
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
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      pokemons: [],
    };
  },
  async mounted() {
    await this.getPokemon();
  },
  methods: {
    async getPokemon() {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=350');
        const pokemonData = response.data.results;

        const pokemonDetails = await Promise.all(
            pokemonData.map(async (pokemon) => {
              const detailResponse = await axios.get(pokemon.url);
              return {
                name: pokemon.name,
                image: detailResponse.data.sprites.front_default,
                details: {
                  height: detailResponse.data.height,
                  weight: detailResponse.data.weight,
                },
                stats: detailResponse.data.stats, // Adding stats here
              };
            })
        );

        this.pokemons = pokemonDetails;
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style>
#app {
  min-height: 100vh; /* Ensures that the app covers at least the full viewport height */
  width: 100vw; /* Ensures that the app covers the full viewport width */
  display: flex;
  flex-direction: column; /* This will help in structuring the header and main content */
}

body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f4f4;
  color: #333;
}

header {
  background-color: #ffcc00;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Adjusts space between elements inside header */
  padding: 10px 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

#header-button {
  background-image: url('@/assets/german_flag.png'); /* Replace with your image path */
  background-size: cover;
  border: none; /* Removes the default button border */
  cursor: pointer; /* Changes the cursor to indicate it's clickable */
  height: 40px; /* Set your desired height */
  width: 40px; /* Set your desired width */
}

.pokeball-icon {
  height: 40px;
  margin-right: 10px;
}


header h1 {
  margin: 0;
  color: #fff;
}

main {
  padding-top: 70px; /* Adjust this value based on your header's height */
  padding: 100px;
}

.pokemon-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.pokemon-card {
  background-color: #fff;
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

@media (max-width: 768px) {
  .pokemon-card {
    width: calc(50% - 20px);
  }
}

@media (max-width: 480px) {
  .pokemon-card {
    width: 100%;
  }
}
</style>
