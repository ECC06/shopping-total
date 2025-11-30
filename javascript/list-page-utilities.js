//...THIS FILE CONTAINS UTILITY FUNCTIONS in list-page.js (i.e, functions that are re-used multiple times)

import {
	addItemsDialog,
	descInputElem,
	getCurrentTotalElem,
	h1,
	itemObject,
	itemsArrFromLocalStorage,
	itemsCont,
	itemToUpdate,
	nameInputElem,
	priceInputElem,
} from "./list-page.js";

import { storeItemsInLocalStorage } from "./shared.js";

export function userDuplicatedItemName(userInput) {
	if (localStorage.getItem("list-items")) {
		for (const obj of itemsArrFromLocalStorage()) {
			if (userInput.toLowerCase() === obj["itemName"].toLowerCase()) {
				alert(
					`You already have an item with this name! Instead, you can increase its quantity to your liking.`,
				);
				return true;
			}
		}
		return false;
	}
}

export function manipulateQuantity(buttonElem) {
	let originalPrice = null;

	const selectedListId = Number(
		buttonElem.parentElement.parentElement.parentElement.id,
	);

	//go into local storage and get the original price of the item using the id in the HTML
	itemsArrFromLocalStorage().forEach((obj) => {
		if (obj.id === selectedListId) {
			originalPrice = obj.price; //update the "originalPrice" global variable
		}
	});

	const priceElem =
		buttonElem.parentElement.previousElementSibling.firstElementChild;
	const quantityElem = buttonElem.parentElement.children[1];

	const itemPrice = Number(priceElem.innerText);
	let listTotal = Number(getCurrentTotalElem().innerText);

	let updatedPrice = null;
	let updatedQuantity = null;

	//update the price, quantity and total variables
	updateVariables();

	//update the price and quantity in HTML
	quantityElem.innerText = updatedQuantity;
	priceElem.innerText = updatedPrice;

	//update the total in HTML
	getCurrentTotalElem().innerText = listTotal;

	updateStoredPriceAndQuantity(selectedListId, updatedQuantity, listTotal);

	function updateVariables() {
		if (buttonElem.className === "plus-btn") {
			updatedQuantity = Number(quantityElem.innerText) + 1;
			updatedPrice = itemPrice + originalPrice; //adding on to the price
			listTotal += originalPrice;
		} else if (buttonElem.className === "minus-btn") {
			updatedQuantity = Number(quantityElem.innerText) - 1;
			updatedPrice = itemPrice - originalPrice;
			listTotal -= originalPrice;
		}

		localStorage.setItem("list-total", listTotal);
	}
}

//!ud
//updates the price and quantity of an item in local storage using the items' id, found the in HTML
function updateStoredPriceAndQuantity(listId, newQuantity, newTotal) {
	const storedItems = itemsArrFromLocalStorage();
	if (localStorage.getItem("list-items")) {
		//updates the actual price in local storage
		for (const obj of storedItems) {
			if (obj.id === listId) {
				obj.quantity = newQuantity;
				obj.total = newTotal;
				break;
			}
		}

		localStorage.setItem("list-items", JSON.stringify(storedItems));
	}
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
	listItems.forEach((item) => {
		if (idsOfCheckedElements.includes(Number(item.id))) {
			const checkboxInput = item.firstElementChild.firstElementChild;
			checkboxInput.checked = true;
		}
	});
}

export function addNewItem() {
	itemObject["itemName"] = nameInputElem.value;

	//updates the list total displayed to the user, every time the user adds a price
	const totalElem = getCurrentTotalElem();

	let currentTotal = Number(totalElem.innerText);
	currentTotal += Number(priceInputElem.value);
	totalElem.innerText = currentTotal;

	localStorage.setItem("list-total", currentTotal);

	storeFormInput();
	addItemToHTML(itemObject);

	if (itemsArrFromLocalStorage().length === 1) {
		//if true, a user is adding an item for the first time
		toggle();
	}

	addItemsDialog.close();
}

export function updateItems() {
	let listDataObj = null;
	updateLocalStorage();
	populateItem(listDataObj, itemToUpdate.val); //update items in HTML

	itemToUpdate.val = null; //clears this variable so that another item the user wants to update can take it's place
	addItemsDialog.close();

	//update items in local storage
	function updateLocalStorage() {
		const storedList = itemsArrFromLocalStorage();

		//iterate over the existing objects, and update the right objects
		for (const obj of storedList) {
			if (Number(itemToUpdate.val.id) === obj.id) {
				listDataObj = obj;

				//update the object with the user's input
				obj.itemName = nameInputElem.value;
				obj.description = descInputElem.value;
				obj.price = Number(priceInputElem.value);
				break;
			}
		}

		//store the updated arr
		localStorage.setItem("list-items", JSON.stringify(storedList));
	}
}

//!ud
//stores the captured form data in local storage, along with other essential data
function storeFormInput() {
	//store item id
	const itemId = Math.floor(Math.random() * 90) + 10; //generates a number between 10 and 99 inclusive
	itemObject["id"] = itemId;

	itemObject["description"] = descInputElem.value;
	itemObject["price"] = Number(priceInputElem.value);
	itemObject["quantity"] = 1;
	itemObject["checked"] = false;

	itemObject["total"] = Number(priceInputElem.value);

	storeItemsInLocalStorage("list-items", itemObject);
}

//adds a new item to the list container and populates it with the newly added list data (e.g the list name the user just typed in)
export function addItemToHTML(listObj) {
	const listItem = document.querySelector(".list-item");
	const lastItemOfList = () => itemsCont.lastElementChild; //gets the current last element of the list (it's changes as more and more are added)

	const clonedList = listItem.cloneNode(true); //clone the last item in the list
	itemsCont.appendChild(clonedList); //add it to the list

	populateItem(listObj, lastItemOfList()); //populate the item with the correct data

	clonedList.classList.toggle("display-none"); //display list item
}

//!ud
//populates list items with the data the user provides in the form
//takes in: the object containing the data, and which item to populate with the data
export function populateItem(listItemObj, itemToPopulate) {
	itemToPopulate.id = listItemObj.id; //populate the last list item with the id of the single list object in local storage

	//populate existing list item
	const nameAndDescriptionCont = itemToPopulate.children[0];
	const priceAndQuantityCont = itemToPopulate.children[1];

	const [input, nameLabel, descriptionElem] = nameAndDescriptionCont.children;
	nameLabel.innerText = listItemObj.itemName;
	descriptionElem.innerText = listItemObj.description;

	const priceElem = priceAndQuantityCont.firstElementChild.firstElementChild;
	priceElem.innerText = listItemObj.total;

	const quantityElem = priceAndQuantityCont.children[1].children[1];
	quantityElem.innerText = 1;
}

export function toggle() {
	const noItemsCont = document.querySelector("#no-items-cont");
	const itemsAndAddBtnCont = document.querySelector("#items-and-add-btn-cont");

	noItemsCont.classList.toggle("display-none"); //hide the default page
	h1.classList.toggle("display-none"); //show the list title
	itemsAndAddBtnCont.classList.toggle("display-none"); //show the list of items
}
