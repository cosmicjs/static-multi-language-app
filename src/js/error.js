(function(window, document){
    var EXPORT_NAME = 'AppError'; // the name we will be using for global calls

    // setup error element
    var oldErrorWrapper = document.getElementById('js-error');
    var ErrorElement = null;
    var ErrorMessage = null;

    if (oldErrorWrapper){
        // the old error wrapper exists
        var testElement = document.createElement('div'); // create temp element

        // set outerHTML
        testElement.innerHTML = oldErrorWrapper.textContent;

        ErrorElement = testElement.querySelector('#error');

        if (ErrorElement){
            // add inner element and remove old noscript tag

            ErrorMessage = ErrorElement.getElementsByTagName('span')[0];

            document.body.appendChild(ErrorElement);
            document.body.removeChild(oldErrorWrapper);
        }
    }

    function newError(message){
        document.body.classList.add('error');

        if (ErrorMessage){
            ErrorMessage.innerHTML = message;
        }
    }

    var exports = {
        trigger: newError
    };

    if (typeof window[EXPORT_NAME] === "undefined"){
        // it's not already defined so export the module
        // since we are already using ES5, let's use Object.freeze to prevent outside JS from altering contents
        window[EXPORT_NAME] = Object.freeze(exports);
    } else {
        // complain
        console.warn(EXPORT_NAME, 'has already been exported. Refusing to redeclare.');
    }
})(window, document);