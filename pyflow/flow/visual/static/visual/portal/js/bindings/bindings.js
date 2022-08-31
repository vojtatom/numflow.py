
window.onload = function(e){ 
    let observer = new MutationObserver(function callback(mutationList, observer) {
        mutationList.forEach((mutation) => {
            switch(mutation.type) {
                case 'childList':
                    /* One or more children have been added to and/or removed
                    from the tree; see mutation.addedNodes and
                    mutation.removedNodes */
                    console.log(mutation.addedNodes);
                    console.log(mutation.removedNodes);
    
                    break;
                case 'attributes':
                    /* An attribute value changed on the element in
                    mutation.target; the attribute name is in
                    mutation.attributeName and its previous value is in
                    mutation.oldValue */
                    console.log(mutation.target);
                    console.log(mutation.attributeName);
                    console.log(mutation.oldValue);

                    break;
                }
            });
        });
    let observerOptions = {
        childList: true,
        attributes: true,
        subtree: false //Omit or set to false to observe only changes to the parent node.
        }
          
    observer.observe(document.getElementById('main'), observerOptions);

}