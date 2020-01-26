Vue.component('poke-card', {
    props: ['pokemon'], 
    template: `
        <div class="pokecard vertical-margin-40px col-sm-4">
            <div class="card">
                <img class="card-img-top" :src="pokemon.sprites.front_default" alt="Bulbasaur">
                <div class="card-body">
                    <h5 class="card-title pokemon-name">#{{ pokemon.id }} {{ pokemon.name }}</h5>                                 
                    <div class="poke-type grass-type"><b class="poke-type">Grass</b></div>
                    <div class="poke-type poison-type"><b class="poke-type">Poison</b></div>                        
                    <p class="card-text pokemon-description">{{ pokemon.description }}</p>
                    <div class="text-center">
                        <a href="#" class="btn btn-primary">More Info</a>
                    </div>
                </div>
            </div>
        </div>`
});

var pokemon_cards_vm = new Vue({ 
    
    el: '#pokemon-cards',

    data: {
        //max_pokemon: 10, 
        max_pokemon: 151,  // first gen is the best gen!        
        api_endpoint: 'https://pokeapi.co/api/v2/pokemon/', // append with ID        
        first_gen_pokemon: [], 
    },   

    created: function() {             
        this.ajax_get_all_pokemon_listings();
    },

    computed: {
        // Filters our all undefined pokemon while the data is loading asynchronously. Our ajax request below needs to fill the array in a random order and a lot of null ids are found in the first_gen_pokemon array prior to all data loading. The solution is to filter them out with this computed value.
        ready_to_render_pokemon: function() {
            return this.first_gen_pokemon.filter(function(data) { 
                return data.id != undefined;
            });
        }
    },

    methods: {
        ajax_get_all_pokemon_listings: function() {
            var vm = this;  // fix for some weird scoping behaviour, saw this in the official vue doc too...                                    

            // there is no API endpoint for retrieving a bulk of pokemon, you need to run individual requests. The rate limiter is generous enough at least
            for (let i = 1; i <= this.max_pokemon; i++) {                  
                // axios returns the promise
                var pokemon_data_promise = axios.get(this.api_endpoint + i + '/').then(function (response) {
                    return response.data;
                }).catch(function (error) {
                    console.log(error);
                }); 

                // async to update the pokemon_data array, and ensure they are in the correct order. 
                pokemon_data_promise.then(function(data) {
                    Vue.set(vm.first_gen_pokemon, data.id - 1, data);   // a common gotcha, vue cannot be reactive to changes to array array[index] = value; 
                });
            }            
        },
    },    
});

var pokemon_info_vm = new Vue({

});