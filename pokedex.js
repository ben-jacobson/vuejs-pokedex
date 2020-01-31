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
        // Carousel effect, show only 
        max_cards_in_frame: 3, 
        x_pos: 1,
        
        // Pokemon data source
        max_pokemon: 151,  // first gen is the best gen!        
        max_pokemon: 3,
        api_endpoint: 'https://pokeapi.co/api/v2/pokemon/', // append with ID        
        first_gen_pokemon: [],  // to store all first 151 gen pokemon
    },   

    created: function() {             
        this.ajax_get_all_pokemon_listings();
    },

    computed: {
        // Filters our all undefined pokemon while the data is loading asynchronously. Our ajax request below needs to fill the array in a random order and a lot of null ids are found in the first_gen_pokemon array prior to all data loading. The solution is to filter them out with this computed value.
        ready_to_render_pokemon: function() {
            var in_frame_boundary = this.in_frame_boundary;

            return this.first_gen_pokemon.filter(function(data) {                 
                return data.id != undefined && in_frame_boundary(data.id);  // only return the items that are ready to load and are in the current frame.
            });
        },        
    },

    methods: {
        next: function() {
            if (this.x_pos + this.max_cards_in_frame <= this.max_pokemon) {
                this.x_pos++;
            }
        }, 

        prev: function() {
            if (this.x_pos > 1) {
                this.x_pos--;
            }
        },
        
        in_frame_boundary: function(id) {
            return id >= this.x_pos && id < this.x_pos + this.max_cards_in_frame; 
        },

        ajax_get_all_pokemon_listings: function() {
            var vm = this;  // set this so that the promise has its own scoped copy of vm to work with after function has ended.                              

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
                    data.name = data.name.charAt(0).toUpperCase() + data.name.substring(1); // a quick way to upper case the first letter of the pokemon name
                    Vue.set(vm.first_gen_pokemon, data.id - 1, data);   // a common gotcha, vue cannot be reactive to changes to array array[index] = value; 
                });
            }            
        },
    },    
});

var pokemon_info_vm = new Vue({

});