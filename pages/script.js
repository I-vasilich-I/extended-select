
const select = document.getElementsByTagName('select');
select[0].addEventListener('click', () => {
  console.log('click');
})

const getDataLevel = (option) => {
  if (!option) return 0;
  const attributes = [...option.attributes];
  const dataAtr = attributes.find(elem => elem.name === 'data-level');
  if (!dataAtr) return null;
  return dataAtr.value;
}



const getSelectOptionsData = (selectOptions) => {
  const optionsArrayData = [];
  selectOptions.map((elem, id, arr) => {
    const level = getDataLevel(elem);
    const prevLevel = getDataLevel(arr[id - 1]);
    const obj = {
      option: elem,
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

  return optionsArrayData;
}

const generateCustomSelect = (optionsArrayData) => {
  const body = document.body;
  const wrapperDiv = create('div', 'wrapper', null, body);
  const customSelectDiv = create('div', 'custom-select', null, wrapperDiv);
  const searchContainerDiv = create('div', 'search-container', null, customSelectDiv)
  const searchNavDiv = create('div', 'search__navigation', null, searchContainerDiv);
  const backImg = create('img', null, null, searchNavDiv, ['src', "../assets/images/ic_backArrow.svg"], ['alt', 'back']);
  const searchNavP = create('p', null, null, searchNavDiv);
  searchNavP.innerHTML =  'Реализуемые товары';
  const searchInput = create('input', 'search__input', null, searchContainerDiv, ['type', 'search'], ['placeholder', 'search']);

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

  return { selectItemsDiv }
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
    dotDiv.classList.add('checkbox-dot--hidden');
    option.parent.checked = !option.parent.checked;
    option.parent.itemContainer.classList.toggle('select-item__container--checked');
    option.parent.itemContainer.children[0]?.classList.toggle('select-item__checkbox--checked');
  } else if (option.parent.checked) {
    dotDiv.classList.add('checkbox-dot--hidden');
    option.parent.checked = !option.parent.checked;
    option.parent.itemContainer.classList.toggle('select-item__container--checked');
    option.parent.itemContainer.children[0]?.classList.toggle('select-item__checkbox--checked');
  } else dotDiv.classList.remove('checkbox-dot--hidden');
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
  console.log(option);
}

const customSelectEventHandler = (selectItemsDiv, optionsArrayData) => {
  selectItemsDiv.addEventListener('click', (e) => {
    checkboxHandler(e, optionsArrayData);
    expandHandler(e, optionsArrayData);
  })
}


const customeSelect = () => {
  const selectElements = [...document.getElementsByTagName('select')];
  selectElements.forEach((elem) => {
    const selectOptions = [...elem];
    const optionsArrayData = getSelectOptionsData(selectOptions)
    const { selectItemsDiv } = generateCustomSelect(optionsArrayData);
    
    customSelectEventHandler(selectItemsDiv, optionsArrayData);
  })
  // const selectOptions = [...selectElements[0]];
  // const optionsArrayData = getSelectOptionsData(selectOptions)
  // const { selectItemsDiv } = generateCustomSelect(optionsArrayData);
  
  // customSelectEventHandler(selectItemsDiv, optionsArrayData);
  
  // console.log(optionsArrayData);
}


customeSelect();




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

