// helpers
function create(el, classNames, child, parent, ...dataAttr) {
  let elem = null;
  try {
    elem = document.createElement(el);
  } catch (e) {
    throw new Error('Unable to create HTMLElemnt! Wrong data');
  }

  if (classNames) elem.classList.add(...classNames.split(' '));

  if (child && Array.isArray(child)) {
    child.forEach((childElem) => childElem && elem.appendChild(childElem));
  } else if (child && typeof child === 'object') {
    elem.appendChild(child);
  } else if (child && typeof child === 'string') {
    elem.innerHTML = child;
  }

  if (parent) {
    parent.appendChild(elem);
  }

  if (dataAttr.length) {
    dataAttr.forEach(([attrName, attrValue]) => {
      if (attrValue === '') {
        elem.setAttribute(attrName, '');
      }
      if (attrName.match(/value|id|placeholder|rows|autocorretc|spellcheck|src|alt|type/)) {
        elem.setAttribute(attrName, attrValue);
      } else {
        elem.dataset[attrName] = attrValue;
      }
    });
  }
  return elem;
}

function Event(event, params) {
  params = params || { bubbles: false, cancelable: false, detail: undefined };
  const evt = document.createEvent('CustomEvent');
  evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
  return evt;
}

const getAttribute = (element, attrName) => {
  if (!element || !attrName) return;
  const attributes = [...element.attributes];
  const dataAtr = attributes.find((elem) => elem.name === attrName);
  return !dataAtr ? null : dataAtr.value;
};

const getDataLevel = (option) => {
  if (!option) return 0;
  return getAttribute(option, 'data-level');
};

const getSelectData = (select) => {
  const selectOptions = [...select];
  const optionsArrayData = [];
  let selectedItems = 0;
  selectOptions.map((elem, id, arr) => {
    selectedItems += elem.selected;
    const level = getDataLevel(elem);
    const prevLevel = getDataLevel(arr[id - 1]);
    const obj = {
      option: elem,
      select,
      level,
      value: elem.value,
      parent: null,
      children: [],
      checked: elem.selected,
      isExpanded: true,
      isPartial: false,
    };

    if (!level) {
      optionsArrayData.push(obj);
      return;
    }

    if (level > prevLevel) {
      obj.parent = optionsArrayData[id - 1];
      optionsArrayData[id - 1]?.children.push(obj);
    }

    if (level === prevLevel) {
      obj.parent = optionsArrayData[id - 1].parent;
      optionsArrayData[id - 1].parent.children.push(obj);
    }

    if (level < prevLevel) {
      obj.parent = optionsArrayData[id - 1].parent.parent;
      optionsArrayData[id - 1].parent.parent.children.push(obj);
    }

    optionsArrayData.push(obj);
  });

  const selectData = {
    selectName: select.name,
    selectedItems,
  };

  return { optionsArrayData, selectData };
};

const generateCustomSelect = (optionsArrayData, { selectName, selectedItems }, wrapperDiv) => {
  const selectDiv = create('div', 'select', null, wrapperDiv);
  const selectContainerDiv = create('div', 'select-container', null, selectDiv);
  const titleContainerDiv = create('div', 'title-container', null, selectContainerDiv);
  const selectTitleP = create('p', 'select__title', null, titleContainerDiv);
  selectTitleP.innerHTML = selectName;
  const showSelectedP = create(
    'p',
    selectedItems ? 'show-selected' : 'show-selected show-selected--hidden',
    null,
    titleContainerDiv
  );
  showSelectedP.innerHTML = `Показать выбранное (${selectedItems})`;
  const selectRootDiv = create('div', 'select-root', null, selectContainerDiv);
  selectRootDiv.innerHTML = 'Код ОКРБ или наименование закупаемой продукции';

  const customSelectDiv = create('div', 'custom-select custom-select--hidden', null, selectDiv);
  const searchContainerDiv = create('div', 'search-container', null, customSelectDiv);
  const searchNavDiv = create('div', 'search__navigation', null, searchContainerDiv);
  create(
    'img',
    'back',
    null,
    searchNavDiv,
    ['src', './assets/images/ic_backArrow.svg'],
    ['alt', 'back']
  );
  const searchNavP = create('p', null, null, searchNavDiv);
  searchNavP.innerHTML = 'Реализуемые товары';
  create(
    'input',
    'search__input',
    null,
    searchContainerDiv,
    ['type', 'text'],
    ['placeholder', 'Код ОКРБ или наименование закупаемой продукции']
  );
  const selectItemsContainerDiv = create('div', 'select-items__container', null, customSelectDiv);
  const selectItemsArray = optionsArrayData.map((elem) => {
    const selectItemContainerDiv = create(
      'div',
      elem.checked
        ? 'select-item__container select-item__container--checked'
        : 'select-item__container',
      null,
      null,
      ['value', elem.value]
    );
    if (elem.level) selectItemContainerDiv.dataset.level = elem.level;
    const selectItemCheckboxDiv = create(
      'div',
      elem.checked
        ? 'select-item__checkbox select-item__checkbox--checked'
        : 'select-item__checkbox',
      null,
      selectItemContainerDiv
    );
    create('div', 'checkbox-dot checkbox-dot--hidden', null, selectItemCheckboxDiv);
    create(
      'img',
      null,
      null,
      selectItemCheckboxDiv,
      ['src', './assets/images/check.svg'],
      ['alt', 'check']
    );
    const selectItemTextP = create('p', 'select-item__text', null, selectItemContainerDiv);
    selectItemTextP.innerHTML = elem.option.innerHTML;
    if (elem.children.length)
      create(
        'img',
        'arrow',
        null,
        selectItemTextP,
        ['src', './assets/images/Vector.svg'],
        ['alt', 'arrow']
      );
    elem.itemContainer = selectItemContainerDiv;
    return selectItemContainerDiv;
  });
  const selectItemsDiv = create('div', 'select-items', selectItemsArray, selectItemsContainerDiv);

  const footerDiv = create('div', 'custom-select__footer', null, customSelectDiv);
  create('button', 'footer__button footer__button--primarily', null, footerDiv).innerHTML =
    'Применить';
  create('button', 'footer__button footer__button--secondary', null, footerDiv).innerHTML =
    'Очистить';

  const checkedRoot = selectItemsDiv.querySelector('.select-item__container--checked');
  if (checkedRoot) selectRootDiv.innerHTML = checkedRoot.children[1].innerText;
  else selectRootDiv.classList.add('select-root--empty');

  return { selectItemsDiv, selectContainerDiv, customSelectDiv };
};

export { create, Event, getAttribute, getSelectData, generateCustomSelect };
