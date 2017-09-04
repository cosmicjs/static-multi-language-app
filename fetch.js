// this is the script that we will use to fetch our application from the CosmicJS buckets
// and place it inside of a JSON store for an easier import into out application

const striptags = require('striptags');
const Cosmic = require('cosmicjs');
const config = require('./config'); // get the configuration
const utils = require('./fetch-utils');
const LOG_NAME = '[CosmicJS Fetch]';

/* This is the method that will be used for fetching all of the website nodes
   it will filter and whitelist the nodes following the right criteria

   For our purposes, a Node will only contain
    - a 'slug', which is the special attribute that is used when processing data
            ** AND **
    - the 'content' which is the edited data containing the string used to fill the element
        we will be filtering this string to only allow inline elements. Since the purpose of
        a node would be to simply act as a small block of text.

*/
function fetchNodes(){
    // return a promise since these calls will be asynchronous
    return new Promise((success, failure) => {
        Cosmic.getObjects(config.cosmicjs, (error, result) =>{
            if (error){
                failure(error); // something went wrong
            } else {
                // there was a response so let's see if the data we are looking for exists
                let rawNodes = null;

                try {
                    rawNodes = result.objects.type.nodes;
                } catch (e){
                    console.error('[fetch]', 'unable to process Nodes.');
                    failure(e);
                }

                // lets see if we got the array we were looking for
                if (Array.isArray(rawNodes)){

                    // it's an array of data -> let's filter it
                    console.log(LOG_NAME, `Filtering (${ rawNodes.length }) fetched Nodes`, '...');

                    /* So now we have the Nodes, now we need to put them through a filter to remove the bulk
                       let's filter out the Nodes that have a 'status' of 'published', as well
                       and only allow what's specified in the config 'NodeWhiteList' */

                    let extractedLocales = {}; // setup object container for storing the extracted locale names

                    let filteredNodes = utils.matchesFromObjectArray(rawNodes, 'status', 'published', { whitelist: config.fetch.NodeWhiteList, custom: (node) => {
                        // extract the locale name and register it's key to the extracted locales.
                        extractedLocales[node.locale] = true;
                        return node; // return the node.
                    }});

                    extractedLocales = Object.keys(extractedLocales); // convert the object to a simple array of registered keys

                    console.log(LOG_NAME, `(${ rawNodes.length }) Nodes remain after filtration`);
                    console.log(LOG_NAME, `Detected (${ extractedLocales.length }) locales`, extractedLocales);

                    /* We now have a minimized array only containing the whitelisted content. Be we aren't done yet.
                       Now we need to strip each Node so it has DOM-safe markup, which is specified in the config
                       'NodeAllowedTags'

                       But because we are busy people (and don't want to wait forever) we will condense the language sorting
                       and content striping into a singular loop

                       THE LOCALE MUST BE SET. ANY NODES WITHOUT A LOCALE WILL BE IGNORED! */

                    let languageContainer = {}; // the object we will be cloning items into

                    let localeString,
                        i = extractedLocales.length;

                    while (i--){
                        localeString = extractedLocales[i];

                        languageContainer[localeString] = {}; // initialize a new sub container for the locale.

                        // look for all nodes witha  matching local string, remove it's locale and sanitize it's content
                        utils.matchesFromObjectArray(filteredNodes, 'locale', localeString, {
                            custom: node => {
                                // push the new node to the container object (while also only using whitelisted elements)
                                languageContainer[localeString][node.slug] = striptags(node.content, config.fetch.NodeAllowedTags);

                                return node;
                            }
                        })
                    }

                    // by now we should have an awesome array of content
                    success(languageContainer); // pass the data to the success Promise return

                } else {
                    console.error(LOG_NAME, 'Node data does not exist');
                    failure(new Error('Node data does not exist'));
                }
            }
        });
    });
}

module.exports = fetchNodes;