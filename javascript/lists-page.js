//...THIS FILE CONTAINS THE MAIN LOGIC OF MANAGING USER LISTS

import {
	addListToHTML,
	returnCurrentDate,
	storeList,
	toggleListDisplay,
	userDuplicatedListTitle,
} from "./lists-page-utilities.js";

import { listsArrFromLocalStorage } from "./shared.js";

const initialCreateListBtn = document.querySelector("#create-list-btn");
const cancelCreateListBtn = document.querySelector("#close-dialog-btn");
const nameListForm = document.querySelector("#add-item-form");
export const addListDialog = document.querySelector("#add-list-dialog");
const addListBtn = document.querySelector("#add-list-btn");
export const listsCont = document.querySelector("#lists-cont");

const updateListNameDialog = document.querySelector("#update-name-dialog");
const cancelChangeBtn = document.querySelector("#cancel-change-btn");
const newNameInputElem = document.querySelector("#new-name-input");

const deleteListDialog = document.querySelector("#delete-list-dialog");
const deleteListForm = document.querySelector("#delete-list-form");
const cancelDeleteBtn = document.querySelector("#cancel-delete-btn");

let listToUpdateName = null; //the list that was selected for updating or deleting
let listToDelete = null; //the list that was selected for updating or deleting

export const lastElemOfList = () => listsCont.lastElementChild; //gets the current last element of the list (it's changes as more and more are added)

//object that will contain info about each list item
export const listObject = {};

//handles some state when the user clicks on the open button
listsCont.addEventListener("click", (e) => {
	if (e.target.className === "open-btn") {
		e.preventDefault();
		const listItem = e.target.parentElement.parentElement;
		const listId = listItem.id;
		const listName = listItem.firstElementChild.firstElementChild.innerText;
		const lastOpenedElem = listItem.firstElementChild.lastElementChild;

		let objDataFromLocalStorage = null;

		storeLastOpened();

		//updating the HTML with the date the day the user last opened the list (found in local storage)
		lastOpenedElem.innerText = `Last opened: ${objDataFromLocalStorage.lastOpened}`;

		localStorage.setItem("list-id", listId); // Store the list id in local storage for use inside of the list
		localStorage.setItem("list-name", listName); // Store the list's name in local storage for use inside of the list

		window.location.href = "./list-page.html"; //take the user to the page that stores their list items

		//update last opened in local storage
		function storeLastOpened() {
			const listsFromLocalStorage = listsArrFromLocalStorage();
			const [day, month, year] = returnCurrentDate();
			const dateLastOpenedText = `${month} ${day} ${year}`;

			for (const obj of listsFromLocalStorage) {
				if (obj.id === Number(listId)) {
					objDataFromLocalStorage = obj;
					obj["lastOpened"] = dateLastOpenedText;
					break;
				}
			}

			localStorage.setItem("lists", JSON.stringify(listsFromLocalStorage));
		}
	}
});

//!READ lists in local storage
//if local storage is not empty, this handler fetches the array of lists from local storage and displays it as HTML on the page
document.addEventListener("DOMContentLoaded", () => {
	if (localStorage.getItem("lists")) {
		listsArrFromLocalStorage().forEach((obj) => {
			addListToHTML(obj);
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
		listObject["listName"] = listName;
	}

	storeList();
	addListToHTML(listObject);
	nameListForm.elements["list-name-input"].value = "";

	//if true, a user is adding an list for the first time
	if (listsArrFromLocalStorage().length === 1) {
		toggleListDisplay(); //display list container for the first time if there's only one list in local storage
	}

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

	if (e.target.tagName === "svg" || e.target.tagName === "path") {
		listToUpdateName = e.target.closest(".list-cont");

		//populates the input box with the list title that's already there
		const listName = listToUpdateName.querySelector(".list-name");

		newNameInputElem.value = listName.innerText;
		updateListNameDialog.showModal();
	}
});

//handles the updating of the list name
updateListNameDialog.addEventListener("submit", (e) => {
	e.preventDefault();

	if (userDuplicatedListTitle(newNameInputElem.value)) {
		alert(`You already have a list with this name! Try something else.`);
		return;
	}

	const storedList = listsArrFromLocalStorage();

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
	const listNameElem = listToUpdateName.querySelector(".list-name");
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
	if (e.target.className === "delete-btn") {
		listToDelete = e.target.closest(".list-cont");
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

	localStorage.removeItem(`list-items-for-${listToDelete.id}`);
	localStorage.removeItem(`list-total-for-${listToDelete.id}`);

	listToDelete = null; //reset selected list to null so that another list can be stored inside in the future

	deleteListDialog.close();
});

//handles the closing of the form for deleting a list
cancelDeleteBtn.addEventListener("click", (e) => {
	deleteListDialog.close();
});
