let pokemon_listview_card_component = {
    props: ['pokemon'],
    template: '#pokemon-listview-card',
};

var pokemon_cards_vm = new Vue({ 
    el: '#pokemon-cards',

    components: {
        'pokemon-listview-card': pokemon_listview_card_component,
    },

    data: {
        // Carousel effect, show only 
        max_cards_in_frame: 3, 
        x_pos: 1,
        
        // Pokemon data source
        max_pokemon: 151,  // first gen is the best gen!        
        //max_pokemon: 3,
        api_endpoint: 'https://pokeapi.co/api/v2/pokemon/', // append with ID        
        first_gen_pokemon: [],  // to store all first 151 gen pokemon
    },   

    created: function() {    
        this.ajax_get_all_pokemon_listings();   
    },

    methods: {
        ajax_get_all_pokemon_listings: function() {
            var vm = this;  // set this so that the promise has its own scoped copy of vm to work with after function has ended.                              

            // there is no API endpoint for retrieving a bulk of pokemon, you need to run individual requests. The rate limiter is generous enough at least
            for (let i = 1; i <= this.max_pokemon; i++) {    
                Vue.set(vm.first_gen_pokemon, i - 1, {id: i, loaded: false}); // pre-set an unloaded value

                // axios returns the promise
                var pokemon_data_promise = axios.get(this.api_endpoint + i + '/').then(function (response) {
                    return response.data;
                }).catch(function (error) {
                    console.log(error);
                }); 

                // async to update the pokemon_data array, and ensure they are in the correct order. 
                pokemon_data_promise.then(function(data) {
                    data.name = data.name.charAt(0).toUpperCase() + data.name.substring(1); // a quick way to upper case the first letter of the pokemon name
                    data.loaded = true; // set a loaded flag
                    Vue.set(vm.first_gen_pokemon, data.id - 1, data);   // a common gotcha, vue cannot be reactive to changes to array array[index] = value; 
                });
            }            
        },
    },    
});
