/* Some generic, non app specific helper functions */ 
function capitalize_first_letter(text) {
    // capitalize the first letter of a word
    return text.charAt(0).toUpperCase() + text.substring(1);  
}

function json_property_to_string(json_data, identifier, string_to_extract) {
    // input a JSON array of objects, extract a chosen string from it, nested one layer down
    // e.g extract all of the types from this array and put into a comma separated string, also capitalizes first letter
    /*  Example input JSON array
        [ 
            { 
                "slot": 2, 
                "type": { 
                    "name": "poison", 
                    "url": "https://pokeapi.co/api/v2/type/4/" 
                } 
            }, 
            { 
                "slot": 1, 
                "type": { 
                    "name": "grass", 
                    "url": "https://pokeapi.co/api/v2/type/12/" 
                } 
            } 
        ]
        Example Output "Poison, Grass"
    */
   extracted_string = "";

   for (let i = 0; i < json_data.length; i++) {
       if (i != 0) {
        extracted_string += ", "; // pop in commas
       }
       extracted_string += capitalize_first_letter(json_data[i][identifier][string_to_extract]);
   }
   return extracted_string;    
}

/* Our components */ 
let pokemon_listview_card_component = {
    props: ['pokemon'],
    template: '#pokemon-listview-card-template',

    methods: {
        more_info: function() {
            this.$emit('update-detail-view', this.pokemon.id);
        },
    }
};

let pokemon_detailview_component = {
    props: ['pokemon'],
    template: '#pokemon-detailview-template',
};

/* Our Vue object */

var pokemon_cards_vm = new Vue({ 
    el: '#pokedex',

    components: {
        'pokemon-detailview': pokemon_detailview_component,
        'pokemon-listview-card': pokemon_listview_card_component,
    },

    data: {        
        // Pokemon data source
        max_pokemon: 151,  // first gen is the best gen!  
        first_gen_pokemon: [],  // to store all first 151 gen pokemon
        viewing_id: 1,
    },   

    created: function() {   
        // there is no API endpoint for retrieving a list of pokemon, you need to run individual requests which seems silly. However, the rate limiter is generous enough and I haven't seen any issues as a result
        for (let i = 1; i <= this.max_pokemon; i++) {    
            Vue.set(this.first_gen_pokemon, i - 1, {id: i, loaded: false}); // pre-set an unloaded value
            this.ajax_request_and_store_pokemon_data(i);
        }       
    },
    methods: {
        update_detail_view: function(id) {
            this.viewing_id = id; 
        },

        find_and_clean_pokemon_description: function(pokemon_species_data) {
            let description = pokemon_species_data['flavor_text_entries'].filter(function (entry) {
                if (entry['language']['name'] == 'en' && entry['version']['name'] == 'red') {
                    return(entry['flavor_text']);
                }
            });
            return description[0]['flavor_text'].replace(/(\r\n|\n|\r)/gm, ' ');
        },

        ajax_request_and_store_pokemon_data: function(id) {
            /* 
                AJAX request for remaining pokemon data
            */
            var vm = this;  // set this so that the promise has its own scoped copy of vm to work with after function has ended.                              
            axios.all([
                    axios.get('https://pokeapi.co/api/v2/pokemon/' + id + '/'),
                    axios.get('https://pokeapi.co/api/v2/pokemon-species/' + id + '/'),
            ]).then(axios.spread(function(pokemon_data, pokemon_species_data) {
                // extract the description from the pokemon_species api call response, then cascade it into the pokemon_data
                pokemon_data.data.description = vm.find_and_clean_pokemon_description(pokemon_species_data.data);
                return(pokemon_data.data);                
            })).then(function(pokemon_data) {
                // then make some changes to the data before loading into the array.
                pokemon_data.name = capitalize_first_letter(pokemon_data.name);
                pokemon_data.weight = pokemon_data.weight / 10; // weight is originally given in hectograms (100 grams)
                pokemon_data.height = pokemon_data.height * 10;      // height is originally given in decimeters
                pokemon_data.types = json_property_to_string(pokemon_data.types, "type", "name");
                pokemon_data.abilities = json_property_to_string(pokemon_data.abilities, "ability", "name");  

                // set a load flag and store it
                pokemon_data.loaded = true; 
                Vue.set(vm.first_gen_pokemon, pokemon_data.id - 1, pokemon_data);   // a common gotcha, vue cannot be reactive to changes to array array[index] = value; 
            });
        },
    },    
});
