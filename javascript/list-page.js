//...THIS FILE CONTAINS THE MAIN LOGIC OF MANAGING A USER'S LIST ITEMS

import {
	checkPreviouslyCheckedItems,
	manipulateQuantity,
	userDuplicatedItemName,
} from "./list-page-utilities.js";
import { updateLocalStorage } from "./shared.js";

const noItemsCont = document.querySelector("#no-items-cont");
const itemsAndAddBtnCont = document.querySelector("#items-and-add-btn-cont");
const h1 = document.querySelector("h1");

const addItemsDialog = document.querySelector("#add-items-dialog");
const firstAddItemBtn = document.querySelector("#first-add-item-btn");
const closeAddItemBtn = document.querySelector("#close-add-item-form");
const mainAddItemBtn = document.querySelector("#main-add-item-btn");
const addItemsForm = document.querySelector("#add-items-form");
const cancelAddItemBtn = document.querySelector("#cancel-add-item-btn");
export const itemsCont = document.querySelector("#items-cont");
const [nameInputElem, descInputElem, priceInputElem] = addItemsForm.elements;
const listItem = document.querySelector(".list-item");

export const getCurrentTotalElem = () => document.querySelector("#total");

//object that will contain info about each list item
const itemObject = {};

// const localStorageEmpty = () => !localStorage.getItem("list-items");
const lastItemOfList = () => itemsCont.lastElementChild; //gets the current last element of the list (it's changes as more and more are added)

export const itemsArrFromLocalStorage = () =>
	JSON.parse(localStorage.getItem("list-items"));

//!READ lists items in local storage
//if local storage is not empty, this handler fetches the array of items from local storage and displays it as HTML on the page
document.addEventListener("DOMContentLoaded", () => {
	if (localStorage.getItem("list-items")) {
		itemsArrFromLocalStorage().forEach((obj) => {
			//each iteration appends a clone of listCont, instead of listCont itself, so that it doesn't get moved every time appendChild is called
			// debugger;
			addItemToHTML(obj);

			getCurrentTotalElem().innerText = localStorage.getItem("list-total"); //update the list total
		});

		checkPreviouslyCheckedItems();

		toggle();
	}
});

//!CREATE NEW LIST

//first button that handles the opening of a form for adding list items
firstAddItemBtn.addEventListener("click", () => {
	addItemsDialog.showModal();
});

//second button that handles the opening of a form for adding list items
mainAddItemBtn.addEventListener("click", () => {
	addItemsDialog.showModal();
});

//handles the submission of list data, e.g the name, description, price, etc
addItemsForm.addEventListener("submit", (e) => {
	e.preventDefault();

	if (userDuplicatedItemName(nameInputElem.value)) {
		// Check for duplicates before storing
		alert(
			`You already have an item with this name! Instead, you can increase its quantity to your liking.`,
		);
		return;
	}

	itemObject["itemName"] = nameInputElem.value;
	itemObject["checked"] = false;

	//updates the list total displayed to the user, every time the user adds a price
	let currentTotal = Number(getCurrentTotalElem().innerText);
	currentTotal += Number(priceInputElem.value);
	getCurrentTotalElem().innerText = currentTotal;

	localStorage.setItem("list-total", currentTotal);

	storeFormInput();
	addItemToHTML(itemObject);

	//clear the form's input boxes
	nameInputElem.value = "";
	descInputElem.value = "";
	priceInputElem.value = "";

	if (itemsArrFromLocalStorage().length === 1) {
		//if true, a user is adding an item for the first time
		toggle();
	}

	addItemsDialog.close();
});

//handles the closing the form
closeAddItemBtn.addEventListener("click", () => {
	addItemsDialog.close();
});

//handles the cancellation of adding list data, by closing the form
cancelAddItemBtn.addEventListener("click", () => {
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

//stores the captured form data in local storage
function storeFormInput() {
	//store item id
	const itemId = Math.floor(Math.random() * 90) + 10; //generates a number between 10 and 99 inclusive
	itemObject["id"] = itemId;

	itemObject["description"] = descInputElem.value;
	itemObject["price"] = Number(priceInputElem.value);
	itemObject["quantity"] = 1;

	itemObject["total"] = Number(getCurrentTotalElem().innerText);

	updateLocalStorage("list-items", itemObject);
}

//adds a new item to the list container and populates it with the newly added list data (e.g the list name the user just typed in)
function addItemToHTML(listObj) {
	const clonedList = listItem.cloneNode(true); //clone the last item in the list
	itemsCont.appendChild(clonedList); //add it to the list
	clonedList.classList.toggle("display-none"); //display list item

	populateItem(listObj); //populate the item with the correct data
}

//populates list items with the data the user provides in the form
function populateItem(listItemObj) {
	const itemToPopulate = lastItemOfList();

	itemToPopulate.id = listItemObj.id; //populate the last list item with the id of the single list object in local storage

	//populate existing list item
	const nameAndDescriptionCont = itemToPopulate.children[0];
	const priceAndQuantityCont = itemToPopulate.children[1];

	const [input, nameLabel, descriptionElem] = nameAndDescriptionCont.children;
	nameLabel.innerText = listItemObj.itemName;
	descriptionElem.innerText = listItemObj.description;

	const priceElem = priceAndQuantityCont.firstElementChild.firstElementChild;
	priceElem.innerText = listItemObj.price;

	const quantityElem = priceAndQuantityCont.children[1].children[1];
	quantityElem.innerText = 1;
}

function toggle() {
	noItemsCont.classList.toggle("display-none"); //hide the default page
	h1.classList.toggle("display-none"); //show the list title
	itemsAndAddBtnCont.classList.toggle("display-none"); //show the list of items
}
