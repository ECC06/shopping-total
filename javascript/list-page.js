//...THIS FILE CONTAINS THE MAIN LOGIC OF MANAGING A USER'S LIST ITEMS

import {
	addItemToHTML,
	addNewItem,
	checkPreviouslyCheckedItems,
	manipulateQuantity,
	toggle,
	updateItems,
	userDuplicatedItemName,
} from "./list-page-utilities.js";

export const addItemsDialog = document.querySelector("#add-items-dialog");
const firstAddItemBtn = document.querySelector("#first-add-item-btn");
const closeAddItemBtn = document.querySelector("#close-add-item-form");
const mainAddItemBtn = document.querySelector("#main-add-item-btn");
const addItemsForm = document.querySelector("#add-items-form");
const cancelAddItemBtn = document.querySelector("#cancel-add-item-btn");
export const itemsCont = document.querySelector("#items-cont");

export const getCurrentTotalElem = () => document.querySelector("#total");

const formElements = Array.from(addItemsForm.elements);
export const [nameInputElem, descInputElem, priceInputElem] = formElements;

export const itemToUpdate = { val: null };

//object that will contain info about each list item
export const itemObject = {};

export const itemsArrFromLocalStorage = () =>
	JSON.parse(localStorage.getItem("list-items"));

//!READ lists items in local storage
//if local storage is not empty, this handler fetches the array of items from local storage and displays it as HTML on the page
document.addEventListener("DOMContentLoaded", (e) => {
	if (localStorage.getItem("list-items")) {
		itemsArrFromLocalStorage().forEach((obj) => {
			//each iteration appends a clone of listCont, instead of listCont itself, so that it doesn't get moved every time appendChild is called
			addItemToHTML(obj);

			getCurrentTotalElem().innerText = localStorage.getItem("list-total"); //update the list total
		});

		checkPreviouslyCheckedItems();

		toggle();
	}
});

//!CREATE AND UPDATE A LIST

//first button that handles the opening of a form for adding list items
firstAddItemBtn.addEventListener("click", (e) => {
	addItemsDialog.showModal();
});

//second button that handles the opening of a form for adding list items
mainAddItemBtn.addEventListener("click", (e) => {
	formElements.forEach((element) => {
		if (element.className === "item-data-input") {
			element.value = "";
		}
	});

	addItemsDialog.showModal();
});

//handles the submission of list data, e.g the name, description, price, etc
addItemsForm.addEventListener("submit", (e) => {
	e.preventDefault();

	//runs based on a button
	if (e.submitter.id === "add-item-btn") {
		if (!userDuplicatedItemName(nameInputElem.value)) {
			addNewItem();
		}
	} else if (e.submitter.id === "update-item-btn") {
		if (!userDuplicatedItemName(nameInputElem.value)) {
			updateItems();
		}
	}
});

//displays the form for user to edit
itemsCont.addEventListener("dblclick", (e) => {
	itemToUpdate.val = e.target;

	const addBtn = document.querySelector("#add-item-btn");
	const updateBtn = document.querySelector("#update-item-btn");

	if (e.target.className === "list-item") {
		addItemsDialog.showModal();

		addBtn.classList.add("display-none"); //hide add button
		updateBtn.classList.remove("display-none"); //update show button

		populateInputs();

		//populate the update form with the current data in the list element
		function populateInputs() {
			//get the name, description, and price elements from the list element
			const nameAndDescriptionCont = itemToUpdate.val.children[0];
			const priceAndQuantityCont = itemToUpdate.val.children[1];

			const [input, nameLabel, descriptionElem] =
				nameAndDescriptionCont.children;
			const priceElem =
				priceAndQuantityCont.firstElementChild.firstElementChild;

			nameInputElem.value = nameLabel.innerText;
			descInputElem.value = descriptionElem.innerText;
			priceInputElem.value = priceElem.innerText;
		}
	}
});

//handles the closing the form
closeAddItemBtn.addEventListener("click", (e) => {
	addItemsDialog.close();
});

//handles the cancellation of adding list data, by closing the form
cancelAddItemBtn.addEventListener("click", (e) => {
	addItemsDialog.close();
});

//stores the checked state of an item in local storage
itemsCont.addEventListener("change", (e) => {
	//using event delegation to capture click events on the + button
	if (e.target.className === "check") {
		const check = e.target;

		const selectedListId = Number(check.parentElement.parentElement.id);

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

		localStorage.setItem("list-items", JSON.stringify(list));
	}
});

//!QUANTITY CONTROL
//updates the items' quantity when the user clicks on the plus button (+)
itemsCont.addEventListener("click", (e) => {
	//using event delegation to capture click events on the + button
	if (e.target.className === "plus-btn") {
		const plusBtn = e.target;

		//increases the quantity and total of the item, both on screen and in local storage
		manipulateQuantity(plusBtn);
	}
});

//updates the items' quantity when the user clicks on the minus button (-)
itemsCont.addEventListener("click", (e) => {
	//using event delegation to capture click events on the - button
	if (e.target.className === "minus-btn") {
		const minusBtn = e.target;

		const quantity = minusBtn.nextElementSibling.innerText;

		//doesn't allow user to reduce the quantity below one
		if (quantity > 1) {
			//increases the quantity of the item on screen and in local storage
			manipulateQuantity(minusBtn);
		}
	}
});
