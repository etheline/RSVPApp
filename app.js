document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrar');
    const input = form.querySelector('input');
    const main = document.querySelector('.main');
    const ul = document.getElementById('invitedList');

    // Update page with previous guest data stored in localStorage everytime page is loaded if browser supports web storage
    window.onload = () => {
      if (typeof(Storage) !== "undefined") {
        for (var i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i); 
          if (!key.includes('Status')) {
            let value = localStorage.getItem(key);
            const newLI = createLI(value);
            ul.appendChild(newLI);
            const selector = newLI.querySelector('select');
            value = localStorage.getItem(`${value}Status`);
            selector.value = value; // update to previously selected option
            if (value === 'Confirmed') { // add styles to confirmed guests
              newLI.className = 'responded';
            }
          }
        }
      } else { // This browser doesn't support Web Storage
        console.log('No web storage support');
      }
    };
    
  
    // Filter check box to hide guests that haven't confirmed yet 
    const div = document.createElement('div');
    const filterLabel = document.createElement('label');
    const filterButton = document.createElement('input');
    filterLabel.textContent = "Hide those who haven't responded";
    filterButton.type = 'checkbox';
    div.appendChild(filterLabel);
    div.appendChild(filterButton);
    main.insertBefore(div, ul);
    
    // Functionality handling checked vs. unchecked filterButton
    filterButton.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const guests = ul.childNodes;
      if (isChecked) {
        for (const guest of guests) {
          if (guest.className !== 'responded') {
            guest.style.display = 'none'; 
          }
        }
      } else {
        for (const guest of guests) {
          if (guest.className !== 'responded') {
            guest.style.display = ''; 
          }
        }
      }                            
    });
  
    // Creates and returns a new list element with name  
    function createLI(name) {
      function createElement(elementName, property, value) {
        const elem = document.createElement(elementName);
        elem[property] = value;
        return elem;
      }
      
      // Appends an elementName element with property = value to parent element
      function appendToParent(parent, elementName, property, value) {
        const elem = createElement(elementName, property, value);
        parent.appendChild(elem);
        return elem;
      }
      
      // Creates an option element with text and appends to selector
      function addOption(text) {
        const option = createElement('option', 'textContent', text); 
        option.value = text;
        select.appendChild(option);
      }

      // Updates CSS style of confirmed guests 
      function updateStatus(e) {
        const selector = e.target; 
        const li = selector.parentNode.parentNode;
        if (selector.value === 'Confirmed') {
          li.className = 'responded';
        } else {
          li.className = '';
        } 
      }
      
      const li = document.createElement('li');
      appendToParent(li, 'span', 'textContent', name);

      // Selector
      const label = appendToParent(li, 'label', 'textContent', 'Status'); 
      label.for = 'status'; 
      const select = appendToParent(li, 'select', 'name', 'status'); 
      addOption('Unconfirmed');
      addOption('Confirmed');
      addOption('Not coming');
      label.appendChild(select);
      select.addEventListener('change', e => updateStatus(e));
      
      // Edit & Remove buttons
      appendToParent(li, 'button', 'textContent', 'Edit');
      appendToParent(li, 'button', 'textContent', 'Remove');
      
      // Notes text area
      const div = document.createElement('div');
      appendToParent(div, 'label', 'textContent', 'Notes');
      appendToParent(div, 'textarea', 'rows', 4);
      li.appendChild(div);
      
      return li;
    }
    
    // Add new person to list and clear input when you're done            
    form.addEventListener('submit', (e) => {
      // cancels browser's default submit behavior (refreshing page) 
      e.preventDefault();
      // Reject empty inputs 
      if (input.value === '') {
        alert("You didn't write a name yet");
        return;
      }
      // Reject if name already exists 
      for (const guest of ul.childNodes) {
        if (guest.querySelector('span').textContent === input.value) {
          alert("Entered this name already");
          return;
        }
      }
      const li = createLI(input.value);
      ul.appendChild(li);
      input.value = '';
    });

    // Handles different click events to a guest
    ul.addEventListener('click', (e) => {
      // filter for clicks on all buttons
      if (e.target.tagName === 'BUTTON') {
        const button = e.target;
        const li = button.parentNode;
        const buttonName = button.textContent;
        const nameActions = {
          clearStorage: (name) => {
            if (typeof(Storage) !== 'undefined') {
              localStorage.removeItem(name);
              localStorage.removeItem(`${name}Status`);
            }
          },
          Remove: () => {
            li.remove();
            const name = li.querySelector('span').textContent;
            nameActions.clearStorage(name);
          }, 
          Edit: () => {
            const span = li.firstElementChild;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = span.textContent;
            input.id = span.textContent;
            const currName = span.textContent;
            li.insertBefore(input, span);
            span.remove();
            button.textContent = 'Save';
            // store guest in local storage if it hasn't been stored yet 
            if (typeof(Storage) !== "undefined" && localStorage.getItem(currName) === null) {
              const status = input.nextElementSibling.querySelector('select').value;
              localStorage.setItem(currName, currName);
              localStorage.setItem(`${currName}Status`, status);
            } else {
              console.log('No web storage support');
            }
          }, 
          Save: () => {
            const input = li.firstElementChild;
            const span = document.createElement('span');
            span.textContent = input.value;
            li.insertBefore(span, input);
            input.remove();
            button.textContent = 'Edit';
            // Remove old name once you've saved new guest name from local storage  
            if (typeof(Storage) !== "undefined") {
              nameActions.clearStorage(input.id); 
            } else {
              console.log('No web storage support');
            }
          }
        };
        // Select and run action that corresponds to button Name 
        nameActions[buttonName]();
      } 
    });


    // Store data in local storage before page reloads
    window.addEventListener("beforeunload", () => {
      // Check for existence of storage before using 
      if (typeof(Storage) !== "undefined") {
        for (const li of ul.childNodes) {
          if (li.firstElementChild.tagName === 'SPAN') {
            const name = li.querySelector('span').textContent;
            const status = li.querySelector('select').value;
            localStorage.setItem(name, name);
            localStorage.setItem(`${name}Status`, status);
          }
        } 
      } else {
        console.log('No web storage support');
      }
    });
  });