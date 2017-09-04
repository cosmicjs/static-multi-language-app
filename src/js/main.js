(function(window, document, CosmicLanguage, AppError){

    // define namespaced variables
    var addButton = document.getElementById('add-button'),
        subButton = document.getElementById('sub-button'),
        countDisplay = document.getElementById('current-count'),
        counterMessage = document.getElementById('count-message');

    var counterState = 0;

    // function that updates the count display when the count is changed
    function modifyCounter(delta){
        // push the change change to the display while also updating the counter
        countDisplay.innerHTML = (counterState += Number(delta))
    }

    // let's define a event that will fire a special event whenever the language gets changed
    function renderCountMessage(){
        var renderName = null,
            absCounterState = Math.abs(counterState);

        // since the buttons in the demo are only incrementing by one, there is no need to go crazy with logic
        // only update the display when certain state criteria are met
        if (absCounterState == 0){
            renderName = 'counter-none';
        } else if (absCounterState > 0 && absCounterState < 24){
            renderName = 'counter-decent';
        } else if (absCounterState >= 24 && absCounterState < 50){
            renderName = 'counter-more';
        } else if (absCounterState >= 50){
            renderName = 'counter-tons';
        }

        if (renderName && counterMessage) {
            var newRender = CosmicLanguage.getString(renderName); // get a cache value of the state

            if (counterMessage.innerHTML != newRender){
                // if the old value and the new aren't equal -> render
                counterMessage.innerHTML = newRender;
            }
        }
    }

    function modifyCounterEvent(e){
        // increment if the clicked element (or it's parent) is the addButton
        // decrease the counter otherwise
        var amount =  (e.target.id === addButton.id || e.target.parentNode.id === addButton.id) ? 1 : -1;

        modifyCounter(amount); // apply the change and display it.
        renderCountMessage(); // update the counter message
    }

    if (CosmicLanguage.enabled){
        // we have language support!

        if (addButton && subButton && countDisplay){
            // we also have a working set of elements

            // bind the events
            addButton.addEventListener('click', modifyCounterEvent);
            subButton.addEventListener('click', modifyCounterEvent);

            // update the language message whenever the language changed.
            CosmicLanguage.addUpdateEvent(renderCountMessage);

            renderCountMessage();
            // set up the initial count display
            modifyCounter(counterState);
        }
    }
})(window, document, CosmicLanguage, AppError);