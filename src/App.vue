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
            {{filterLabel}}
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li v-for="type in pokemonTypes2" :key="type">
              <a class="dropdown-item" href="#">
                <img :src="findTypeIcon(type)" class="type-icon" alt="Type Icon" />
                <input type="checkbox" :value="type" v-model="selectedTypes"> {{type}}
              </a>
            </li>
          </ul>
          <button class="btn btn-primary" @click="applyFilter">{{applyFilterLabel}}</button>
        </div>
        <button class="btn-flag" @click="toggleLanguage">
          <img :src="currentFlag" class="navbar-icon" alt="Flag Icon" />
        </button>
        <button class="btn btn-warning" @click="resetFilter">{{resetFilterLabel}}</button>
      </div>
    </nav>
  </header>
    <main>
      <div class="pokemon-list">
        <div v-for="pokemon in pokemons" :key="pokemon.name" class="pokemon-card" :id="`pokemon-${pokemon.number}`" :class="{ 'highlighted': pokemon.number === foundPokemonNumber }">
          <h2>{{ pokemon.name }}</h2>
          <img :src="pokemon.image" :alt="pokemon.name" :class="{ 'jump-animation': pokemon.number === foundPokemonNumber }" />
          <div class="pokemon-details">
            <p><strong>Height:</strong> {{ pokemon.details.height }}</p>
            <p><strong>Weight:</strong> {{ pokemon.details.weight }}</p>
            <p><strong>Type:</strong>
              <span v-for="type in pokemon.types" :key="type">
              <img :src="findTypeIcon(type)" class="type-icon" alt="Type Icon" /> {{ type }}
            </span>
            </p>
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
import BugIcon from '@/assets/Bug_icon.png';
import DarkIcon from '@/assets/Dark_icon.png';
import DragonIcon from '@/assets/Dragon_icon.png';
import ElectricIcon from '@/assets/Electric_icon.png';
import FairyIcon from '@/assets/Fairy_icon.png';
import FightingIcon from '@/assets/Fighting_icon.png';
import FireIcon from '@/assets/Fire_icon.png';
import FlyingIcon from '@/assets/Flying_icon.png';
import GhostIcon from '@/assets/Ghost_icon.png';
import GrassIcon from '@/assets/Grass_icon.png';
import GroundIcon from '@/assets/Ground_icon.png';
import IceIcon from '@/assets/Ice_icon_.png';
import NormalIcon from '@/assets/Normal_icon.png';
import PoisonIcon from '@/assets/Poison_icon.png';
import PsychicIcon from '@/assets/Psychic_icon.png';
import RockIcon from '@/assets/Rock_icon.png';
import SteelIcon from '@/assets/Steel_icon.png';
import WaterIcon from '@/assets/Water_icon.png';
import QuestionMarkIcon from '@/assets/question_mark.png'
import FlagEN from '@/assets/EN.png'
import FlagDE from '@/assets/DE.png'
import FlagJP from '@/assets/JP.png'

export default {
  name: 'App',
  data() {
    return { //hier variablen anlegen key für language anlegen this. neue sprache zuweisen. vue.js ist reactiv ändert alle vorkommen im code, wo variablen referenziert
      currentLanguage: 'en',
      currentFlag: FlagEN,
      pokemons: [],
      allPokemons: [],
      selectedTypes: [],
      foundPokemonNumber: null,
      searchInput: '',
      searchLabel: 'search...',
      filterLabel: 'Filter by Type',
      applyFilterLabel: 'Apply Filter',
      resetFilterLabel: 'Reset Filter',
      pokemonTypes2: [],
      pokemonTypes: [
        { name: 'bug', icon: BugIcon },
        { name: 'dark', icon: DarkIcon },
        { name: 'dragon', icon: DragonIcon },
        { name: 'electric', icon: ElectricIcon },
        { name: 'fairy', icon: FairyIcon },
        { name: 'fighting', icon: FightingIcon },
        { name: 'fire', icon: FireIcon },
        { name: 'flying', icon: FlyingIcon },
        { name: 'ghost', icon: GhostIcon },
        { name: 'grass', icon: GrassIcon },
        { name: 'ground', icon: GroundIcon },
        { name: 'ice', icon: IceIcon },
        { name: 'normal', icon: NormalIcon },
        { name: 'poison', icon: PoisonIcon },
        { name: 'psychic', icon: PsychicIcon },
        { name: 'rock', icon: RockIcon },
        { name: 'steel', icon: SteelIcon },
        { name: 'water', icon: WaterIcon },
      ],
    };
  },
  async mounted() { //Lifecyclehook
    await this.getPokemon();
    await this.fetchPokemonTypes();
  },
  methods: {
    toggleLanguage() {
      if (this.currentLanguage === 'en') {
        this.currentLanguage = 'de';
        this.currentFlag = FlagDE;
        this.searchLabel = 'Suchen...';
        this.filterLabel = 'Filtern nach Typ';
        this.applyFilterLabel = 'Filter anwenden';
        this.resetFilterLabel = 'Filter zurücksetzen';
      } else if (this.currentLanguage === 'de') {
        this.currentLanguage = 'jp';
        this.currentFlag = FlagJP;
        this.searchLabel = '検索...';
        this.filterLabel = 'タイプ別にフィルター';
        this.applyFilterLabel = 'フィルターを適用する';
        this.resetFilterLabel = 'フィルターをリセットする';
      } else {
        this.currentLanguage = 'en';
        this.currentFlag = FlagEN;
        this.searchLabel = 'search...';
        this.filterLabel = 'Filter by Type';
        this.applyFilterLabel = 'Apply Filter';
        this.resetFilterLabel = 'Reset Filter';
      }
    },
    findTypeIcon(typeName) {
      //haesslich aber Array iterieren klappt aus unerfindlichen Gruenden nicht :'(
      console.log(typeName);
      if(typeName === "bug") return BugIcon;
      if(typeName === "dark") return DarkIcon;
      if(typeName === "dragon") return DragonIcon;
      if(typeName === "electric") return ElectricIcon;
      if(typeName === "fairy") return FairyIcon;
      if(typeName === "fighting") return FightingIcon;
      if(typeName === "fire") return FireIcon;
      if(typeName === "flying") return FlyingIcon;
      if(typeName === "ghost") return GhostIcon;
      if(typeName === "grass") return GrassIcon;
      if(typeName === "ground") return GroundIcon;
      if(typeName === "ice") return IceIcon;
      if(typeName === "normal") return NormalIcon;
      if(typeName === "poison") return PoisonIcon;
      if(typeName === "psychic") return PsychicIcon;
      if(typeName === "rock") return RockIcon;
      if(typeName === "steel") return SteelIcon;
      if(typeName === "water") return WaterIcon;
      return QuestionMarkIcon;
    },
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
        this.pokemons = this.allPokemons;
      } else {
        this.pokemons = this.allPokemons.filter(pokemon =>
            pokemon.types.some(type => this.selectedTypes.includes(type))
        );
      }
    },
    async getPokemon() {
      const localStorageKey = 'pokemonsData';
      let pokemonsData = localStorage.getItem(localStorageKey);

      if (!pokemonsData) { //!pokemonsData um nicht die api zu callen
        try {
          const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=600');
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
        this.pokemonTypes2 = response.data.results.map(type => type.name);
        // Print the result to the console
        console.log('TEST START');
        console.log(this.pokemonTypes2);
        console.log('TEST ENDE');
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

.type-icon {
  height: 20px; /* Adjust as needed */
  width: 20px;  /* Adjust as needed */
  margin-right: 5px;
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

.btn-flag {
  background: transparent;
  border: transparent;
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
  max-height: 27px;
}

</style>
