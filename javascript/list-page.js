//...THIS FILE CONTAINS THE MAIN LOGIC OF MANAGING A USER'S LIST ITEMS
import {
    addItemToHTML,
    checkPreviouslyCheckedItems,
    clearForm,
    createNewItem,
    displayUpdateForm,
    manipulateQuantity,
    removeUpdateButtonIfItExists,
    toggle,
    updateItems,
    updateTotal,
    userDuplicatedItemName,
} from "./list-page-utilities.js";

const listId = localStorage.getItem("list-id");
export const nameOfListItemsInLocalStorage = `list-items-for-${listId}`;
export const nameOfListTotalInLocalStorage = `list-total-for-${listId}`;

export const h1 = document.querySelector("h1");

// add/update items dialog variables
export const addItemsDialog = document.querySelector("#add-items-dialog");
export const addOrUpdateItemsForm = document.querySelector("#add-items-form");
const cancelAddItemBtn = document.querySelector("#cancel-add-item-btn");
export const buttonsCont = document.querySelector(".item-form-buttons");
export const addItemSubmitter = document.querySelector("#add-item-submitter");
export const updateSubmitter = document.querySelector("#update-item-submitter");

const firstAddItemBtn = document.querySelector("#first-add-item-btn");
const mainAddItemBtn = document.querySelector("#main-add-item-btn");
export const itemsCont = document.querySelector("#items-cont");
export const addItemFormElements = Array.from(addOrUpdateItemsForm.elements);
export const [nameInputElem, descInputElem, priceInputElem] =
    addItemFormElements;

const deleteItemDialog = document.querySelector("#delete-item-dialog");
const deleteItemForm = document.querySelector("#delete-item-form");
const cancelDeleteItemBtn = document.querySelector("#cancel-delete-item-btn");

const backBtn = document.querySelector("#back-btn");

//object that will contain info about each list item
export const itemObject = {};

export const getCurrentTotalElem = () => document.querySelector("#total");

export const itemToUpdate = { item: null };
let itemToDelete = null;

export const itemsArrFromLocalStorage = () =>
    JSON.parse(localStorage.getItem(nameOfListItemsInLocalStorage));

backBtn.addEventListener("click", (e) => {
    e.preventDefault();

    //reset the current state going back to the page of lists
    localStorage.removeItem("list-name");
    localStorage.removeItem("list-id");

    window.location.href = "./index.html";
});

//!READ lists items in local storage
//if local storage is not empty, this handler fetches the array of items from local storage and displays it as HTML on the page
document.addEventListener("DOMContentLoaded", (e) => {
    h1.innerText = localStorage.getItem("list-name");

    if (localStorage.getItem(nameOfListItemsInLocalStorage)) {
        itemsArrFromLocalStorage().forEach((obj) => {
            //each iteration appends a clone of listCont, instead of listCont itself, so that it doesn't get moved every time appendChild is called
            addItemToHTML(obj);
        });

        getCurrentTotalElem().innerText = localStorage.getItem(
            nameOfListTotalInLocalStorage,
        ); //update the list total

        checkPreviouslyCheckedItems();

        toggle();
    }
});

// !!RE-ORDER LIST ITEMS
new Sortable(itemsCont, {
    animation: 300,

    onStart: function (evt) {
        evt.item.style.opacity = "0.5";
    },
    onEnd: function (evt) {
        evt.item.style.opacity = "1";
        storeReArrangedListItems();

        function storeReArrangedListItems() {
            const reArrangedItems = [];
            const itemsContAsArray = Array.from(itemsCont.children);

            itemsContAsArray.forEach((element) => {
                const obj = {};

                obj["id"] = Number(element.id);
                obj["checked"] = element.querySelector(".check").checked;
                obj["itemName"] = element.querySelector(".item-name").textContent;

                obj["description"] = element.querySelector(".description").textContent;
                obj["price"] = Number(element.querySelector(".price").textContent);
                obj["quantity"] = Number(element.querySelector(".quantity").textContent);

                obj["total"] = Number(element.querySelector(".price").textContent);


                reArrangedItems.push(obj);
            });

            localStorage.setItem(nameOfListItemsInLocalStorage, JSON.stringify(reArrangedItems));
        }
    },
});

//!CREATE AND UPDATE A LIST

//first button that handles the opening of a form for adding list items
firstAddItemBtn.addEventListener("click", (e) => {
    clearForm();
    addItemsDialog.showModal();
});

//second button that handles the opening of a form for adding list items
mainAddItemBtn.addEventListener("click", (e) => {
    clearForm();
    addItemsDialog.showModal();
});

//displays the form for user to edit, with the inputs populated with the list information
itemsCont.addEventListener("dblclick", (e) => {
    const doNotRespondToDbClick = [
        "check",
        "plus-btn",
        "minus-btn",
        "quantity",
        "rect",
        "svg",
        "path",
    ];

    // if an element's is not found inside "doNotRespondToDbClick", then it can respond to the double click. We use and because both sides need to be false for the if statement to avoid running
    if (
        !doNotRespondToDbClick.includes(e.target.tagName) &&
        !doNotRespondToDbClick.includes(e.target.className)
    ) {
        displayUpdateForm(e);
    }
});

//displays the form for user to edit, with the inputs populated with the list information
itemsCont.addEventListener("click", (e) => {
    if (
        e.target.classList.contains("edit-item-btn") ||
        e.target.classList.contains("edit-item-svg")
    ) {
        displayUpdateForm(e);
    }
});

//closes the form for adding/updating items
cancelAddItemBtn.addEventListener("click", (e) => {
    removeUpdateButtonIfItExists();
    addItemsDialog.close();
});

//handles the submission of list data, e.g the name, description, price, etc
addOrUpdateItemsForm.addEventListener("submit", (e) => {
    e.preventDefault();

    //runs based on a button
    if (e.submitter.id === "add-item-submitter") {
        if (!userDuplicatedItemName(nameInputElem.value)) {
            createNewItem();
        }
    } else if (e.submitter.id === "update-item-submitter") {
        updateItems();
    }
});

//stores the checked state of an item in local storage
itemsCont.addEventListener("change", (e) => {
    //using event delegation to capture click events on the + button
    if (e.target.className === "check") {
        const check = e.target;

        const selectedListId = Number(check.closest(".list-item").id);
        //list that will be used to update local storage
        const list = itemsArrFromLocalStorage();

        //update the checked state in local storage every time the user checks or unchecks an item
        for (const obj of list) {
            if (obj.id === selectedListId) {
                if (check.checked === true) {
                    obj.checked = true;
                } else if (check.checked === false) {
                    obj.checked = false;
                }
                break;
            }
        }

        localStorage.setItem(
            nameOfListItemsInLocalStorage,
            JSON.stringify(list),
        );
    }
});

//!QUANTITY CONTROL
//updates the items' quantity when the user clicks on the plus button (+)
itemsCont.addEventListener("click", (e) => {
    //using event delegation to capture click events on the + button

    //?when the classList is requested on an svg element or it's children, it returns for example: DOMTokenList ['plus-btn-svg', value: 'plus-btn-svg']

    if (
        e.target.classList.contains("plus-btn") ||
        e.target.classList["value"] === "plus-btn-svg"
    ) {
        const plusBtn = e.target.closest(".plus-btn");
        //increases the quantity and total of the item, both on screen and in local storage
        manipulateQuantity(plusBtn);
    }
});

// updates the items' quantity when the user clicks on the minus button (-)
itemsCont.addEventListener("click", (e) => {
    // using event delegation to capture click events on the - button
    if (
        e.target.classList.contains("minus-btn") ||
        e.target.classList.contains("minus-btn-svg")
    ) {
        const minusBtn = e.target.closest(".minus-btn");
        const quantityCont = e.target.closest(".quantity-controls");
        const quantity = Number(
            quantityCont.querySelector(".quantity").innerText,
        );
        if (quantity > 1) {
            // //increases the quantity and total of the item, both on screen and in local storage
            manipulateQuantity(minusBtn);
        }
    }
});

//!DELETE ITEMS
//when the user clicks on the "delete" button on the list, this displays the form that allows a user to confirm their deletion
itemsCont.addEventListener("click", (e) => {
    //using event delegation to capture click events on the delete button
    if (
        e.target.classList.contains("open-delete-dialog") ||
        e.target.classList.contains("delete-item-svg") //handles any svgs that may receive the event
    ) {
        itemToDelete = e.target.closest(".list-item");
        deleteItemDialog.showModal();
    }
});

//deletes an item
deleteItemForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const listOfItems = itemsArrFromLocalStorage();

    //a list that filters out the item the user wants to delete, and remains the ones they want to keep
    const itemsToKeepInStorage = listOfItems.filter(
        (obj) => Number(itemToDelete.id) !== obj.id,
    );

    const listObjInLocalStorage = listOfItems.find(
        (obj) => Number(itemToDelete.id) === obj.id,
    );

    //if there's no items left to store in the local storage array, then remove the array from local storage completely. Else, store the new list in local storage, with the selected list deleted
    if (itemsToKeepInStorage.length === 0) {
        localStorage.removeItem(nameOfListItemsInLocalStorage);
        itemsCont.innerHTML = ""; //remove the list elements from the HTML as well
        getCurrentTotalElem().innerText = 0;
        toggle(); //display the "no lists container"
    } else {
        localStorage.setItem(
            nameOfListItemsInLocalStorage,
            JSON.stringify(itemsToKeepInStorage),
        );
        itemToDelete.remove(); //removes the selected list from the DOM
    }

    updateTotal(listObjInLocalStorage);

    itemToDelete = null; //reset selected item to null so that another item can be stored inside in the future

    deleteItemDialog.close();
});

//closes the form that allows a user to confirm whether they are deleting an item
cancelDeleteItemBtn.addEventListener("click", (e) => {
    deleteItemDialog.close();
});
