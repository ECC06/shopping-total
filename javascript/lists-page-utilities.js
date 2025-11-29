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

export function populateListItem(listObj) {
	const listToPopulate = lastElemOfList();

	listToPopulate.id = listObj.id; //populate the last list item with the id of the single list object in local storage

	//extracts the elements containing the list element's name and date of creation from a the first div in the last list item
	const [listNameElem, dateCreatedElem] =
		listToPopulate.firstElementChild.children;

	//updates the list element's name and date of creation
	listNameElem.innerText = listObj.listName;
	dateCreatedElem.innerText = listObj.dateOfCreation;
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

	//store date of creation
	const dateObj = new Date();
	const month = dateObj.toLocaleString("default", { month: "short" });
	const day = dateObj.getDate();
	const year = dateObj.getFullYear();
	const dateOfCreation = `Created: ${month} ${day} ${year}`;
	listObject["dateOfCreation"] = dateOfCreation;

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
