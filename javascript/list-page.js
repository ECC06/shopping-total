//...THIS FILE CONTAINS THE MAIN LOGIC OF MANAGING A USER'S LIST ITEMS

import { updateLocalStorage } from "./shared.js";

const addItemsDialog = document.querySelector("#add-items-dialog");
const firstAddItemBtn = document.querySelector("#first-add-item-btn");
const mainAddItemBtn = document.querySelector("#main-add-item-btn");
const addItemsForm = document.querySelector("#add-items-form");
const [nameInputElem, descInputElem, priceInputElem] = addItemsForm.elements;
const cancelAddItemBtn = document.querySelector("#cancel-add-item-btn");
const itemsCont = document.querySelector("#items-cont");

//object that will contain info about each list item
const itemObj = {};

const localStorageEmpty = () => !localStorage.getItem("list-items");
const lastItemOfList = () => itemsCont.lastElementChild; //gets the current last element of the list (it's changes as more and more are added)

const itemsArrFromLocalStorage = () =>
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

addItemsForm.addEventListener("submit", (e) => {
	e.preventDefault();

	const userDuplicatedName = false;

	//todo: change to a function later
	if (userDuplicatedName) {
		// Check for duplicates before storing
		alert(
			`You already have an item named ${nameInputElem}! Instead, increase the quantity to your liking.`,
		);
		return;
	} else {
		itemObj["itemName"] = nameInputElem.value;
	}

	storeFormInput();
	nameInputElem.value = "";
	descInputElem.value = "";
	priceInputElem.value = "";

	addItemToHTML();
	addItemsDialog.close();
});

//handles the closing of the form for adding list items
cancelAddItemBtn.addEventListener("click", () => {
	addItemsDialog.close();
});

function storeFormInput() {
	//store item id
	const itemId = Math.floor(Math.random() * 90) + 10; //generates a number between 10 and 99 inclusive
	itemObj["id"] = itemId;

	itemObj["description"] = descInputElem.value;
	itemObj["price"] = Number(priceInputElem.value);

	updateLocalStorage("list-items", itemObj);
}

//adds a new item to the list container and populates it with the newly added list data (e.g the list name the user just typed in)

function addItemToHTML() {
	const lastObjInLocalStorage =
		itemsArrFromLocalStorage()[itemsArrFromLocalStorage().length - 1];

	if (itemsArrFromLocalStorage().length === 1) {
		populateItem(lastObjInLocalStorage);
	} else {
		debugger;
		//if there are some lists in the container
		const cloned = lastItemOfList().cloneNode(true); //clone the last item in the list
		itemsCont.appendChild(cloned); //add it to the list
		populateItem(lastObjInLocalStorage);
	}

	addItemsDialog.close();
}

function populateItem(lastObj) {
	//populate existing list item
	const nameAndDescriptionCont = lastItemOfList().children[0];
	const priceAndQuantityCont = lastItemOfList().children[1];

	const [input, nameLabel, descriptionElem] = nameAndDescriptionCont.children;
	nameLabel.innerText = lastObj.itemName;
	descriptionElem.innerText = lastObj.description;

	const priceElem = priceAndQuantityCont.firstElementChild.firstElementChild;
	priceElem.innerText = lastObj.price;
}
