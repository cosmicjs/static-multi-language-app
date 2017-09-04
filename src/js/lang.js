// this is the file where all of the data will be stored for the application
// as well as methods that will update the page whenever a new language is selected
(function(window, document, bodyClass, AppError){
    // * wrap the code so we don't pollute the global namespace

    var EXPORT_NAME = 'CosmicLanguage'; // the name we will be using for global calls
    var CONSOLE_NAME = '[' + EXPORT_NAME + ']'; // the name as it appears in the console

    var nodeLanguageData = null; // setup the container for the Node typed languageData from cosmicJS
    // setup the storage for the Elements to be updated when the current Language is changed

    var availableLocales = null; // a list of available locals to choose from.
    var defaultLocale = null; // the locale loaded by default when the application loads

    var currentLocale = null; // a storage area that will house the current locale

    var nodeDataElementAttribute = 'data-cosmic-node'; // selector for the Elements
    var nodeDataElements = null; // NodeList reference for all of the Node Elements

    var updateLanguageEvents = []; // the storage array for adding (or removing) events when a new language is selected

    var exportHasLanguageData = false; // the flag used for exporting the state of the language data. Assume it's disabled.

    // * define main methods

    // refreshes current list of node Elements
    function refreshNodeDataElements(){
        nodeDataElements = document.querySelectorAll('[' + nodeDataElementAttribute + ']');
    }

    // loads a string from the current language by key (if the language is set)
    function getLanguageStringFromKey(key, locale){
        // attempt to use the optional locale if present, else only use the globally available locale
        var locale = (typeof locale === "string") ? locale : currentLocale;

        if (locale && typeof nodeLanguageData[locale] !== "undefined"){
            // there is a language available so render the string
            return (typeof nodeLanguageData[locale][key] !== "undefined") ? nodeLanguageData[locale][key] : '[' + key +  '@' + locale + ']'
        } else {
            // there is no available language in that locale
            return '[' + key +  '@' + locale + ']';
        }
    }

    // loads a language (depends on locale STring)
    function loadLanguageFromLocale(localeString){
        if (typeof nodeLanguageData[localeString] === "object"){
            // the language is registered. Attempt to update the Node Elements
            currentLocale = localeString; // push the changes so the whole module knows which language to use

            var i = nodeDataElements.length, // language
                node, // iterative node for the element being processed
                nodeDataKey; // the iterative key value of the data-attribute

            // loop through the Elements
            while (i--){
                node = nodeDataElements[i];

                // get the data attribute of the
                nodeDataKey = node.getAttribute(nodeDataElementAttribute);

                // set the HTML with a ternary statement
                node.innerHTML = getLanguageStringFromKey(nodeDataKey); // attempt to get key
            }

            runLanguageChangeEvents(); // run the language change event;
        } else {
            console.warn(CONSOLE_NAME, '"' + localeString + '"', 'is not a registered locale. Ignoring.');
        }
    }

    // create a function for binding select menus with a custom event handler
    function addMenuLanguageChangeEvent(selectMenu){
        if (typeof selectMenu === "object" &&
            typeof selectMenu.tagName === "string" &&
            selectMenu.tagName === 'SELECT'){
            // if it reaches here than it is a valid language select menu

            selectMenu.addEventListener('change', function(e){
                var langLocale = e.target.value; // get the string of the language locale

                if (typeof nodeLanguageData[langLocale] === "object"){
                    // there is a valid language available
                    loadLanguageFromLocale(langLocale); // attempt to load the language
                }
                // the event that updates the language
            });
        } else {
            console.warn(CONSOLE_NAME, 'passed an invalid select element. Ignoring...');
        }
    }

    // create a basic event handler binding for any language selector menus.
    // note that you don't need
    function populateLanguageSelectMenus(defaultLocale){
        var langSelectMenus = document.querySelectorAll('select[data-cosmic-lang-select]'),
            langSelectNode,
            i = langSelectMenus.length, j;

        // loop through each of the avaliable menus
        while (i--){
            langSelectNode = langSelectMenus[i]; // create iterator node

            j = availableLocales.length;

            // add all of the options
            while (j--){
                langSelectNode.innerHTML += '<option value="' + availableLocales[j] + '">' + availableLocales[j] + '</option>';
            }

            // set the pre-selected locale
            langSelectNode.value = defaultLocale; // set the default display language

            // bind the event handler
            addMenuLanguageChangeEvent(langSelectNode);
        }
    }

    // simple function that returns readonly value for current Locale
    function getCurrentLocale(){
        return currentLocale;
    }

    // function that runs each change event that is registered
    function runLanguageChangeEvents(){
        var i = updateLanguageEvents.length;

        while (i--){
            // the items in storage should be only function so execute it.
            updateLanguageEvents[i](getCurrentLocale());
        }
    }

    // adds a function to the event handler array. Will execute when a language is loaded
    function addUpdateEvent(event){
        if (typeof event === "function"){
            // it's a function so let's check if it already exists.
            if (updateLanguageEvents.indexOf(event) === -1){
                // it's not there so we will push the event
                updateLanguageEvents.push(event);
            } else {
                // the event already exists in storage
                console.warn(CONSOLE_NAME, event, 'is already registered as an event. Ignoring.');
            }
        } else {
            console.warn(CONSOLE_NAME, event, 'is not a valid function. Ignoring.');
        }
    }

    // removes a function from the event handler array.
    function removeUpdateEvent(event){
        if (typeof event === "function"){
            // it's a function so let's check if it already exists.

            var index = updateLanguageEvents.indexOf(event);

            if (index > -1){
                // the event exists so we will remove it.
                updateLanguageEvents.splice(index, 1); // prune the event
            } else {
                // the event already exists in storage
                console.warn(CONSOLE_NAME, event, 'does not exist. Ignoring.');
            }
        } else {
            console.warn(CONSOLE_NAME, event, 'is not a valid function. Ignoring.');
        }
    }

    /*  so now let's put the location where we will inject the language data/
    gulp if fairly reliable as it's able errors, but in the unlikely event that
    something goes wrong we need to throw an error so the app does not continue to mess up */

    try{
        nodeLanguageData = /#_COSMIC_NODE_LANG_DATA_#/; // this will get replaced when we build
        // double-check to see if thecurrentLocale: getCurrentLocale object is an object, while also potentially setting the locale object
        // if the above is not an object, this will thrown an error and let the application know
        availableLocales = Object.keys(nodeLanguageData);

        if (typeof nodeLanguageData !== "object"){
            throw 'BAD_DATA';
        }
    } catch (e){
        // if this happens then likely the data was somehow corrupted (and the build process missed it)
        // so we should log it. In a production environment. You should also add an event to inform the user
        // that the app has failed.

        console.error(CONSOLE_NAME, 'Language data is invalid or missing. Please consult build logs for more info.');
    }

    // now let's try to set the default language locale
    try{
        defaultLocale = /#_COSMIC_NODE_DEFAULT_LANG_#/;
        if (typeof defaultLocale !== "string"){
            throw 'NO_DEFAULT';
        }
    } catch (e){
        console.warn(CONSOLE_NAME, "Default language is not configured. Will use first keyed language");
        // if there are already language locales available, then change set it to the first available locale. Else set to null
        // Note: that if there aren't any available languages, the app should show an error regardless.
        defaultLocale = (Array.isArray(availableLocales)) ? availableLocales[0] : null;
    }

    // alright, so now let's see if we have any data to parse
    if (nodeLanguageData && defaultLocale){
        // there is valid language data we can parse

        /* get fresh-listing of data-cosmic-node elements */
        refreshNodeDataElements(); // populate the NodeElement list with valid node Elements

        /* select default language */
        loadLanguageFromLocale(defaultLocale); // load the default language (or the first keyed language if not set)

        /* auto-fill and bind events to pre-made select menus */
        populateLanguageSelectMenus(defaultLocale); // populate menu

        // flag the app letting it know that it supports languages now
        exportHasLanguageData = true;
        bodyClass.add('lang');
    } else {
        // it's not valid and we should inform the user
        console.error(CONSOLE_NAME, 'There is no language data to load');

        if (typeof AppError !== "undefined") AppError.trigger('No language data set');
    }

    /* alright, so at this point it's safe to assume that we either have a set of usable language data for the
     application, or that the application does not have applicable code. Regardless of the case, the language methods should
     be exported so the application does not become broken due to missing data */

    var exports = {
        enabled: exportHasLanguageData, // boolean - states whether there is language data addable
        loadFromLocale: loadLanguageFromLocale, // method - attempts to render a language based on a specified locale
        refreshNodeCache: refreshNodeDataElements, // method - caches any instances of [data-cosmic-node] elements
        currentLocale: getCurrentLocale, // getter - string - a getter function that returns the current value of the set locale
        getString: getLanguageStringFromKey, // getter - returns a string based on key {uses currently set locale by default}
        addUpdateEvent: addUpdateEvent, // function - adds a function to an array of events that will fire whenever a language is changed
        removeUpdateEvent: removeUpdateEvent // function - removes a specified function from the event handler list
    };

    if (typeof window[EXPORT_NAME] === "undefined"){
        // it's not already defined so export the module
        // since we are already using ES5, let's use Object.freeze to prevent outside JS from altering contents
        window[EXPORT_NAME] = Object.freeze(exports);
    } else {
        // complain
        console.warn(EXPORT_NAME, 'has already been exported. Refusing to redeclare.');
    }
})(window, document, document.body.classList, AppError);