//...THIS FILE CONTAINS DEPENDENCIES FOR lists-page.js

import { lastElemOfList } from "./lists-page.js";

import { listsArrFromLocalStorage } from "./shared.js";

//hides the default page and shows the list
function toggleListDisplay() {
	const listsAndAddButtonCont = document.querySelector(
		"#lists-and-add-button-cont",
	);
	const noListsCont = document.querySelector("#no-lists-cont");
	const header = document.querySelector("header");

	noListsCont.classList.toggle("display-none"); //hide default page

	header.classList.toggle("display-none"); //show header
	listsAndAddButtonCont.classList.toggle("display-none"); //show lists
}

function populateListItem(listObj) {
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
function userDuplicatedTitle(userInput) {
	if (localStorage.getItem("lists")) {
		for (const obj of listsArrFromLocalStorage()) {
			if (userInput.toLowerCase() === obj["listName"].toLowerCase()) {
				return true;
			}
		}
	}

	return false;
}

export { toggleListDisplay, userDuplicatedTitle, populateListItem };
