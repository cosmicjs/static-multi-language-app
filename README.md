# Multi-Language Static Web Application
![Multi-Language Static App](https://cosmicjs.com/uploads/e42c0fd0-923e-11e7-a292-7fa737c9dc7c-muli-lang-app.jpg)

#### [View Demo](https://cosmicjs.com/apps/static-multi-language-app)

## Why?
1. The ability to manage content from the [Cosmic JS CMS API](https://cosmicjs.com)
2. The speed of bundling data directly within your JavaScript
3. The ability to change the display language of your application on the fly (without using AJAX)

## How it works
1. The build process uses the Cosmic JS API to fetch `Nodes`, and bundles it within the `bundle.js` file.
2. When the page is loaded, depending on your preferred method, the bundled Cosmic JS Language Library will load dynamicly
    rendered strings.
2. You then can use the bundled Cosmic Language Library to render and change languages on the fly.

## Article
For further reading, checkout the article [article-link](https://cosmicjs.com/blog/how-to-build-a-multi-language-static-website-without-ajax).

## Getting Started
### Install
Make sure you have `npm` and `git` installed before starting to work on this project. Once available, clone the repository using
`git clone` and install the required build dependencies with `npm install`.

```bash
git clone https://github.com/cosmicjs/static-multi-language-app
cd static-multi-language-app
npm install
```

### Running and building the environment
Once the dependencies are installed, you can build the demo application with the command `gulp build` (for production
environments) or `gulp dbuild` (for development environments).

By default, the application will attempt to fetch the `Nodes`
objects from the Cosmic JS API from the default application bucket. The now built environment should now be available in
the `build/` directory.

The command `gulp server` will open a web-server with the built content at `localhost:8080`.

### Add / Edit Content
You can easily manage the content in your static site on Cosmic JS.  Follow these steps:

1. [Log in to Cosmic JS](https://cosmicjs.com).
2. Create a bucket.
3. Go to Your Bucket > Apps.
4. Install the [Static Multi-Language App](https://cosmicjs.com/apps/static-multi-language-app)
5. Deploy your Static Site to the Cosmic App Server at Your Bucket > Web Hosting.

## Language runtime API
This project comes bundled with a custom EcmaScript5 Library for loading the bundled language content pulled from the
Cosmic JS API. The namespace of this library is `CosmicLanguage` which is available under the `window` object.

There are two ways to modify content on the page of your static application.

### Static content
By default, the language API looks for elements on the page with the attribute `[data-cosmic-node]` and caches them within
a list of elements. The method `CosmicLanguage.refreshNodeCache()` updates the list of cached elements.

When the method `CosmicLanguage.loadFromLocale('name-of-locale-as-string')` is run, all of the cached are loaded, and the
API looks for for matching values from the attribute's value. If found for the specified locale, the `innerHTML` will update
with the specified value.

#### Example:
```html 
<body>
    <div id="app">
        <!-- the below will look for a Node with the name "title-message" and will update
        it's innerHTML when the locale Changes --!> 
        <h1 data-cosmic-node="title-message"></h1>
    </div>
</body>
```
If a specified `Node` is not found, the `innerHTML` will be equivalent to `[name-of-slug@locale]`.

### Dynamic content
There will be instances where you wish to dynamically change content on certain conditions. In this case, the
language API provides methods that can return locale based strings based on the `Node` name.

#### Example:
```javascript

(function(window, document, CosmicLanguage){
    var element = document.getElementById('test');
    
    if (element && CosmicLanguage.enabled){
        // if the specified element and the language API is active
        
        // set the element to the node 'node-name' using the currently set locale
        element.innerHTML = CosmicLanguage.getString('node-name');
    }
})(window, document, CosmicLanguage);
```
When wanting to fetch a string from a custom locale, appending an extra string argument will attempt to fetch
the string from the specified locale instead of the globally set one. `e.g. CosmicLanguage.getString('node-name', 'en-US');`

A more in-depth example can be found within `src/js/main.js`, which contains a vanilla JS example of using
state with the application to modify the currently set strings.

## Updating the language (and rendering events)
The language API uses the method `loadFromLocale` to update the currently updated locale (if it exists). If the specified
locale does exist, then all of the `[node-data-cosmic]` elements will have updated `innerHTML` based on the node specified.

In cases where you are using dynamically fetched strings using `getString`, then the elements need to update when the locale
is changed. Fortunately, the language API features the methods `addUpdateEvent` and `removeUpdateEvent` to attach (or detatch)
events that will fire whenever the locale is updated using `loadFromLocale`.

## Example
```javascript
(function(window, document, CosmicLanguage){
    var element = document.getElementById('test');
    
    if (element && CosmicLanguage.enabled){
        // if the specified element and the language API is active
        
        // set the element to the node 'node-name' fusing the currently set locale
        element.innerHTML = CosmicLanguage.getString('node-name');
    }
    
    // now we will add the event listener that will update the element when the locale changes
    
    CosmicLanguage.addUpdateEvent(function(locale){
        // update the element's inner HTML with the new value
        element.innerHTML = CosmicLanguage.getString('node-name');
    });
    
})(window, document, CosmicLanguage);
```

When using custom events, the current active locale can also be fetched using the method `getLocale()`, which will return the
currently active locale name as a string. 

A more advanced example of the event binding can be also found in `src/js/main.js`.

## Language Configuration
Both the build process as well as `fetch.js` use a custom configuration found within the `config.js` file.

```javascript
module.exports = {
    // other configurations...
   lang: {
        defaultLocale: 'en-US',
   }
}
``` 
The value of `defaultLocale` points to the default locale that will be loaded to the static Cosmic JS app. It is not
required, but not including this configuration can lead to unexpected language selection within the application.

## Fetch Configuration
The data fetcher `fetch.js` uses custom configuration found within the `config.js` file.

```javascript
module.exports = {
    // other configurations...
   fetch: {
        file: 'src/cosmic-data.json',
        cache: false,
        NodeWhiteList: ['locale', 'slug', 'content'],
        NodeAllowedTags: ['a', 'b', 'i', 'span',,,]
    }
}
```

The value of `file` should be the location you wish to store any cached fetches. It is only relevant if the value of `cache`
is set to `true`. If caching is enabled, the the build process will check to see if a locally stored version of the fetch
is available before fetching from the Cosmic JS API.

`NodeWhiteList` is the list of `Object` properties that are not filtered out when fetching data. **This should typically not
be altered unless you are using custom data within your `Nodes` for your own purposes.**

`NodeAllowedTags` is an `Array` of `strings` that only allow specified HTML elements within the `content` section of the
fetched data. Since `Nodes` are only intended to store small amount of inline data, adding block elements can potentially
affect the layout of the application.

## Error Handling
The included `src/js/error.js` should be (and by default is) included first in the build process. It exports an object to
the `window` object called `AppError`, which has a single method of `trigger`.

When this event is fired, (should you choose to keep the `noscript#js-error` Element in you `src/html/main.html`), the app
will stop displaying `#app` and will only show the error on the screen with the corresponding message.

#### Example:
```javascript
(function(window, document, AppError){
    
   var someElement = document.getElementById('element');
   
   if (someElement){
       // do something
   } else {
       // this should only be done if the error is Fatal
       AppError.trigger('The important element is not available');
   }
})(window, document, AppError);
```
If there is no valid language Data, this AppError is displayed by default (if the Object exists).
