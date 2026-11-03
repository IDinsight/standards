const list = document.querySelector('#contacts');

function render(contacts) {
  list.replaceChildren(...contacts.map((contact) => {
    const item = document.createElement('li');
    item.textContent = contact.name + ' <' + contact.email + '>';
    return item;
  }));
}

const response = await fetch('/contacts');
render(await response.json());
