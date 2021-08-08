
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
  const OptionsArrayData = [];
  selectOptions.map((elem, id, arr) => {
    const level = getDataLevel(elem);
    const prevLevel = getDataLevel(arr[id - 1]);
    const obj = {
      option: elem,
      level,
      value: elem.value,
      parent: null,
      children: [],
      checked: false,
    }

    if (!level) {
      OptionsArrayData.push(obj);
      return;
    } 

    if (level > prevLevel) {
      obj.parent = OptionsArrayData[id - 1];
      OptionsArrayData[id - 1]?.children.push(obj);
    }

    if (level === prevLevel) {
      obj.parent = OptionsArrayData[id - 1].parent
      OptionsArrayData[id - 1].parent.children.push(obj);
    }

    if (level < prevLevel) {
      obj.parent = OptionsArrayData[id - 1].parent.parent;
      OptionsArrayData[id - 1].parent.parent.children.push(obj);
    }

    OptionsArrayData.push(obj);
  });

  return OptionsArrayData;
}

const generateCustomSelect = (OptionsArrayData) => {
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

  const selectItemsArray = OptionsArrayData.map((elem) => {
    const selectItemContainerDiv = create('div', 'select-item__container', null, null, ['value', elem.value]);
    if (elem.level) selectItemContainerDiv.dataset['level'] = elem.level;
    const selectItemCheckboxDiv = create('div', 'select-item__checkbox', null, selectItemContainerDiv);
    create('div', 'checkbox-dot checkbox-dot--hidden', null, selectItemCheckboxDiv);
    create('img', null, null, selectItemCheckboxDiv, ['src', '../assets/images/check.svg'], ['alt', 'check']);
    const selectItemTextP = create('p', 'select-item__text', null, selectItemContainerDiv);
    selectItemTextP.innerHTML = elem.option.innerHTML;
    create('img', 'arrow', null, selectItemTextP, ['src', '../assets/images/Vector.svg'], ['alt', 'arrow']);
    elem.itemContainer = selectItemContainerDiv;
    return selectItemContainerDiv;
  });

  const selectItemsDiv = create('div', 'select-items', selectItemsArray, selectItemsContainerDiv);
  
  const footerDiv = create('div', 'custom-select__footer', null, customSelectDiv);
  create('button', 'footer__button footer__button--primarily', null, footerDiv).innerHTML = 'Применить';
  create('button', 'footer__button footer__button--secondary', null, footerDiv).innerHTML = 'Очистить'

  return { selectItemsDiv }
}

const customSelectItemHandler = (selectItemsDiv, OptionsArrayData) => {
  selectItemsDiv.addEventListener('click', (e) => {
    const checkbox = e.target.closest('.select-item__checkbox');
    if (!checkbox) return;
    const itemContainer = checkbox?.closest('.select-item__container');
    const option = OptionsArrayData.find((elem) => elem.itemContainer === itemContainer);
    console.log(option);
    option.children.map(elem => {
      if (option.checked) {
        elem.itemContainer?.classList.remove('select-item__container--checked');
        elem.itemContainer?.children[0]?.classList.remove('select-item__checkbox--checked');
        elem.checked = false;
      } else {
        elem.itemContainer?.classList.add('select-item__container--checked');
        elem.itemContainer?.children[0]?.classList.add('select-item__checkbox--checked');
        elem.checked = true
      } 
      return elem;
    });

    checkbox?.classList.toggle('select-item__checkbox--checked');
    itemContainer?.classList.toggle('select-item__container--checked');
    option.checked = !option.checked;

    const checkCount = option.parent.children.reduce((acc, b) => acc + b.checked, 0);
    const childrenCount = option.parent.children.length
    if (checkCount === childrenCount) {
      option.parent.checked = !option.parent.checked;
      option.parent.itemContainer.classList.toggle('select-item__container--checked');
      option.parent.itemContainer.children[0]?.classList.toggle('select-item__checkbox--checked');
    } else if (option.parent.checked) {
      option.parent.checked = !option.parent.checked;
      option.parent.itemContainer.classList.toggle('select-item__container--checked');
      option.parent.itemContainer.children[0]?.classList.toggle('select-item__checkbox--checked');
    }
  })
}

const customeSelect = () => {
  const selectElements = [...document.getElementsByTagName('select')];
  const selectOptions = [...selectElements[0]];
  const OptionsArrayData = getSelectOptionsData(selectOptions)
  const { selectItemsDiv } = generateCustomSelect(OptionsArrayData);
  
  customSelectItemHandler(selectItemsDiv, OptionsArrayData);
  
  console.log(OptionsArrayData);
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

