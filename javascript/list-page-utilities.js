//...THIS FILE CONTAINS DEPENDENCIES FOR list-page.js

import { getCurrentTotalElem, itemsArrFromLocalStorage } from "./list-page.js";

function userDuplicatedItemName(userInput) {
	if (localStorage.getItem("list-items")) {
		for (const obj of itemsArrFromLocalStorage()) {
			if (userInput.toLowerCase() === obj["itemName"].toLowerCase()) {
				return true;
			}
		}
	}

	return false;
}

function manipulateQuantity(buttonElem) {
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

	const currentPrice = Number(priceElem.innerText);
	let currentTotal = Number(getCurrentTotalElem().innerText);

	let updatedPrice = null;
	let updatedQuantity = null;

	//update the price, quantity and total variables
	updateVariables();

	//update the price and quantity in HTML
	quantityElem.innerText = updatedQuantity;
	priceElem.innerText = updatedPrice;

	//update the total in HTML
	getCurrentTotalElem().innerText = currentTotal;

	updateStoredPriceAndQuantity(selectedListId, updatedQuantity, currentTotal);

	function updateVariables() {
		if (buttonElem.className === "plus-btn") {
			updatedQuantity = Number(quantityElem.innerText) + 1;
			updatedPrice = currentPrice + originalPrice;
			currentTotal += originalPrice;
		} else if (buttonElem.className === "minus-btn") {
			updatedQuantity = Number(quantityElem.innerText) - 1;
			updatedPrice = currentPrice - originalPrice;
			currentTotal -= originalPrice;
		}
	}
}

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

export { userDuplicatedItemName, manipulateQuantity };
