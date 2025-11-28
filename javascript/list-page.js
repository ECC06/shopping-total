//...THIS FILE CONTAINS THE MAIN LOGIC OF MANAGING A USER'S LIST ITEMS

import {
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
const itemsCont = document.querySelector("#items-cont");
const [nameInputElem, descInputElem, priceInputElem] = addItemsForm.elements;
const listCont = document.querySelector(".list-item");

export const getCurrentTotalElem = () => document.querySelector("#total");

//object that will contain info about each list item
const itemObj = {};

// const localStorageEmpty = () => !localStorage.getItem("list-items");
const lastItemOfList = () => itemsCont.lastElementChild; //gets the current last element of the list (it's changes as more and more are added)

export const itemsArrFromLocalStorage = () =>
	JSON.parse(localStorage.getItem("list-items"));

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
	} else {
		itemObj["itemName"] = nameInputElem.value;

		//updates the current total displayed to the user in the HTML
		let currentTotal = Number(getCurrentTotalElem().innerText);
		currentTotal += Number(priceInputElem.value);
		getCurrentTotalElem().innerText = currentTotal;
	}

	storeFormInput();
	addItemToHTML();

	//clear the form's input boxes
	nameInputElem.value = "";
	descInputElem.value = "";
	priceInputElem.value = "";

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
	itemObj["id"] = itemId;

	itemObj["description"] = descInputElem.value;
	itemObj["price"] = Number(priceInputElem.value);
	itemObj["quantity"] = 1;

	itemObj["total"] = Number(getCurrentTotalElem().innerText);

	updateLocalStorage("list-items", itemObj);
}

//adds a new item to the list container and populates it with the newly added list data (e.g the list name the user just typed in)
function addItemToHTML() {
	const lastObjInLocalStorage =
		itemsArrFromLocalStorage()[itemsArrFromLocalStorage().length - 1];

	const clonedList = listCont.cloneNode(true); //clone the last item in the list
	itemsCont.appendChild(clonedList); //add it to the list
	populateItem(lastObjInLocalStorage); //populate the item with the correct data

	//if true, a user is adding an item for the first time
	// debugger;
	if (itemsArrFromLocalStorage().length === 1) {
		clonedList.classList.toggle("display-none"); //hide the default page
		noItemsCont.classList.toggle("display-none"); //hide the default page
		h1.classList.toggle("display-none"); //show the list title
		itemsAndAddBtnCont.classList.toggle("display-none"); //show the list of items
	}

	addItemsDialog.close();
}

//populates list items with the data the user provides in the form
function populateItem(lastObj) {
	const itemToPopulate = lastItemOfList();

	itemToPopulate.id = lastObj.id; //populate the last list item with the id of the single list object in local storage

	//todo: will need this later
	// lastElemOfList().classList.remove("display-none");

	//populate existing list item
	const nameAndDescriptionCont = itemToPopulate.children[0];
	const priceAndQuantityCont = itemToPopulate.children[1];

	const [input, nameLabel, descriptionElem] = nameAndDescriptionCont.children;
	nameLabel.innerText = lastObj.itemName;
	descriptionElem.innerText = lastObj.description;

	const priceElem = priceAndQuantityCont.firstElementChild.firstElementChild;
	priceElem.innerText = lastObj.price;

	const quantityElem = priceAndQuantityCont.children[1].children[1];
	quantityElem.innerText = 1;
}
