/* a function that takes an Array of objects, with a specific key and value pair, and filters out it's child properties
*  - example usage:
*
*      let cosmicArray = [{ data: 'hello', tag: 'world'}, { data: 'how are you today', tag: 'today', stellar: true }];
*      let stellarArray = matchesFromObjectArray(cosmicArray, 'stellar', true, { whitelist: ['data'] })
*
*      // output = [{ data: 'how are you today' }] <- only matches children with a stellar object
* */

function matchesFromObjectArray(array, key, value, filter){
    let i = 0, j, newNode, node, filterKey, output = [];

    filter = (typeof filter === "object") ? filter : {};

    let doPurge = typeof filter.blacklist === "object" && typeof filter.blacklist.length === "number" && filter.blacklist.length > 0;
    let doFilter = typeof filter.whitelist === "object" && typeof filter.whitelist.length === "number" && filter.whitelist.length > 0;

    let customFilter = typeof filter.custom === "function" ? filter.custom : null;

    for (i; i < array.length; i++){
        node = array[i];
        if (typeof node === "object"){
            node = JSON.parse(JSON.stringify(node)); // create new instance
            // the node is an object so process

            if (valueFromProperty(node, key, value) === value){

                // there is a specially defined filter, let's use it
                if (customFilter){
                    node = customFilter(node);
                }

                // commence optional purge since it's going to be pushed (only if whitelist is not true)
                if (doPurge && !doFilter){
                    j = filter.blacklist.length;
                    while(j--){
                        filterKey = filter.blacklist[j];
                        if (typeof node[filterKey] !== "undefined"){
                            delete node[filterKey]; // remove the element
                        }
                    }
                }

                // commence optional whitelist
                if (doFilter && !doPurge){
                    // instead of doing crazy Object.keys method simply push new generated object
                    newNode = {};
                    j = filter.whitelist.length;

                    while (j--){
                        filterKey = filter.whitelist[j];
                        if (typeof node[filterKey] !== "undefined"){
                            newNode[filterKey] = node[filterKey];
                        }
                    }
                    output.push(newNode);
                } else {
                    output.push(node); // push node since it's likely n
                }
            }
        }
    }
    return output;
}

// small helper function that checks if a object has a key, and returns it/
function valueFromProperty(object, key, value){
    if (typeof object === "object"){
        // check to see if object contains key
        if (typeof object[key] !== "undefined" && object[key] === value){
            return object[key];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

module.exports = { matchesFromObjectArray };