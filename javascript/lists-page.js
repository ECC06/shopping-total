//...THIS FILE CONTAINS THE MAIN LOGIC OF MANAGING USER LISTS

import {
	populateListItem,
	toggleListDisplay,
	userDuplicatedTitle as userDuplicatedListTitle,
} from "./lists-page-utilities.js";
import { updateLocalStorage } from "./shared.js";

const initialCreateListBtn = document.querySelector("#create-list-btn");
const cancelCreateListBtn = document.querySelector("#close-dialog-btn");
const nameListForm = document.querySelector("#add-item-form");
const addListDialog = document.querySelector("#add-list-dialog");
const addListBtn = document.querySelector("#add-list-btn");
const listsCont = document.querySelector("#lists-cont");
export const listCont = document.querySelector(".list-cont");

const updateListNameDialog = document.querySelector("#update-name-dialog");
const cancelChangeBtn = document.querySelector("#cancel-change-btn");
const newNameInputElem = document.querySelector("#new-name-input");

const deleteListDialog = document.querySelector("#delete-list-dialog");
const deleteListForm = document.querySelector("#delete-list-form");
const cancelDeleteBtn = document.querySelector("#cancel-delete-btn");

let listToUpdateName = null; //the list that was selected for updating or deleting
let listToDelete = null; //the list that was selected for updating or deleting

export const listsArrFromLocalStorage = () =>
	JSON.parse(localStorage.getItem("lists"));

export const lastElemOfList = () => listsCont.lastElementChild; //gets the current last element of the list (it's changes as more and more are added)

//object that will contain info about each list item
const listObj = {};

//!READ lists in local storage
//if local storage is not empty, this handler fetches the array of lists from local storage and displays it as HTML on the page
document.addEventListener("DOMContentLoaded", () => {
	if (localStorage.getItem("lists")) {
		// listsCont.innerHTML = ""; //removing the single list item inside lists cont for now.

		listsArrFromLocalStorage().forEach((obj) => {
			//each iteration appends a clone of listCont, instead of listCont itself, so that it doesn't get moved every time appendChild is called
			const clonedList = listCont.cloneNode(true);
			listsCont.appendChild(clonedList);
			populateListItem(obj);
		});

		toggleListDisplay();
	}
});

//!CREATE NEW LIST

//first button that handles the opening of a form for naming the list
initialCreateListBtn.addEventListener("click", () => {
	addListDialog.showModal();
});

//handles the submission of the list's name the user chose
nameListForm.addEventListener("submit", (e) => {
	e.preventDefault();

	const listName = nameListForm.elements["list-name-input"].value;

	if (userDuplicatedListTitle(listName)) {
		// Check for duplicates before storing
		alert(`You already have a list named ${listName}!`);
		return;
	} else {
		listObj["listName"] = listName;
	}

	storeList();
	addListToHTML();
	nameListForm.elements["list-name-input"].value = "";
	addListDialog.close();
});

//second button that handles the opening of a form for naming the list
addListBtn.addEventListener("click", () => {
	addListDialog.showModal();
});

//handles the closing of the form for naming a list
cancelCreateListBtn.addEventListener("click", () => {
	nameListForm.elements["list-name-input"].value = "";
	addListDialog.close();
});

//!UPDATE LIST NAME

//handles when user clicks on "edit" button, using event delegation
listsCont.addEventListener("click", (e) => {
	//?using event delegation instead of document.querySelectorAll because this button may not exist yet

	if (e.target.className === "edit-btn") {
		listToUpdateName = e.target.parentElement; //storing the parent list element of the edit button

		//populates the input box with the list title that's already there
		const divContainingListName = listToUpdateName.children[0];
		newNameInputElem.value =
			divContainingListName.children["list-name"].innerText;

		updateListNameDialog.showModal();
	}
});

//handles the updating of the list name
updateListNameDialog.addEventListener("submit", (e) => {
	e.preventDefault();
	const storedList = listsArrFromLocalStorage();

	if (userDuplicatedListTitle(newNameInputElem.value)) {
		alert(`You already have a list with this name! Try something else.`);
		return;
	}

	//finds the right list obj in local storage and updates it with the user's input
	for (const obj of storedList) {
		if (obj.id === Number(listToUpdateName.id)) {
			//update the object
			obj.listName = newNameInputElem.value;
			break;
		}
	}

	localStorage.setItem("lists", JSON.stringify(storedList));

	//updates the title of the list with the user's input
	const divContainingListName = listToUpdateName.children[0];
	const listNameElem = divContainingListName.children["list-name"];
	listNameElem.innerText = newNameInputElem.value;

	newNameInputElem.value = "";
	listToUpdateName = null; //reset selected list to null so that another list can be stored inside in the future
	updateListNameDialog.close();
});

//handles the closing of the form for updating a list's name
cancelChangeBtn.addEventListener("click", (e) => {
	updateListNameDialog.close();
});

//!DELETE A LIST

//handles when user clicks on "delete" button, using event delegation
listsCont.addEventListener("click", (e) => {
	//?using event delegation instead of document.querySelectorAll because this button may not exist yet in the DOM

	listToDelete = e.target.parentElement.parentElement;

	if (e.target.className === "delete-btn") {
		deleteListDialog.showModal();
	}
});

//handles deletion of lists
deleteListForm.addEventListener("submit", (e) => {
	e.preventDefault();

	//filter out any list that matches the id of the one the user selected
	const listsToKeepInStorage = listsArrFromLocalStorage().filter(
		(obj) => obj.id !== Number(listToDelete.id),
	);

	//if there's no items left to store in the local storage array, then remove the array from local storage completely. Else, store the new lists in local storage, with the selected list deleted
	if (listsToKeepInStorage.length === 0) {
		localStorage.removeItem("lists");
		listsCont.innerHTML = ""; //remove the list elements from the HTML as well
		toggleListDisplay();
	} else {
		localStorage.setItem("lists", JSON.stringify(listsToKeepInStorage));
		listToDelete.remove(); //removes the selected list from the DOM
	}

	listToDelete = null; //reset selected list to null so that another list can be stored inside in the future

	deleteListDialog.close();
});

//handles the closing of the form for deleting a list
cancelDeleteBtn.addEventListener("click", (e) => {
	deleteListDialog.close();
});

//stores the user's input in local storage and then displays it to the user
function storeList() {
	//store list id
	const listId = Math.floor(Math.random() * 900) + 100; //generates a number between 100 and 999 inclusive
	listObj["id"] = listId;

	//store date of creation
	const dateObj = new Date();
	const month = dateObj.toLocaleString("default", { month: "short" });
	const day = dateObj.getDate();
	const year = dateObj.getFullYear();
	const dateOfCreation = `Created: ${month} ${day} ${year}`;
	listObj["dateOfCreation"] = dateOfCreation;

	//creates a new array in local storage if it's empty, or updates the existing array if it's not
	updateLocalStorage("lists", listObj);
}

//adds a new item to the list container and populates it with the newly added list data (e.g the list name the user just typed in)
function addListToHTML() {
	const lastObjInLocalStorage =
		listsArrFromLocalStorage()[listsArrFromLocalStorage().length - 1];

	const clonedList = listCont.cloneNode(true);
	listsCont.appendChild(clonedList);

	populateListItem(lastObjInLocalStorage); //update the newly added item with the right information

	addListDialog.close();
	//if true, a user is adding an list for the first time
	if (listsArrFromLocalStorage().length === 1) {
		toggleListDisplay();
	} //display list container for the first time if there's only one list in local storage
}
