/* Some help functions */ 
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
        more_info: function(e) {
            console.log(this.pokemon.id);
            // emit an event with the id as payload.
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
        api_endpoint: 'https://pokeapi.co/api/v2/pokemon/', // append with ID        
        first_gen_pokemon: [],  // to store all first 151 gen pokemon
        pokemon_currently_viewing: 10,
    },   

    created: function() {    
        // there is no API endpoint for retrieving a list of pokemon, you need to run individual requests which seems silly. However, the rate limiter is generous enough and I haven't seen any issues as a result
        for (let i = 1; i <= this.max_pokemon; i++) {    
            Vue.set(this.first_gen_pokemon, i - 1, {id: i, loaded: false}); // pre-set an unloaded value
            this.ajax_request_pokemon_data(i);
        }       
    },
    methods: {
        ajax_request_pokemon_data: function(id) {
            var vm = this;  // set this so that the promise has its own scoped copy of vm to work with after function has ended.                              

            // initiate the Ajax request. Returns the promise
            var pokemon_data_promise = axios.get(this.api_endpoint + id + '/').then(function (response) {
                return response.data;
            }).catch(function (error) {
                console.log(error);
            }); 

            // async to update the pokemon_data array, and ensure they are in the correct order. 
            pokemon_data_promise.then(function(data) {
                // make some changes to the data before loading into the array.
                data.name = capitalize_first_letter(data.name);
                data.weight = data.weight / 10; // weight is originally given in hectograms (100 grams)
                data.height = data.height * 10;      // height is originally given in decimeters
                data.types = json_property_to_string(data.types, "type", "name");
                data.abilities = json_property_to_string(data.abilities, "ability", "name");  
                data.description = "Placeholder Description"; 
                data.loaded = true; // set a loaded flag
                Vue.set(vm.first_gen_pokemon, data.id - 1, data);   // a common gotcha, vue cannot be reactive to changes to array array[index] = value; 
            });         
        },
    },    
});
