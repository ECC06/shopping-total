//...THIS FILE CONTAINS UTILITY FUNCTIONS THAT ARE REPEATED THROUGHOUT THE APP'S MAIN LOGIC

import {
	lastElemOfList,
	listFromLocalStorage,
	localStorageEmpty,
} from "./lists-page.js";

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

//returns true if the name the user types in has been stored by them previously. otherwise, it returns false
function userDuplicatedTitle(userInput) {
	if (!localStorageEmpty()) {
		for (const obj of listFromLocalStorage()) {
			if (obj.listName === userInput) {
				return true;
			}
		}
	}

	return false;
}

function populateListItem(listObj) {
	lastElemOfList().id = listObj.id; //populate this single list item with the id of the single list object in local storage

	lastElemOfList().classList.remove("display-none");

	//extracts the elements containing the list element's name and date of creation from a the first div in the last list item
	const [listNameElem, dateCreatedElem] =
		lastElemOfList().firstElementChild.children;

	//updates the inner text of the newly added list element with properties the last object in local storage
	listNameElem.innerText = listObj.listName;
	dateCreatedElem.innerText = listObj.dateOfCreation;
}

export { toggleListDisplay, userDuplicatedTitle, populateListItem };
