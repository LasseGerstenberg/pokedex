<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <header>
    <nav class="navbar navbar-dark bg-primary">
      <div class="container-fluid">
        <img src="@/assets/pokeball.png" class="navbar-icon" @click="clearLocalStorage"/>
        <form class="d-flex input-group w-auto" @submit.prevent="scrollToPokemon(searchInput)">
          <input
              type="search"
              class="form-control rounded"
              :placeholder="t('searchLabel')"
              aria-label="Search"
              v-model="searchInput"
              @keyup.enter="scrollToPokemon(searchInput)"
          />
        </form>
        <!-- Dropdown for filtering by type -->
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
            {{ t('filterLabel') }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li v-for="type in getTypesByLanguage()" :key="type">
              <a class="dropdown-item" href="#">
                <img :src="findTypeIcon(convertTypeNameToEnglish(type))" class="type-icon" alt="Type Icon" />
                <input type="checkbox" :value="convertTypeNameToEnglish(type)" v-model="selectedTypes"> {{ type }}
              </a>
            </li>
          </ul>
        </div>
        <!-- Dropdown for filtering by region -->
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
            {{ t('filterRegionLabel') }}
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            <li v-for="region in getRegionsByLanguage()" :key="region">
              <a class="dropdown-item" href="#">
                <input type="checkbox" :value="convertRegionNameToEnglish(region)" v-model="selectedRegions"> {{ region }}
              </a>
            </li>
          </ul>
        </div>
        <button class="btn-flag" @click="toggleLanguage">
          <img :src="currentFlag" class="navbar-icon" alt="Flag Icon" />
        </button>
        <button class="btn btn-warning" @click="resetFilter">{{t('resetFilterLabel')}}</button>
      </div>
    </nav>
  </header>
  <main>
    <div class="pokemon-list">
      <div v-for="pokemon in pokemons" :key="pokemon.name" class="pokemon-card" :id="`pokemon-${pokemon.number}`" :class="{ 'highlighted': pokemon.number === foundPokemonNumber}">
        <h2>{{ pokemon.name }}</h2>
        <div class="card-content">
          <div class="pokeball-button-container">
            <img src="@/assets/pokeball.png"
                 class="pokeball-button"
                 :class="{ 'grayscale': isGrayscale(pokemon, 'pokeball') }"
                 @click="onPokeballClick(pokemon, 'pokeball')" />
            <img src="@/assets/fernglas.png"
                 class="pokeball-button"
                 :class="{ 'grayscale': isGrayscale(pokemon, 'fernglas') }"
                 @click="onPokeballClick(pokemon, 'fernglas')" />
            <img src="@/assets/shiny.png"
                 class="pokeball-button"
                 :class="{ 'grayscale': isGrayscale(pokemon, 'shiny') }"
                 @click="onPokeballClick(pokemon, 'shiny')" />
          </div>
          <img :src="pokemon.image" :alt="pokemon.name" class="pokemon-image" :class="{ 'jump-animation': pokemon.number === foundPokemonNumber }" />
        </div>
        <div class="pokemon-details">
          <p><strong>{{ t('type') }}:</strong>
            <div class="type-container">
      <span v-for="type in pokemon.types" :key="type">
        <img :src="findTypeIcon(convertTypeNameToEnglish(type))" class="type-icon" alt="Type Icon" /> {{ getTypeByLanguage(type) }}
      </span>
            </div>
            </p>
            <div class="pokemon-details-grid">
              <div><strong>{{ t('number') }}:</strong> {{ pokemon.number }}</div>
              <div><strong>{{ t('region') }}:</strong> {{ pokemon.region }}</div>
              <div><strong>{{ t('height') }}:</strong> {{ pokemon.details.height }}</div>
              <div><strong>{{ t('weight') }}:</strong> {{ pokemon.details.weight }}</div>
            </div>
            <div class="pokemon-stats">
              <h3>{{ t('stats') }}:</h3>
              <div><strong>{{ t('hp') }}:</strong> {{ pokemon.stats[0].base_stat }}</div>
              <div><strong>{{ t('attack') }}:</strong> {{ pokemon.stats[1].base_stat }}</div>
              <div><strong>{{ t('defense') }}:</strong> {{ pokemon.stats[2].base_stat }}</div>
              <div><strong>{{ t('special-attack') }}:</strong> {{ pokemon.stats[3].base_stat }}</div>
              <div><strong>{{ t('special-defense') }}:</strong> {{ pokemon.stats[4].base_stat }}</div>
              <div><strong>{{ t('speed') }}:</strong> {{ pokemon.stats[5].base_stat }}</div>
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
import {useI18n} from "vue-i18n";

export default {
  name: 'App',
  watch: {
    searchInput(newVal) {
      if (newVal === '') {
        this.foundPokemonNumber = null;
      }
    },
    selectedTypes(newVal, oldVal) {
      if (newVal.length !== oldVal.length || newVal.some((item, index) => item !== oldVal[index])) {
        this.applyFilter();
      }
    },
    selectedRegions() {
      this.applyFilter();
    }
  },

  data() {
    return { //hier variablen anlegen key für language anlegen this. neue sprache zuweisen. vue.js ist reactiv ändert alle vorkommen im code, wo variablen referenziert
      pokeApiCurrentLanguage: 5,
      pokeApiLanguageDe: 5,
      pokeApiLanguageEn: 8,
      pokeApiLanguageJp: 9,
      pokeApiGeneralListURL: 'https://pokeapi.co/api/v2/pokemon?limit=2',
      globalPokemonList: [],
      globalPokemonNamesWithTranslations: [],
      currentFlag: FlagEN,
      currentLanguage: 'en',
      iconStates: {},
      selectedRegions: [],
      regions: ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Unknown'], // Add all regions you need
      pokemons: [],
      allPokemons: [],
      selectedTypes: [],
      foundPokemonNumber: null,
      searchInput: '',
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
      pokemonTypesWithTranslations: [],
      pokemonRegionsWithTranslations: []
    };
  },
  async mounted() { //Lifecyclehook
    await this.getPokemon();
    await this.fetchPokemonTypes();
    await this.fetchRegions();
    this.loadIconStates();
  },
  methods: {
    toggleLanguage() {
      if (this.currentLanguage === 'en') {
        this.$i18n.locale = 'de';
        this.currentLanguage = 'de';
        this.currentFlag = FlagDE;
        this.handlePokemonTranslation(this.pokeApiLanguageDe);
      } else if (this.currentLanguage === 'de') {
        this.$i18n.locale = 'jp'
        this.currentLanguage = 'jp';
        this.currentFlag = FlagJP;
        this.handlePokemonTranslation(this.pokeApiLanguageJp);
      } else {
        this.$i18n.locale = 'en'
        this.currentLanguage = 'en';
        this.currentFlag = FlagEN;
        this.handlePokemonTranslation(this.pokeApiLanguageEn);
      }
    },
    handlePokemonTranslation(pokeApiLanguage) {
      this.pokeApiCurrentLanguage = pokeApiLanguage;
      this.setLanguageForPokemonCards(pokeApiLanguage);
    },
    onPokeballClick(pokemon, iconType) {
      const pokemonNumber = pokemon.number;
      if (!this.iconStates[pokemonNumber]) {
        this.iconStates[pokemonNumber] = {};
      }

      this.iconStates[pokemonNumber][iconType] = !this.iconStates[pokemonNumber][iconType];
      this.saveIconStates();
    },
    loadIconStates() {
      const savedStates = localStorage.getItem('iconStates');
      if (savedStates) {
        this.iconStates = JSON.parse(savedStates);
      }
    },

    saveIconStates() {
      localStorage.setItem('iconStates', JSON.stringify(this.iconStates));
    },

    isGrayscale(pokemon, iconType) {
      const pokemonNumber = pokemon.number;
      if (!this.iconStates[pokemonNumber]) {
        return false;
      }
      return !!this.iconStates[pokemonNumber][iconType];
    },
    findTypeIcon(typeName) {
      //haesslich aber Array iterieren klappt aus unerfindlichen Gruenden nicht :'(
      if(typeName === "Bug") return BugIcon;
      if(typeName === "Dark") return DarkIcon;
      if(typeName === "Dragon") return DragonIcon;
      if(typeName === "Electric") return ElectricIcon;
      if(typeName === "Fairy") return FairyIcon;
      if(typeName === "Fighting") return FightingIcon;
      if(typeName === "Fire") return FireIcon;
      if(typeName === "Flying") return FlyingIcon;
      if(typeName === "Ghost") return GhostIcon;
      if(typeName === "Grass") return GrassIcon;
      if(typeName === "Ground") return GroundIcon;
      if(typeName === "Ice") return IceIcon;
      if(typeName === "Normal") return NormalIcon;
      if(typeName === "Poison") return PoisonIcon;
      if(typeName === "Psychic") return PsychicIcon;
      if(typeName === "Rock") return RockIcon;
      if(typeName === "Steel") return SteelIcon;
      if(typeName === "Water") return WaterIcon;
      return QuestionMarkIcon;
    },
    scrollToPokemon(inputValue) {
      const searchQuery = inputValue.toLowerCase();

      const foundPokemon = this.pokemons.find(pokemon =>
          pokemon.name.toLowerCase() === searchQuery ||
          pokemon.number.toString() === searchQuery
      );

      if (foundPokemon) {
        this.foundPokemonNumber = foundPokemon.number;

        this.$nextTick(() => {
          const element = document.getElementById(`pokemon-${foundPokemon.number}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          } else {
            console.error('Element to scroll to not found');
          }
        });
      } else {
        console.log('Pokemon not found');
        this.foundPokemonNumber = null;
      }
    },
    resetFilter() {
      this.selectedTypes = [];
      this.pokemons = this.allPokemons;
      this.searchInput = '';
      this.foundPokemonNumber = null; // Clear the found Pokémon
    },
    applyFilter() {
      this.pokemons = this.allPokemons.filter(pokemon => {
        const typeMatch = this.selectedTypes.length === 0 || pokemon.types.some(type => this.selectedTypes.includes(this.convertTypeNameToEnglish(type)));
        const regionMatch = this.selectedRegions.length === 0 || this.selectedRegions.includes(pokemon.region);
        return typeMatch && regionMatch;
      });
    },
    setLanguageForPokemonCards() {
      this.pokemons.forEach(pokemon => {
        this.fetchLanguageData(pokemon.number)
            .then(data => {
                pokemon.name = data.names[this.pokeApiCurrentLanguage].name
            })
            .catch(error => {
              console.error('Error in setLanguageForPokemonCards:', error);
            });
      });
    },
    async addSinglePokemonNameTranslationsToGlobalList(url) {
      try {
        let response = await axios.get(url);
        const allTranslationsForSingleName = response.data.names;

        const nameEN = allTranslationsForSingleName.find(name => name.language.name === 'en')?.name || 'N/A';
        const nameDE = allTranslationsForSingleName.find(name => name.language.name === 'de')?.name || 'N/A';
        const nameJP = allTranslationsForSingleName.find(name => name.language.name === 'ja')?.name || 'N/A';

        const objectWithTranslatedNames = { nameEN, nameDE, nameJP };

        console.log(objectWithTranslatedNames);
        this.globalPokemonNamesWithTranslations.push(objectWithTranslatedNames);
      } catch (error) {
        console.error('Error fetching data:', error); // Print any errors that occur
      }
    },
    async getPokemon() {
      const localStorageKey = 'pokemonsData';
      let allPokemonList = localStorage.getItem(localStorageKey);
      this.globalPokemonNamesWithTranslations = localStorage.getItem('allPokemonNamesWithTranslations');

      if (!allPokemonList) {
        console.log('PokeAPI was called by method getPokemon()');
        try {
          const response = await axios.get(this.pokeApiGeneralListURL);
          const pokemonData = response.data.results;

          const pokemonDetails = await Promise.all(
              pokemonData.map(async (pokemon) => {
                const detailResponse = await axios.get(pokemon.url);
                await this.addSinglePokemonNameTranslationsToGlobalList(detailResponse.data.species.url);
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
                  types,
                  number,
                  region,
                };
              })
          );

          allPokemonList = pokemonDetails;
          localStorage.setItem('allPokemonNamesWithTranslations', JSON.stringify(this.globalPokemonNamesWithTranslations));
          localStorage.setItem(localStorageKey, JSON.stringify(allPokemonList));
        } catch (error) {
          console.error(error);
        }
      } else {
        allPokemonList = JSON.parse(allPokemonList);
      }
      this.allPokemons = allPokemonList;
      this.pokemons = allPokemonList;
      this.pokemons.forEach(pokemon => {
        const pokemonNumber = pokemon.number;
        if (!this.iconStates[pokemonNumber]) {
          this.iconStates[pokemonNumber] = {
            pokeball: true,
            fernglas: true,
            shiny: true
          };
        }
      });
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
    clearLocalStorage() {
      localStorage.clear();
      console.log('Local storage cleared');
      this.resetFilter();
      // Reload the page
      window.location.reload();
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    // Sucht aus dem Array mit allen Uebersetzungen das Objekt passend zum Typ und aus diesem dann die richtige Sprache
    // relevant fuer die einzelnen Pokemon
    getTypeByLanguage(type) {
      type = this.capitalizeFirstLetter(type);
      const typeObject = this.pokemonTypesWithTranslations.find(t => t.nameEN === type);
      if(this.currentLanguage === 'en') {
        return type;
      } else if (this.currentLanguage === 'de'){
        return typeObject.nameDE;
      } else if (this.currentLanguage === 'jp'){
        return typeObject.nameJP;
      }
    },
    // alle Typen in der aktuellen Sprache. Relevant fuer den Filter
    getTypesByLanguage() {
      if(this.currentLanguage === 'en') {
        return this.pokemonTypesWithTranslations.map(t => t.nameEN);
      } else if (this.currentLanguage === 'de'){
        return this.pokemonTypesWithTranslations.map(t => t.nameDE);
      } else if (this.currentLanguage === 'jp'){
        return this.pokemonTypesWithTranslations.map(t => t.nameJP);
      }
    },
    getRegionsByLanguage() {
      if(this.currentLanguage === 'en') {
        return this.pokemonRegionsWithTranslations.map(t => t.nameEN);
      } else if (this.currentLanguage === 'de'){
        return this.pokemonRegionsWithTranslations.map(t => t.nameDE);
      } else if (this.currentLanguage === 'jp'){
        return this.pokemonRegionsWithTranslations.map(t => t.nameJP);
      }
    },
    convertTypeNameToEnglish(type) {
      type = this.capitalizeFirstLetter(type);

      const foundTypeObject = this.pokemonTypesWithTranslations.find(t =>
          t.nameEN === type || t.nameDE === type || t.nameJP === type
      );
      if(foundTypeObject) {
        return foundTypeObject.nameEN;
      } else {
        return type;
      }
    },
    convertRegionNameToEnglish(region) {
      region = this.capitalizeFirstLetter(region);

      const foundRegionObject = this.pokemonRegionsWithTranslations.find(t =>
          t.nameEN === region || t.nameDE === region || t.nameJP === region
      );
      if(foundRegionObject) {
        return foundRegionObject.nameEN;
      } else {
        return region;
      }
    },
    //fetch all pokemon types and build an array with all translations
    async fetchPokemonTypes() {
        if(localStorage.getItem('pokemonTypesWithTranslations')) {
          this.pokemonTypesWithTranslations = JSON.parse(localStorage.getItem('typesWithTranslations'));
        } else {
          const typesWithTranslations = [];
          const response = await axios.get('https://pokeapi.co/api/v2/type');
          const types = response.data.results;

          for (let i = 0; i < types.length; i++) {
            const singleTypeResponse = await axios.get(types[i].url);
            const singleTypeMetaData = singleTypeResponse.data.names;

            const nameEN = singleTypeMetaData.find(name => name.language.name === 'en')?.name || 'N/A';
            const nameDE = singleTypeMetaData.find(name => name.language.name === 'de')?.name || 'N/A';
            const nameJP = singleTypeMetaData.find(name => name.language.name === 'ja')?.name || 'N/A';

            const typeMetaData = { nameEN, nameDE, nameJP };
            typesWithTranslations.push(typeMetaData);
          }
          this.pokemonTypesWithTranslations = typesWithTranslations;
          localStorage.setItem('typesWithTranslations', JSON.stringify(typesWithTranslations));
        }
    },
    async fetchRegions() {
      if(localStorage.getItem('pokemonRegionsWithTranslations')) {
        this.pokemonRegionsWithTranslations = JSON.parse(localStorage.getItem('pokemonRegionsWithTranslations'));
      } else {
        const response = await axios.get('https://pokeapi.co/api/v2/region');
        const regions = response.data.results;
        const regionsWithMetaData = [];
        for (let i = 0; i < regions.length; i++) {
          const singleRegion = await axios.get(regions[i].url);
          const singleRegionMetaData = singleRegion.data.names;

          // Find the specific translations you need
          const nameEN = singleRegionMetaData.find(name => name.language.name === 'en')?.name || 'N/A';
          const nameDE = singleRegionMetaData.find(name => name.language.name === 'de')?.name || 'N/A';
          const nameJP = singleRegionMetaData.find(name => name.language.name === 'ja-Hrkt')?.name || 'N/A';

          const regionMetaData = { nameEN, nameDE, nameJP };
          regionsWithMetaData.push(regionMetaData);
        }
        this.pokemonRegionsWithTranslations = regionsWithMetaData;
        localStorage.setItem('pokemonRegionsWithTranslations', JSON.stringify(this.pokemonRegionsWithTranslations));
      }
    }
  }
};
</script>

<style>
body {
  font-family: 'Source Code Pro', sans-serif;
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
  padding-top: 70px;
}

@keyframes jump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.jump-animation {
  animation: jump 0.5s ease-in-out infinite;
}

.type-icon {
  height: 20px;
  width: 20px;
  margin-right: 5px;
}

.pokemon-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
.highlighted {
  border: 2px solid #FFD700;
  background-color: #E0FFFF;
}

.btn-flag {
  background: transparent;
  border: transparent;
}

.pokemon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(199, 199, 199, 0.16);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 10px;
  padding: 20px;
  width: calc(33.333% - 20px);
  text-align: center;
}

.pokemon-card img {
  max-width: 100px;
  height: auto;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.pokemon-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.pokemon-details-grid > div {
  text-align: left;
}

.pokemon-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.pokeball-button {
  top: 10px;
  left: 10px;
  width: 30px;
  height: auto;
  cursor: pointer;
  z-index: 10;
}
.pokeball-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-right: 20px;
  padding-left: 20px;
}
.card-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.type-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 5px;
  justify-content: start;
}

.grayscale {
  filter: grayscale(100%);
}

</style>
