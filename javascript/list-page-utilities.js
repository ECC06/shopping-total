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
    selectedCurrency,
    formSubmitter,
} from "./list-page.js";

import { addNewItemToLocalStorage } from "./shared.js";

export function updateCurrencyOnPage() {
    const liElemPrices = document.querySelectorAll(".price-cont");
    const totalFigure = document.querySelector(".total-figure");

    const currencySignsList = document.querySelectorAll(".currency-sign");

    //update all signs in the ui
    currencySignsList.forEach((sign) => {
        if (selectedCurrency.val === "₵") {

            if (sign.parentElement.classList.contains("dropdown-btn")) {
                sign.innerText = `${selectedCurrency.val}`;
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

        sign.innerText = `${selectedCurrency.val}`;
    });

}

//when page loads, add the "selected" class to the list item the user selected before reloading
export function selectFormer() {
    const listElems = Array.from(document.querySelectorAll(".dropdown-li"));

    //find the list item that the "data-sign" attribute matches the selected currency
    const listItemWithMatchingCurrency = listElems.find((li) => li.dataset.sign === selectedCurrency.val);

    //clear "selected" class from all list items
    listElems.forEach((li) => li.classList.remove("selected"));

    listItemWithMatchingCurrency.classList.add("selected");
}

// returns true if the user tries to add an item with the same name and description. else, returns false
export function userDuplicatedItem(nameInput, descriptionInput) {
    if (localStorage.getItem(listItemsInLocalStorage)) {
        for (const obj of itemsArrFromLocalStorage()) {
            const namesIdentical = nameInput.toLowerCase() === obj["itemName"].toLowerCase(); //ice cream 
            const descriptionsIdentical = descriptionInput.toLowerCase() === obj["description"].toLowerCase(); //vanilla

            if (namesIdentical && descriptionsIdentical) {
                alert(
                    `You already have this item!  Instead, you can increase its quantity to your liking.`,
                );
                return true;
            }
        }
        return false;
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

    const itemTotal = Number(priceElem.innerText);
    let listTotal = Number(getCurrentTotalElem().innerText);

    let newItemTotal = null;
    let updatedQuantityNum = null;

    //update the price, quantity and total variables
    updateVariables();

    //update the price and quantity in HTML
    quantityElem.innerText = updatedQuantityNum;
    priceElem.innerText = newItemTotal;

    //update the total in HTML
    getCurrentTotalElem().innerText = listTotal;

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

    //every time the user adds a new item, add it's original price to the current total of the list
    let currentTotal = Number(totalElem.innerText); //30
    currentTotal += Number(priceInputElem.value); //30+20

    //updates the list total in the local storage
    localStorage.setItem(listTotalInLocalStorage, currentTotal);

    //updates the list total in the HTML
    totalElem.innerText = currentTotal;

    storeFormInput();
    addItemToHTML(itemObject);

    if (itemsArrFromLocalStorage().length === 1) {
        //if true, a user is adding an item for the first time
        toggle();
    }

    addItemsDialog.close();
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
        priceInputElem.value = listItemInfoInLocalStorage.price;
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

export function updateItems() {
    const arrFromLocalStorage = itemsArrFromLocalStorage();

    let increase = null;
    let decrease = null; //5

    //object to update in local storage
    const objToUpdate = arrFromLocalStorage.find((obj) => Number(itemToUpdate.item.id) === obj.id);

    //calculate the new total of the list and determine whether there was increase or decrease based on the user's input
    const formerItemTotal = objToUpdate.total; // 60
    const newPriceInput = Number(priceInputElem.value); //55
    const newItemTotal = newPriceInput * objToUpdate.quantity; //55*1

    if (formerItemTotal < newItemTotal) {
        increase = newItemTotal - formerItemTotal; //5 cedis
    } else if (formerItemTotal > newItemTotal) {
        decrease = formerItemTotal - newItemTotal;
    }

    //update the object with the user's input
    objToUpdate.itemName = nameInputElem.value;
    objToUpdate.description = descrInputElem.value;
    objToUpdate.price = newPriceInput;
    objToUpdate.total = newItemTotal; //55


    //store the updated arr
    localStorage.setItem(
        listItemsInLocalStorage,
        JSON.stringify(arrFromLocalStorage),
    );

    populateItem(objToUpdate, itemToUpdate.item); //update list items in HTML

    updateListTotal(increase, decrease); //update list total in local storage and html

    itemToUpdate.item = null; //clears this variable so that another item the user wants to update can take it's place

    addItemsDialog.close();
}

//updates the list total in HTML and in local storage
function updateListTotal(increase, decrease) {
    let finalValue = null;
    const totalElem = getCurrentTotalElem();
    const listTotal = Number(totalElem.innerText);

    //could be less verbose but...
    if (increase) {
        finalValue = listTotal + increase;
    } else if (decrease) {
        finalValue = listTotal - decrease;
    }

    totalElem.innerText = finalValue;

    localStorage.setItem(
        listTotalInLocalStorage,
        JSON.stringify(finalValue),
    );
}

//!ud
//stores the captured form data in local storage, along with other essential data
function storeFormInput() {
    //store item id
    const itemId = Math.floor(Math.random() * 90) + 10; //generates a number between 10 and 99 inclusive
    itemObject["id"] = itemId;

    itemObject["description"] = descrInputElem.value;
    itemObject["price"] = Number(priceInputElem.value);
    itemObject["quantity"] = 1;
    itemObject["checked"] = false;

    itemObject["total"] = Number(priceInputElem.value);

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

    priceElem.innerText = listItemObj.total;
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
export function updateTotal(listDataObj) {
    const currentListTotal = JSON.parse(
        localStorage.getItem(listTotalInLocalStorage),
    );
    const priceOfDeletedItem = Number(listDataObj.total);
    const newTotal = currentListTotal - priceOfDeletedItem;

    localStorage.setItem(listTotalInLocalStorage, newTotal);
    getCurrentTotalElem().innerText = newTotal;
}
