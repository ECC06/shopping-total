//...THIS FILE CONTAINS UTILITY FUNCTIONS in list-page.js (i.e, functions that are re-used multiple times)

import {
	addItemFormElements,
	addItemSubmitter,
	addItemsDialog,
	addOrUpdateItemsForm,
	buttonsCont,
	descInputElem,
	getCurrentTotalElem,
	itemObject,
	itemsArrFromLocalStorage,
	itemsCont,
	itemToUpdate,
	nameInputElem,
	nameOfListItemsInLocalStorage,
	nameOfListTotalInLocalStorage,
	priceInputElem,
	updateSubmitter,
} from "./list-page.js";

import { addNewItemToLocalStorage } from "./shared.js";

export function userDuplicatedItemName(userInput) {
	if (localStorage.getItem(nameOfListItemsInLocalStorage)) {
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
	if (localStorage.getItem(nameOfListItemsInLocalStorage)) {
		//updates update the quantity and total in local storage
		for (const obj of storedItems) {
			if (obj.id === listId) {
				obj.quantity = newQuantity;
				obj.total = newItemTotal;
				break;
			}
		}

		localStorage.setItem(
			nameOfListItemsInLocalStorage,
			JSON.stringify(storedItems),
		);
	}

	//update the list total in local storage
	localStorage.setItem(nameOfListTotalInLocalStorage, newListTotal);
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
	itemObject["itemName"] = nameInputElem.value;

	const totalElem = getCurrentTotalElem();

	//every time the user adds a new item, add it's original price to the current total of the list
	let currentTotal = Number(totalElem.innerText);
	currentTotal += Number(priceInputElem.value);

	//updates the list total in the local storage
	localStorage.setItem(nameOfListTotalInLocalStorage, currentTotal);

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
	const listItemClicked = event.target.closest(".list-item"); // the closest list item to the element that was clicked

	itemToUpdate.item = listItemClicked; // the global variable: "itemToUpdate.item" is updated so it can be used in the updateItem() function and the submit event listener for updating the form.

	// if the element that received the event is able to traverse upwards and find a list item,
	if (listItemClicked) {
		displayOnlyUpdateButton();
		populateInputs();

		function displayOnlyUpdateButton() {
			// only add a new update button but ONLY if it's not already inside the buttons container
			if (!addOrUpdateItemsForm.querySelector("#update-item-submitter")) {
				const clonedUpdateBtn = updateSubmitter.cloneNode(true);
				buttonsCont.prepend(clonedUpdateBtn);

				clonedUpdateBtn.classList.toggle("display-none"); //show the update button
				addItemSubmitter.style.display = "none"; //hide the add item button
			}
			addItemsDialog.showModal();
		}
		//populate the update form with the current data in the list element
		function populateInputs() {
			const listItemId = Number(listItemClicked.id);

			const listItemInfoInLocalStorage = itemsArrFromLocalStorage().find(
				(obj) => obj.id === listItemId,
			);

			const nameLabel = listItemClicked.querySelector(".item-name");
			const descriptionElem = listItemClicked.querySelector(".description");

			nameInputElem.value = nameLabel.innerText;
			descInputElem.value = descriptionElem.innerText;
			priceInputElem.value = listItemInfoInLocalStorage.price;
		}
	}
}

export function updateItems() {
	const storedList = itemsArrFromLocalStorage();

	let listDataObj = null;
	let totalIncrease = null;
	let totalDecrease = null;

	//update items in local storage

	for (const obj of storedList) {
		if (Number(itemToUpdate.item.id) === obj.id) {
			const formerTotal = obj.total; // 60
			const newPriceInput = Number(priceInputElem.value);
			const newTotal = newPriceInput * obj.quantity;

			if (formerTotal < newTotal) {
				totalIncrease = newTotal - formerTotal;
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
	localStorage.setItem(
		nameOfListItemsInLocalStorage,
		JSON.stringify(storedList),
	);

	populateItem(listDataObj, itemToUpdate.item); //update items in HTML

	updateListTotal(totalIncrease, totalDecrease); //update list total in local storage and html

	itemToUpdate.item = null; //clears this variable so that another item the user wants to update can take it's place

	addItemsDialog.close();
}

//updates the list total in HTML and in local storage
function updateListTotal(increase, decrease) {
	//update total in HTML
	const currentListTotal = Number(getCurrentTotalElem().innerText);

	//could be less verbose but...
	if (increase) {
		getCurrentTotalElem().innerText = currentListTotal + increase; //40 + 20 = 60
		localStorage.setItem(
			nameOfListTotalInLocalStorage,
			JSON.stringify(currentListTotal + increase),
		);
	} else if (decrease) {
		getCurrentTotalElem().innerText = currentListTotal - decrease; //60 - 20 = 40
		localStorage.setItem(
			nameOfListTotalInLocalStorage,
			JSON.stringify(currentListTotal - decrease),
		);
	}
}

export function removeUpdateButtonIfItExists() {
	const updateSubmitterInButtonsCont = buttonsCont.querySelector(
		"#update-item-submitter",
	);
	//removes the update button from the button container (so that at all times the button container has only ONE submitter)
	if (updateSubmitterInButtonsCont) {
		buttonsCont.removeChild(updateSubmitterInButtonsCont);
		addItemSubmitter.style.display = "flex"; //show the add button because at this point the display is set to "none"
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

	addNewItemToLocalStorage(nameOfListItemsInLocalStorage, itemObject);
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
	const itemName = itemToPopulate.querySelector(".item-name");
	const descriptionElem = itemToPopulate.querySelector(".description");
	const priceElem = itemToPopulate.querySelector(".price");
	const quantityElem = itemToPopulate.querySelector(".quantity");

	itemName.innerText = listItemObj.itemName;
	descriptionElem.innerText = listItemObj.description;
	priceElem.innerText = listItemObj.total;
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
	addItemFormElements.forEach((element) => {
		if (element.className === "item-data-input") {
			element.value = "";
		}
	});
}
