//...THIS FILE CONTAINS DEPENDENCIES FOR lists-page.js

import {
	addListDialog,
	lastElemOfList,
	listObject,
	listsCont,
} from "./lists-page.js";

import {
	listsArrFromLocalStorage,
	storeItemsInLocalStorage,
} from "./shared.js";

//hides the default page and shows the list
export function toggleListDisplay() {
	const listsAndAddButtonCont = document.querySelector(
		"#lists-and-add-button-cont",
	);
	const noListsCont = document.querySelector("#no-lists-cont");
	const header = document.querySelector("header");

	noListsCont.classList.toggle("display-none"); //hide default page

	header.classList.toggle("display-none"); //show header
	listsAndAddButtonCont.classList.toggle("display-none"); //show lists
}

//returns true if the name the user types in has been stored by them previously. otherwise, it returns false
export function userDuplicatedListTitle(userInput) {
	if (localStorage.getItem("lists")) {
		for (const obj of listsArrFromLocalStorage()) {
			if (userInput.toLowerCase() === obj["listName"].toLowerCase()) {
				return true;
			}
		}
	}

	return false;
}

//stores the user's input in local storage and then displays it to the user
export function storeList() {
	//store list id
	const listId = Math.floor(Math.random() * 900) + 100; //generates a number between 100 and 999 inclusive
	listObject["id"] = listId;

	const [day, month, year] = returnCurrentDate();

	const dateCreatedText = `${month} ${day} ${year}`;
	const dateLastOpenedText = `${month} ${day} ${year}`;

	listObject["created"] = dateCreatedText;
	listObject["lastOpened"] = dateLastOpenedText;

	//creates a new array in local storage if it's empty, or updates the existing array if it's not
	storeItemsInLocalStorage("lists", listObject);
}

//adds a new item to the list container and populates it with the newly added list data (e.g the list name the user just typed in)
export function addListToHTML(listObj) {
	const listCont = document.querySelector(".list-cont");

	const clonedList = listCont.cloneNode(true);
	listsCont.appendChild(clonedList);
	clonedList.classList.toggle("display-none"); //display list item

	populateListItem(listObj); //update the newly added item with the right information

	addListDialog.close();
}

export function populateListItem(listObj) {
	const listToPopulate = lastElemOfList();

	listToPopulate.id = listObj.id; //populate the last list item with the id of the single list object in local storage

	//extracts the elements containing the list element's name and date of creation from a the first div in the last list item
	const [listNameElem, dateCreatedElem, lastOpenedElem] =
		listToPopulate.firstElementChild.children;

	//updates the list element's name and date of creation
	listNameElem.innerText = listObj.listName;
	dateCreatedElem.innerText = `Created: ${listObj.created}`;
	lastOpenedElem.innerText = `Last opened: ${listObj.lastOpened}`;
}

//returns an array containing the day, month and year at the time of invocation (e.g Dec 1 2025)
function returnCurrentDate() {
	//store date of creation
	const dateObj = new Date();
	const day = dateObj.getDate();
	const month = dateObj.toLocaleString("default", { month: "short" });
	const year = dateObj.getFullYear();

	return [day, month, year];
}
