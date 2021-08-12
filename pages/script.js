import { create, Event, getAttribute, getSelectData, generateCustomSelect } from './js/helpers.js';

const select = document.getElementsByTagName('select');
[...select].forEach(elem => elem.addEventListener('change', (e) => {
  console.log(e.target.value);
}));

const toggleCheckboxAllChildren = (option, isChecked) => {
  if (!option.children.length) return;
  
  option.children.map(elem => {
    if (isChecked) {
      elem.itemContainer?.classList.remove('select-item__container--checked');
      elem.itemContainer?.children[0]?.classList.remove('select-item__checkbox--checked');
      elem.checked = false;
    } else {
      const dotDiv = elem.parent?.itemContainer?.children[0].children[0];
      dotDiv?.classList.add('checkbox-dot--hidden');
      elem.itemContainer?.classList.add('select-item__container--checked');
      elem.itemContainer?.children[0]?.classList.add('select-item__checkbox--checked');
      elem.checked = true
    } 
    toggleCheckboxAllChildren(elem, isChecked);
    return elem;
  });
}

const toggleCheckboxAllChildrenOnFirstLoad = (optionsArrayData) => {
  optionsArrayData.filter((el) => el.checked).forEach((option) => {
    if (!option.children.length) return;
    option.children.map(elem => {
      const dotDiv = elem.parent?.itemContainer?.children[0].children[0];
      dotDiv?.classList.add('checkbox-dot--hidden');
      elem.itemContainer?.classList.add('select-item__container--checked');
      elem.itemContainer?.children[0]?.classList.add('select-item__checkbox--checked');
      elem.checked = true
      return elem;
    });
  });
}

const toggleCheckAllParents = (option) => {
  if (!option.parent) return;
  const checkCount = option.parent.children.reduce((acc, b) => acc + b.checked, 0);
  const childrenCount = option.parent.children.length;
  if (checkCount === childrenCount || option.parent.checked) {
    option.parent.checked = !option.parent.checked;
    option.parent.itemContainer.classList.toggle('select-item__container--checked');
    option.parent.itemContainer.children[0]?.classList.toggle('select-item__checkbox--checked');
  } 

  toggleCheckAllParents(option.parent);
}

const togglePartialCheckAllParents = (option) => {
  if (!option.parent) return;  
  const dotDiv = option.parent.itemContainer.children[0].children[0];
  if (!option.parent.checked) {
    dotDiv.classList.remove('checkbox-dot--hidden');
    option.parent.isPartial = true;
  }
  else {
    dotDiv.classList.add('checkbox-dot--hidden');
    option.parent.isPartial = false;
  }
  togglePartialCheckAllParents(option.parent);
}

const clearAllPartialCheck = (option) => {
  if (!option?.parent) return;  
  const dotDiv = option.parent.itemContainer.children[0].children[0];
  dotDiv.classList.add('checkbox-dot--hidden');
  clearAllPartialCheck(option.parent);
}

const clearEverySinglePartialCheck = (optionsArrayData) => {
  const partialCheckArr = optionsArrayData.filter((elem) => elem.isPartial);
  partialCheckArr.forEach((el) => {
    const dotDiv = el.itemContainer.children[0].children[0];
    dotDiv.classList.add('checkbox-dot--hidden');
  }) 
}

const doubleCheckAllPartialCheck = (optionsArrayData) => {
  const partialCheckArr = optionsArrayData.filter((elem) => elem.isPartial);
  const checkedArr = optionsArrayData.filter((elem) => elem.checked);
  if (!checkedArr.length) return
  if (partialCheckArr.length) {
    partialCheckArr.forEach((el) => togglePartialCheckAllParents(el))
  }
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
  const checkCount = option.parent?.children.reduce((acc, b) => acc + b.checked, 0) || 0;
  toggleCheckAllParents(option);
  clearAllPartialCheck(option);
  if (checkCount) togglePartialCheckAllParents(option);
  doubleCheckAllPartialCheck(optionsArrayData);
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
  const { optionsArrayData } = args;
  const clearButton = e.target.closest('.footer__button--secondary');
  if (!clearButton) return;
  unCheckAllOptions(args);
  clearEverySinglePartialCheck(optionsArrayData);
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
  optionsArrayData.filter((elem) => checkedValues.includes(elem.value)).forEach((el) => {
    el.option.setAttribute('selected', "");
    el.select.dispatchEvent(new Event('change'));
  });

}

const clearInputInnerHtml = (elem) => {
  let { innerHTML } = elem;
  innerHTML = innerHTML.replaceAll('<b>','');
  innerHTML = innerHTML.replaceAll('</b>','');
  elem.innerHTML = innerHTML;
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
    toggleCheckboxAllChildrenOnFirstLoad(optionsArrayData);
    customSelectEventHandler(customSelectDiv, selectItemsDiv, selectContainerDiv, optionsArrayData);
    selectContainerEventHandler(selectContainerDiv, customSelectDiv);
  })
}

customeSelect();