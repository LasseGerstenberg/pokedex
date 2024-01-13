<template>
    <header>
      <nav class="navbar navbar-dark  bg-primary">
        <div class="container-fluid">
          <img src="@/assets/pokeball.png" class="navbar-icon"/>
          <form class="d-flex input-group w-auto">
            <input
                type="search"
                class="form-control rounded"
                :placeholder="searchLabel"
                aria-label="Search"
            />
          </form>
        </div>
      </nav>
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
</template>
<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return { //hier variablen anlegen key für language anlegen this. neue sprache zuweisen. vue.js ist reactiv ändert alle vorkommen im code, wo variablen referenziert
      pokemons: [],
      searchLabel: 'search'
    };
  },
  async mounted() { //Lifecyclehook
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

<style> // evtl noch scoped, dann gilt es nur für Komponente

body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f4f4;
  color: #333;
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

.navbar-icon {
  max-height: 50px;
}

</style>
