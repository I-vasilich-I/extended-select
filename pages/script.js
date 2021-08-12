
const select = document.getElementsByTagName('select');
[...select].forEach(elem => elem.addEventListener('change', (e) => {
  console.log(e.target.value);
}));

const getAttribute = (element, attrName) => {
  if (!element || !attrName) return;
  const attributes = [...element.attributes];
  const dataAtr = attributes.find(elem => elem.name === attrName);
  return !dataAtr ? null : dataAtr.value;
}

const getDataLevel = (option) => {
  if (!option) return 0;
  return getAttribute(option, 'data-level');
}

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
    }

    if (!level) {
      optionsArrayData.push(obj);
      return;
    } 

    if (level > prevLevel) {
      obj.parent = optionsArrayData[id - 1];
      optionsArrayData[id - 1]?.children.push(obj);
    }

    if (level === prevLevel) {
      obj.parent = optionsArrayData[id - 1].parent
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
}

const generateCustomSelect = (optionsArrayData, { selectName, selectedItems }, wrapperDiv) => {
  
  const selectDiv = create('div', 'select', null, wrapperDiv);
  const selectContainerDiv = create('div', 'select-container', null, selectDiv);
  const titleContainerDiv = create('div', 'title-container', null, selectContainerDiv);
  const selectTitleP = create('p', 'select__title', null, titleContainerDiv);
  selectTitleP.innerHTML = selectName;
  const showSelectedP = create(
    'p', 
    selectedItems 
    ? 'show-selected' 
    : 'show-selected show-selected--hidden', 
    null, 
    titleContainerDiv
  );
  showSelectedP.innerHTML = `Показать выбранное (${selectedItems})`;
  const selectRootDiv = create('div', 'select-root', null, selectContainerDiv);
  selectRootDiv.innerHTML = 'Код ОКРБ или наименование закупаемой продукции';

  const customSelectDiv = create('div', 'custom-select custom-select--hidden', null, selectDiv);
  const searchContainerDiv = create('div', 'search-container', null, customSelectDiv)
  const searchNavDiv = create('div', 'search__navigation', null, searchContainerDiv);
  const backImg = create('img', 'back', null, searchNavDiv, ['src', "../assets/images/ic_backArrow.svg"], ['alt', 'back']);
  const searchNavP = create('p', null, null, searchNavDiv);
  searchNavP.innerHTML =  'Реализуемые товары';
  const searchInput = create('input', 'search__input', null, searchContainerDiv, ['type', 'text'], ['placeholder', 'Код ОКРБ или наименование закупаемой продукции']);
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
    if (elem.level) selectItemContainerDiv.dataset['level'] = elem.level;
    const selectItemCheckboxDiv = create(
      'div', 
      elem.checked 
      ? 'select-item__checkbox select-item__checkbox--checked' 
      : 'select-item__checkbox', 
      null, 
      selectItemContainerDiv
    );
    create('div', 'checkbox-dot checkbox-dot--hidden', null, selectItemCheckboxDiv);
    create('img', null, null, selectItemCheckboxDiv, ['src', '../assets/images/check.svg'], ['alt', 'check']);
    const selectItemTextP = create('p', 'select-item__text', null, selectItemContainerDiv);
    selectItemTextP.innerHTML = elem.option.innerHTML;
    if (elem.children.length) create('img', 'arrow', null, selectItemTextP, ['src', '../assets/images/Vector.svg'], ['alt', 'arrow']);
    elem.itemContainer = selectItemContainerDiv;
    return selectItemContainerDiv;
  });
  const selectItemsDiv = create('div', 'select-items', selectItemsArray, selectItemsContainerDiv);
  
  const footerDiv = create('div', 'custom-select__footer', null, customSelectDiv);
  create('button', 'footer__button footer__button--primarily', null, footerDiv).innerHTML = 'Применить';
  create('button', 'footer__button footer__button--secondary', null, footerDiv).innerHTML = 'Очистить'

  const checkedRoot = selectItemsDiv.querySelector('.select-item__container--checked');
  if (checkedRoot) selectRootDiv.innerHTML = checkedRoot?.children[1]?.innerText;
  else selectRootDiv.classList.add('select-root--empty');

  return { selectItemsDiv, selectContainerDiv, customSelectDiv }
}

const toggleCheckboxAllChildren = (option, isChecked) => {
  if (!option.children.length) return;
  
  option.children.map(elem => {
    if (isChecked) {
      elem.itemContainer?.classList.remove('select-item__container--checked');
      elem.itemContainer?.children[0]?.classList.remove('select-item__checkbox--checked');
      elem.checked = false;
    } else {
      const dotDiv = elem.parent.itemContainer.children[0].children[0];
      dotDiv.classList.add('checkbox-dot--hidden');
      elem.itemContainer?.classList.add('select-item__container--checked');
      elem.itemContainer?.children[0]?.classList.add('select-item__checkbox--checked');
      elem.checked = true
    } 
    toggleCheckboxAllChildren(elem, isChecked);
    return elem;
  });
}

const toggleCheckAllParents = (option) => {
  if (!option.parent) return;
  const checkCount = option.parent.children.reduce((acc, b) => acc + b.checked, 0);
  const childrenCount = option.parent.children.length;
  const dotDiv = option.parent.itemContainer.children[0].children[0];
  if (checkCount === childrenCount) {

    option.parent.checked = !option.parent.checked;
    option.parent.itemContainer.classList.toggle('select-item__container--checked');
    option.parent.itemContainer.children[0]?.classList.toggle('select-item__checkbox--checked');
  } else if (option.parent.checked) {

    option.parent.checked = !option.parent.checked;
    option.parent.itemContainer.classList.toggle('select-item__container--checked');
    option.parent.itemContainer.children[0]?.classList.toggle('select-item__checkbox--checked');
  } 
  toggleCheckAllParents(option.parent);
}

const togglePartialCheckAllParents = (option, isPartial) => {
  if (!option.parent) return;
  const dotDiv = option.parent.itemContainer.children[0].children[0];
  const checkCount = option.parent.children.reduce((acc, b) => acc + b.checked, 0);
  const childrenCount = option.parent.children.length;
  if (isPartial && checkCount < childrenCount) dotDiv.classList.remove('checkbox-dot--hidden');
  else dotDiv.classList.add('checkbox-dot--hidden');
  togglePartialCheckAllParents(option.parent, isPartial);
}

const checkboxHandler = (e, optionsArrayData) => {
  const checkbox = e.target.closest('.select-item__checkbox');
    if (!checkbox) return;
    const itemContainer = checkbox?.closest('.select-item__container');
    const option = optionsArrayData.find((elem) => elem.itemContainer === itemContainer);
    toggleCheckboxAllChildren(option, option.checked);
    checkbox?.classList.toggle('select-item__checkbox--checked');
    itemContainer?.classList.toggle('select-item__container--checked');
    option.checked = !option.checked;
    toggleCheckAllParents(option);
    //togglePartialCheckAllParents(option, option.checked);
}

const toggleExpandAllChildren = (option, isExpanded) => {
  if (!option.children.length) return;
  option.children.map((elem) => {
    if (isExpanded) {
      elem.itemContainer?.classList.add('select-item__container--hidden'); 
      elem.isExpanded = false;
    } else {
      elem.itemContainer?.classList.remove('select-item__container--hidden');
      elem.itemContainer?.children[1]?.children[0]?.classList.remove('arrow--closed');
      elem.isExpanded = true;
    } 
    toggleExpandAllChildren(elem, isExpanded);
    return elem;
  });
}

const expandHandler = (e, optionsArrayData) => {
  const arrow = e.target.closest('.arrow');
  if (!arrow) return;
  const itemContainer = arrow?.closest('.select-item__container');
  const option = optionsArrayData.find((elem) => elem.itemContainer === itemContainer);
  if (option.isExpanded) toggleExpandAllChildren(option, true);
  else toggleExpandAllChildren(option, false);
  option.isExpanded = !option.isExpanded;
  arrow.classList.toggle('arrow--closed');
}

const backHandler = (e, customSelectDiv) => {
  const back = e.target.closest('.back');
  if (!back) return;
  customSelectDiv.classList.add('custom-select--hidden');
  
}

const unCheckAllOptions = ({ selectItemsDiv, optionsArrayData, selectContainerDiv }) => {
  const [...checkedOptionDivs] = selectItemsDiv.querySelectorAll('.select-item__container--checked');
  const checkedValues = checkedOptionDivs.map((elem) => {
    elem.children[0].classList.remove('select-item__checkbox--checked');
    elem.classList.remove('select-item__container--checked');
    return getAttribute(elem, 'value');
  });
  optionsArrayData.filter((elem) => checkedValues.includes(elem.value)).map((el) => {
    el.select.dispatchEvent(new Event('change'));
    el.checked = false;
    el.option.removeAttribute('selected');
  });
  
  selectContainerDiv.children[1].innerHTML = 'Код ОКРБ или наименование закупаемой продукции';
  selectContainerDiv.children[1].classList.add('select-root--empty');
  selectContainerDiv.children[0].children[1].classList.add('show-selected--hidden');
}

const clearButtonHandler = (e, args) => {
  const clearButton = e.target.closest('.footer__button--secondary');
  if (!clearButton) return;
  unCheckAllOptions(args);
}

const submitButtonHandler = (e, customSelectDiv, selectItemsDiv, selectContainerDiv, optionsArrayData) => {
  const submitButton = e.target.closest('.footer__button--primarily');
  if (!submitButton) return;
  const checkedRoot = selectItemsDiv.querySelectorAll('.select-item__container--checked');
  if (!checkedRoot.length) return;
  selectContainerDiv.children[1].innerHTML = checkedRoot[0]?.children[1]?.innerText;
  selectContainerDiv.children[1].classList.remove('select-root--empty');
  selectContainerDiv.children[0].children[1].classList.remove('show-selected--hidden');
  selectContainerDiv.children[0].children[1].innerHTML = `Показать выбранное (${checkedRoot.length})`
  customSelectDiv.classList.add('custom-select--hidden');
  const checkedValues = [...checkedRoot].map(element => getAttribute(element, 'value'));
  optionsArrayData.filter((elem) => checkedValues.includes(elem.value)).map((el) => {
    el.select.dispatchEvent(new Event('change'));
    el.option.setAttribute('selected', true);
  });

}

const clearInputInnerHtml = (elem) => {
  let { innerHTML } = elem;
  innerHTML = innerHTML.replaceAll('<b>','');
  innerHTML = innerHTML.replaceAll('</b>','');
  elem.innerHTML = innerHTML;
  console.log(elem.innerHTML)
}

const searchInputEventHandler = (customSelectDiv, selectItemsDiv) => {
  const selectItems = [...selectItemsDiv.children];
  const searchInput = customSelectDiv.querySelector('.search__input');
  searchInput.addEventListener('input', (e) => {
    const searchPhrase = e.target.value;
    const selectItemsTextArray = selectItems.map((el) => el.children[1]);
    
    selectItemsTextArray.forEach((elem) => {
      if (!searchPhrase) {
        clearInputInnerHtml(elem);
        return;
      };
      clearInputInnerHtml(elem);
      const { innerHTML } = elem;
      const newInnerHtml = innerHTML.replaceAll(searchPhrase, `<b>${searchPhrase}</b>`);
      elem.innerHTML = newInnerHtml;
    });
  })
}

const customSelectEventHandler = (customSelectDiv, selectItemsDiv, selectContainerDiv, optionsArrayData) => {
  customSelectDiv.addEventListener('click', (e) => {
    checkboxHandler(e, optionsArrayData);
    expandHandler(e, optionsArrayData);
    backHandler(e, customSelectDiv);
    clearButtonHandler(e, { selectItemsDiv, optionsArrayData, selectContainerDiv });
    submitButtonHandler(e, customSelectDiv, selectItemsDiv, selectContainerDiv, optionsArrayData);
  });

  searchInputEventHandler(customSelectDiv, selectItemsDiv);
}

const selectContainerEventHandler = (selectContainerDiv, customSelectDiv) => {
  selectContainerDiv.addEventListener('click', (e) => {
    const selectRoot = e.target.closest('.select-root');
    const showSelected = e.target.closest('.show-selected');
    if (!selectRoot && !showSelected) return;
    customSelectDiv.classList.remove('custom-select--hidden');
  })
}


const customeSelect = () => {
  const selectElements = [...document.getElementsByTagName('select')];
  const { body } = document;
  const wrapperDiv = create('div', 'wrapper', null, body);
  selectElements.forEach((elem) => {
    const { optionsArrayData, selectData } = getSelectData(elem);
    const { selectItemsDiv, selectContainerDiv, customSelectDiv } = generateCustomSelect(optionsArrayData, selectData, wrapperDiv);
    customSelectEventHandler(customSelectDiv, selectItemsDiv, selectContainerDiv, optionsArrayData);
    selectContainerEventHandler(selectContainerDiv, customSelectDiv);
  })
}

customeSelect();

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
    dataAttr.forEach(([ attrName, attrValue ]) => {
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


function Event( event, params ) {
  params = params || { bubbles: false, cancelable: false, detail: undefined };
  const evt = document.createEvent('CustomEvent');
  evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
  return evt;
}

