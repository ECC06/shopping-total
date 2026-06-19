//...THIS FILE CONTAINS UTILITY FUNCTIONS in list-page.js (i.e, functions that are re-used multiple times)

import {
    addItemFormElements,
    addItemSubmitter,
    addItemsDialog,
    itemInfoForm,
    buttonsCont,
    descrInputElem,
    getCurrentTotalElem,
    itemObject,
    itemsArrFromLocalStorage,
    itemsCont,
    itemToUpdate,
    nameInputElem,
    listItemsInLocalStorage,
    listTotalInLocalStorage,
    priceInputElem,
    updateSubmitter,
    getSelectedCurrency,
    formSubmitter,
    mainDropdown,
    dialogDropdown,
    removeCommas,
} from "./list-page.js";

import { addNewItemToLocalStorage } from "./shared.js";

export function changeCurrencyFont() {
    const dropdownBtnSigns = document.querySelectorAll(".dropdown-btn-sign");

    dropdownBtnSigns.forEach((span) => {
        const innerSpan = span.querySelector(".currency-sign");

        if (innerSpan.innerText !== "₵") {
            innerSpan.style.transform = `translate(.0313rem, .1875rem)`;
        } else {
            innerSpan.removeAttribute("style");
        }

        //default font family is Fredoka, but for naira and cedis, change to Varela Round
        if (innerSpan.innerText === "₵" || innerSpan.innerText === "₦") {
            innerSpan.style.fontFamily = `Varela Round`;
        } else {
            innerSpan.style.fontFamily = `Fredoka, sans-serif`;
        }
    });
}

//runs when the dropdown is open
export function handleDropdown(e) {
    //"this" is either the add items dialog or main element
    let correctDropdown = this.querySelector(".currency-dropdown");

    //sets the default currency selection based on the data in local storage
    setDefaultSelection();

    //opens the dropdown
    if (e.target.closest(".dropdown-btn")) {
        correctDropdown.classList.toggle("opened");
    }

    //changes the currency if the user clicks on a list item
    if (e.target.closest((".dropdown-li"))) {
        changeCurrency(e, correctDropdown);
    }

    //closes the dropdown if the user hovers outside of it
    correctDropdown.addEventListener("mouseleave", closeOnOutsideHover);

    //closes the dropdown if the user clicks outside of it
    function closeOnOutsideHover() {
        if (correctDropdown.classList.contains("opened")) {
            if (!e.target.closest(".currency-dropdown")) {
                correctDropdown.classList.remove("opened");
            }
        }
    }
}

//when the dropdown is opened, add the "selected" class to the currency that's found in local storage
export function setDefaultSelection() {
    const allDropdowns = document.querySelectorAll(".currency-dropdown");

    //targets all dropdown ul elements on the page
    allDropdowns.forEach((dropdown) => {
        const selectedCurrency = getSelectedCurrency();

        const listElements = Array.from(dropdown.querySelectorAll(".dropdown-li"));

        //find the list item that the "data-sign" attribute matches the selected currency
        const listItemWithMatchingCurrency = listElements.find(
            (li) => li.dataset.sign === selectedCurrency
        );

        //clear "selected" class from all list items
        listElements.forEach((li) => li.classList.remove("selected"));

        listItemWithMatchingCurrency.classList.add("selected");
    });
}

export function changeCurrency(event, dropdown) {
    let selectedLi = event.target;
    const selectedCurrency = getSelectedCurrency();

    //ensures the li element is stored when the user clicks inside the dropdown
    if (event.target.tagName === "SPAN" && event.target.closest(".dropdown-li")) {
        selectedLi = event.target.parentElement;
    }

    localStorage.setItem("selected-currency", selectedLi.dataset.sign);

    showSelected();

    updateCurrencyOnPage();

    changeCurrencyFont();

    //adds the .selected class to the clicked element
    function showSelected() {
        const listItems = dropdown.querySelectorAll("li");

        //clears .selected from all list items
        listItems.forEach((li) => {
            li.classList.remove("selected");
        });

        selectedLi.classList.add("selected");
    }
}

//update all signs in the ui
export function updateCurrencyOnPage() {
    const selectedCurrency = getSelectedCurrency();
    const liElemPrices = document.querySelectorAll(".price-cont");
    const totalFigure = document.querySelector(".total-figure");

    const currencySignsList = document.querySelectorAll(".currency-sign");

    currencySignsList.forEach((sign) => {
        if (selectedCurrency === "₵") {

            if (sign.parentElement.closest(".dropdown-btn")) {
                sign.innerText = selectedCurrency;
            } else {
                sign.innerText = "ghc";
            }


            liElemPrices.forEach((priceCont) => {
                priceCont.classList.remove("reverse-order");
            });

            totalFigure.classList.remove("reverse-order");
            return;
        }

        //reverses the order of of the html elements if the sign isn't GHS, so you will have £9 instead of 9£
        liElemPrices.forEach((priceCont) => {
            priceCont.classList.add("reverse-order");
        });

        totalFigure.classList.add("reverse-order");

        sign.innerText = selectedCurrency;
    });

}

//close all dropdowns on the page
export function closeDropdown(event) {
    if (event.target.closest("main")) {
        mainDropdown.classList.remove("opened");
    } else if (event.target.closest("dialog")) {
        dialogDropdown.classList.remove("opened");
    }
}

export function manipulateQuantity(buttonElem) {
    let originalPrice = null;
    const listElem = buttonElem.closest(".list-item");

    const selectedListId = Number(listElem.id);

    //go into local storage and get the original price of the item using the id in the HTML

    for (const obj of itemsArrFromLocalStorage()) {
        if (obj.id === selectedListId) {
            originalPrice = obj.price; //update the "originalPrice" global variable
            break;
        }
    }

    const priceElem = listElem.querySelector(".price");
    const quantityElem = listElem.querySelector(".quantity");

    const itemTotal = Number(removeCommas(priceElem.innerText));
    let listTotal = Number(removeCommas(getCurrentTotalElem().innerText));


    let newItemTotal = null;
    let updatedQuantityNum = null;

    //update the price, quantity and total variables
    updateVariables();

    //update the price and quantity in HTML
    quantityElem.innerText = updatedQuantityNum;
    priceElem.innerText = newItemTotal.toLocaleString();

    //update the total in HTML
    getCurrentTotalElem().innerText = listTotal.toLocaleString();

    //update the price, quantity and total of the item in local storage
    updateVariablesInLocalStorage(
        selectedListId,
        updatedQuantityNum,
        newItemTotal,
        listTotal,
    );

    function updateVariables() {
        if (buttonElem.className === "plus-btn") {
            updatedQuantityNum = Number(quantityElem.innerText) + 1;
            newItemTotal = itemTotal + originalPrice;
            listTotal += originalPrice;
        } else if (buttonElem.className === "minus-btn") {
            updatedQuantityNum = Number(quantityElem.innerText) - 1;
            newItemTotal = itemTotal - originalPrice;
            listTotal -= originalPrice;
        }
    }
}

//!ud
//updates the items' total price and quantity in local storage using the items' id
function updateVariablesInLocalStorage(
    listId,
    newQuantity,
    newItemTotal,
    newListTotal,
) {
    const storedItems = itemsArrFromLocalStorage();
    if (localStorage.getItem(listItemsInLocalStorage)) {
        //updates update the quantity and total in local storage
        for (const obj of storedItems) {
            if (obj.id === listId) {
                obj.quantity = newQuantity;
                obj.total = newItemTotal;
                break;
            }
        }

        localStorage.setItem(
            listItemsInLocalStorage,
            JSON.stringify(storedItems),
        );
    }

    //update the list total in local storage
    localStorage.setItem(listTotalInLocalStorage, newListTotal);
}

//looks into local storage and marks any items in the HTML that the user has previously marked with a check
export function checkPreviouslyCheckedItems() {
    const listItems = Array.from(itemsCont.children);
    const idsOfCheckedElements = [];

    //store the ids of all elements that are checked in the "idsOfCheckedElements" array
    itemsArrFromLocalStorage().forEach((obj) => {
        if (obj.checked) {
            idsOfCheckedElements.push(obj.id);
        }
    });

    //iterate over all the list items, and any that have an id in the "idsOfCheckedElements" array should be checked
    listItems.forEach((itemElem) => {
        if (idsOfCheckedElements.includes(Number(itemElem.id))) {
            const checkboxInput = itemElem.querySelector(".check");
            checkboxInput.checked = true;
        }
    });
}

export function createNewItem() {
    itemObject["itemName"] = nameInputElem.value; //"Milk"

    const totalElem = getCurrentTotalElem();

    const priceInputWithoutCommas = Number(removeCommas(priceInputElem.value));

    storeFormInput();

    //every time the user adds a new item, add it's original price to the current total of the list
    let currentTotal = Number(removeCommas(totalElem.innerText)); //30
    currentTotal += priceInputWithoutCommas; //30+20

    //updates the list total in the local storage
    localStorage.setItem(listTotalInLocalStorage, currentTotal);

    //updates the list total in the HTML
    totalElem.innerText = currentTotal.toLocaleString();

    addItemToHTML(itemObject);

    if (itemsArrFromLocalStorage().length === 1) {
        //if true, a user is adding an item for the first time
        toggle();
    }

}

export function displayUpdateForm(event) {
    const listItemToUpdate = event.target.closest(".list-item"); // the closest list item to the element that was clicked

    itemToUpdate.item = listItemToUpdate; // the global variable: "itemToUpdate.item" is updated so it can be used in the updateItem() function and the submit event listener for updating the form.

    // if the element that received the event is able to traverse upwards and find a list item,
    if (listItemToUpdate) {
        displayUpdateButton();
        populateInputs();

        addItemsDialog.showModal();
    }

    //populate the update form with the current data in the list element
    function populateInputs() {
        const listItemId = Number(listItemToUpdate.id);

        const listItemInfoInLocalStorage = itemsArrFromLocalStorage().find(
            (obj) => obj.id === listItemId,
        );

        const nameLabel = listItemToUpdate.querySelector(".item-name");
        const descriptionElem =
            listItemToUpdate.querySelector(".description");

        nameInputElem.value = nameLabel.innerText;
        descrInputElem.value = descriptionElem.innerText;
        priceInputElem.value = listItemInfoInLocalStorage.price.toLocaleString();
    }
}

export function displayUpdateButton() {
    formSubmitter.id = "update-item-submitter";
    formSubmitter.className = "submitter update-item-submitter";
    formSubmitter.innerText = "Update";
}

export function putBackAddBtn() {
    formSubmitter.id = "add-item-submitter";
    formSubmitter.className = "submitter add-item-submitter";
    formSubmitter.innerText = "Add item";
}

//check if user has previously updated
export function updateInputs(formInputsObj) {

    const listObjects = itemsArrFromLocalStorage();

    const listItemId = Number(itemToUpdate.item.id);

    //todo: use the find method because what on earth
    //finds the correct object in local storage and updates it if needed 
    for (const obj of listObjects) {
        if (obj.id === listItemId) {
            updateIfNeeded(obj, formInputsObj);
            break;
        }
    }

    localStorage.setItem(
        listItemsInLocalStorage,
        JSON.stringify(listObjects));
}

function updateIfNeeded(storedObj, { nameInput, descriptionInput, priceInput }) {

    //update a property if its not the input the user typed in previously
    if (storedObj.itemName !== nameInput) {
        storedObj.itemName = nameInput;

        //update HTML
        const nameElem = itemToUpdate.item.
            querySelector(".item-name");

        nameElem.textContent = nameInput;
    }

    if (storedObj.description !== descriptionInput) {
        storedObj.description = descriptionInput;

        //update HTML
        const descriptionElem = itemToUpdate.item.
            querySelector(".description");
        descriptionElem.textContent = descriptionInput;

    }

    if (storedObj.price !== priceInput) {
        const { increase, decrease, newItemTotal } = calculateItemTotal(priceInput, storedObj);

        const newListTotal = calculateListTotal(increase, decrease);

        const priceElem = itemToUpdate.item.querySelector(".price");
        const totalElem = document.querySelector("#total");

        storedObj.price = priceInput;
        storedObj.total = newItemTotal; //55

        //update HTML
        priceElem.textContent = newItemTotal.toLocaleString();
        totalElem.textContent = newListTotal.toLocaleString();

        localStorage.setItem(
            listTotalInLocalStorage,
            JSON.stringify(newListTotal),
        );
    }
}

//calculate the difference between the former item's price and the new item's price
function calculateItemTotal(priceInput, obj) {
    const formerItemTotal = obj.total; // e.g 60
    const newItemTotal = priceInput * obj.quantity; //e.g 55*1

    let increase;
    let decrease;

    if (newItemTotal > formerItemTotal) {
        increase = newItemTotal - formerItemTotal;
    } else if (newItemTotal < formerItemTotal) {
        decrease = formerItemTotal - newItemTotal; //5
    }

    return { increase, decrease, newItemTotal };
}


//updates the list total in HTML and in local storage
function calculateListTotal(increase, decrease) {
    let finalValue = null;

    const totalElem = getCurrentTotalElem();
    const listTotal = Number(removeCommas(totalElem.innerText));

    if (increase) {
        finalValue = listTotal + increase;
    } else if (decrease) {
        finalValue = listTotal - decrease;
    }

    return finalValue;
}

//!ud
//stores the captured form data in local storage, along with other essential data
function storeFormInput() {
    //store item id
    const itemId = Math.floor(Math.random() * 90) + 10; //generates a number between 10 and 99 inclusive

    const priceInputConverted = Number(removeCommas(priceInputElem.value));

    itemObject["id"] = itemId;

    itemObject["description"] = descrInputElem.value;

    itemObject["displayPrice"] = priceInputElem.value;
    itemObject["price"] = priceInputConverted;

    itemObject["quantity"] = 1;
    itemObject["checked"] = false;

    itemObject["total"] = priceInputConverted;

    addNewItemToLocalStorage(listItemsInLocalStorage, itemObject);
}

//adds a new item to the list container and populates it with the newly added list data (e.g the list name the user just typed in)
export function addItemToHTML(listObj) {
    const listItem = document.querySelector(".list-item");
    // const lastItemOfList = () => itemsCont.lastElementChild; //gets the current last element of the list (it's changes as more and more are added)

    const clonedListElement = listItem.cloneNode(true); //clone the last item in the list

    const populatedListElement = populateItem(listObj, clonedListElement); //populate the item with the correct data

    itemsCont.appendChild(populatedListElement); //add it to the list

    clonedListElement.classList.toggle("display-none"); //display list item
}

//populates list items with the data the user provides in the form
//takes in: the object containing the data, and which item to populate with the data
export function populateItem(listItemObj, itemToPopulate) {
    const itemObjIndex = itemsArrFromLocalStorage().findIndex((obj) => obj.id === listItemObj.id); // 90

    const itemCheckbox = itemToPopulate.querySelector("input[type='checkbox']");

    //populate existing list item
    const itemName = itemToPopulate.querySelector(".item-name");
    const descriptionElem = itemToPopulate.querySelector(".description");
    const priceElem = itemToPopulate.querySelector(".price");
    const quantityElem = itemToPopulate.querySelector(".quantity");

    itemCheckbox.id = `input${itemObjIndex + 1}`; //input2

    itemToPopulate.id = listItemObj.id; //populate the last list item with the id of the single list object in local storage

    itemName.innerText = listItemObj.itemName;
    descriptionElem.innerText = listItemObj.description;

    priceElem.innerText = listItemObj.total.toLocaleString();
    quantityElem.innerText = listItemObj.quantity;

    return itemToPopulate;
}

//display the container of list items if there are list items in local storage
export function toggle() {
    const noItemsCont = document.querySelector("#no-items-cont");
    const itemsAndAddBtnCont = document.querySelector(
        "#items-and-add-btn-cont",
    );

    noItemsCont.classList.toggle("display-none"); //hide the default page
    itemsAndAddBtnCont.classList.toggle("display-none"); //show the list of items
}

export function clearForm() {
    //clears the former input in the form data for a fresh, clean, form
    addItemFormElements.forEach((element) => {
        if (element.className === "item-data-input") {
            element.value = "";
        }
    });
}

//update the list's total in the HTML and local storage
export function updateTotalPostDelete(listDataObj) {
    const currentListTotal = JSON.parse(
        localStorage.getItem(listTotalInLocalStorage),
    );
    const priceOfDeletedItem = Number(listDataObj.total);
    const newTotal = currentListTotal - priceOfDeletedItem;

    localStorage.setItem(listTotalInLocalStorage, newTotal);
    getCurrentTotalElem().innerText = newTotal;
}

//filters out the item the user wants to delete, and remains the ones they want to keep
export function remainingItems(liElem) {
    const listOfItems = itemsArrFromLocalStorage();

    const objToDelete = listOfItems.find(
        (obj) => Number(liElem.id) === obj.id,
    );

    const itemsToKeepInStorage = listOfItems.filter(
        (obj) => Number(liElem.id) !== obj.id,
    );

    return itemsToKeepInStorage;
}

export function resetSignsOnPage() {
    const dropdownBtnSigns = document.querySelectorAll(".dropdown-btn-sign .currency-sign");

    dropdownBtnSigns.forEach((sign) => sign.innerText = "₵");

    //default selection is set to cedis
    setDefaultSelection();
}