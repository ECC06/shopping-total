//...THIS FILE CONTAINS UTILITY FUNCTIONS in list-page.js (i.e, functions that are re-used multiple times)

import {
	addItemsDialog,
	descInputElem,
	formElements,
	getCurrentTotalElem,
	itemObject,
	itemsArrFromLocalStorage,
	itemsCont,
	itemToUpdate,
	listItemsForIdOfList,
	listTotalForIdOfList,
	nameInputElem,
	priceInputElem,
} from "./list-page.js";

import { addNewItemToLocalStorage } from "./shared.js";

export function userDuplicatedItemName(userInput) {
	if (localStorage.getItem(listItemsForIdOfList)) {
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

	const currentPrice = Number(priceElem.innerText);
	let listTotal = Number(getCurrentTotalElem().innerText);

	let updatedPrice = null;
	let updatedQuantityNum = null;

	//update the price, quantity and total variables
	updateVariables();

	//update the price and quantity in HTML
	quantityElem.innerText = updatedQuantityNum; //null
	priceElem.innerText = updatedPrice; //null

	//update the total in HTML
	getCurrentTotalElem().innerText = listTotal;

	//update the price, quantity and total of the item in local storage
	updateStoredPriceAndQuantity(
		selectedListId,
		updatedQuantityNum,
		updatedPrice,
	);

	function updateVariables() {
		if (buttonElem.className === "plus-btn") {
			updatedQuantityNum = Number(quantityElem.innerText) + 1; //2
			updatedPrice = currentPrice + originalPrice; //adding on to the price //100
			listTotal += originalPrice; //150
		} else if (buttonElem.className === "minus-btn") {
			updatedQuantityNum = Number(quantityElem.innerText) - 1;
			updatedPrice = currentPrice - originalPrice;
			listTotal -= originalPrice;
		}

		localStorage.setItem(listTotalForIdOfList, listTotal);
	}
}

//!ud
//updates the price and quantity of an item in local storage using the items' id, found the in HTML
function updateStoredPriceAndQuantity(listId, newQuantity, newTotal) {
	const storedItems = itemsArrFromLocalStorage();
	if (localStorage.getItem(listItemsForIdOfList)) {
		//updates the actual price in local storage
		for (const obj of storedItems) {
			if (obj.id === listId) {
				obj.quantity = newQuantity;
				obj.total = newTotal;
				break;
			}
		}

		localStorage.setItem(listItemsForIdOfList, JSON.stringify(storedItems));
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

export function createNewItem() {
	itemObject["itemName"] = nameInputElem.value;

	const totalElem = getCurrentTotalElem();

	//every time the user adds a new item, add it's original price to the current total of the list
	let currentTotal = Number(totalElem.innerText);
	currentTotal += Number(priceInputElem.value);

	//updates the list total in the local storage
	localStorage.setItem(listTotalForIdOfList, currentTotal);

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

export function updateItems() {
	let listDataObj = null;
	let totalIncrease = null;
	let totalDecrease = null;

	updateStoredItem();

	populateItem(listDataObj, itemToUpdate.val); //update items in HTML

	updateListTotal();

	itemToUpdate.val = null; //clears this variable so that another item the user wants to update can take it's place

	addItemsDialog.close();

	//update items in local storage
	function updateStoredItem() {
		const storedList = itemsArrFromLocalStorage();

		//iterate over the existing objects, and update the right object's name, description, price and total
		for (const obj of storedList) {
			if (Number(itemToUpdate.val.id) === obj.id) {
				const formerTotal = obj.total;
				const newPriceInput = Number(priceInputElem.value);
				const newTotal = newPriceInput * obj.quantity;

				//e.g former total was 40, now the new total is 60
				if (formerTotal < newTotal) {
					totalIncrease = newTotal - formerTotal;
					//e.g former total was 60, now the new total is 40
				} else if (formerTotal > newTotal) {
					totalDecrease = formerTotal - newTotal;
				}

				listDataObj = obj;

				//update the object with the user's input
				obj.itemName = nameInputElem.value;
				obj.description = descInputElem.value;
				obj.price = newPriceInput;
				obj.total = newTotal;
				break;
			}
		}

		//store the updated arr
		localStorage.setItem(listItemsForIdOfList, JSON.stringify(storedList));
	}

	//updates the list total in HTML and in local storage
	function updateListTotal() {
		//update total in HTML
		const currentListTotal = Number(getCurrentTotalElem().innerText);

		//could be less verbose but...
		if (totalIncrease) {
			getCurrentTotalElem().innerText = currentListTotal + totalIncrease; //40 + 20 = 60
			localStorage.setItem(
				listTotalForIdOfList,
				JSON.stringify(currentListTotal + totalIncrease),
			);
		} else if (totalDecrease) {
			getCurrentTotalElem().innerText = currentListTotal - totalDecrease; //60 - 20 = 40
			localStorage.setItem(
				listTotalForIdOfList,
				JSON.stringify(currentListTotal - totalDecrease),
			);
		}
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

	addNewItemToLocalStorage(listItemsForIdOfList, itemObject);
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
	quantityElem.innerText = listItemObj.quantity;
}

//display the container of list items if there are list items in local storage
export function toggle() {
	const noItemsCont = document.querySelector("#no-items-cont");
	const itemsAndAddBtnCont = document.querySelector("#items-and-add-btn-cont");

	noItemsCont.classList.toggle("display-none"); //hide the default page
	itemsAndAddBtnCont.classList.toggle("display-none"); //show the list of items
}

export function clearForm() {
	//clears the former input in the form data for a fresh, clean, form
	formElements.forEach((element) => {
		if (element.className === "item-data-input") {
			element.value = "";
		}
	});
}
