const initialCreateListBtn = document.querySelector("#create-list-btn");
const cancelCreateListBtn = document.querySelector("#close-dialog-btn");
const nameListForm = document.querySelector("#add-item-form");
const addListDialog = document.querySelector("#add-list-dialog");
const addListBtn = document.querySelector("#add-list-btn");
const listsCont = document.querySelector("#lists-cont");

const updateListNameDialog = document.querySelector("#update-name-dialog");
const cancelChangeBtn = document.querySelector("#cancel-change-btn");
const newNameInputElem = document.querySelector("#new-name-input");

const deleteListDialog = document.querySelector("#delete-list-dialog");
const deleteListForm = document.querySelector("#delete-list-form");
const cancelDeleteBtn = document.querySelector("#cancel-delete-btn");
const confirmDeleteBtn = document.querySelector("#confirm-delete-btn");

let selectedList = null; //the list that was selected for updating or deleting

const listFromLocalStorage = () => JSON.parse(localStorage.getItem("lists"));
const localStorageEmpty = () => !localStorage.getItem("lists");

const lastElemOfList = () => listsCont.lastElementChild; //gets the current last element of the list (it's changes as more and more are added)

//object that will contain info about each list item
const listObj = {};

//!UTILITY FUNCTIONS (CALLED MULTIPLE TIMES)

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
	addListDialog.close();
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

//...MAIN LOGIC

//!READ lists in local storage
//if local storage is not empty, this handler fetches the array of lists from local storage and displays it as HTML on the page
document.addEventListener("DOMContentLoaded", () => {
	const listCont = document.querySelector(".list-cont");

	if (!localStorageEmpty()) {
		listsCont.innerHTML = "";

		listFromLocalStorage().forEach((obj) => {
			//each iteration appends a clone of listCont so that listCont doesn't get moved every time appendChild is called
			listsCont.appendChild(listCont.cloneNode(true));
			populateListItem(obj);
		});

		toggleListDisplay();
	}
});

//!CREATE NEW LIST

//button that is shown on the "no lists yet" page
initialCreateListBtn.addEventListener("click", () => {
	addListDialog.showModal();
});

nameListForm.addEventListener("submit", (e) => {
	e.preventDefault();

	const listName = nameListForm.elements["list-name-input"].value;

	if (userDuplicatedTitle(listName)) {
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

//when clicked, the form for naming a list is shown
addListBtn.addEventListener("click", () => {
	//clear the "list-name" input field
	addListDialog.showModal();
});

//when clicked, the form for naming a list is closed
cancelCreateListBtn.addEventListener("click", () => {
	nameListForm.elements["list-name-input"].value = "";
	addListDialog.close();
});

//!UPDATE LIST NAME
//handles updating the name of lists
listsCont.addEventListener("click", (e) => {
	//?using event delegation instead of document.querySelectorAll because this button may not exist yet

	if (e.target.className === "edit-btn") {
		selectedList = e.target.parentElement; //storing the parent list element of the edit button

		//populates the input box with the list title that's already there
		const divContainingListName = selectedList.children[0];
		newNameInputElem.value =
			divContainingListName.children["list-name"].innerText;

		updateListNameDialog.showModal();
	}
});

updateListNameDialog.addEventListener("submit", (e) => {
	e.preventDefault();
	const storedList = listFromLocalStorage();

	if (userDuplicatedTitle(newNameInputElem.value)) {
		alert(`You already have a list named ${newNameInputElem.value}!`);
		return;
	}

	//finds the right list obj in local storage and updates it with the user's input
	for (const obj of storedList) {
		if (obj.id === Number(selectedList.id)) {
			//update the object
			obj.listName = newNameInputElem.value;
			break;
		}
	}

	localStorage.setItem("lists", JSON.stringify(storedList));

	//updates the title of the list with the user's input
	const divContainingListName = selectedList.children[0];
	const listNameElem = divContainingListName.children["list-name"];
	listNameElem.innerText = newNameInputElem.value;

	newNameInputElem.value = "";
	selectedList = null; //reset selected list to null so that another list can be stored inside in the future
	updateListNameDialog.close();
});

cancelChangeBtn.addEventListener("click", (e) => {
	updateListNameDialog.close();
});

//!DELETE A LIST
listsCont.addEventListener("click", (e) => {
	//?using event delegation instead of document.querySelectorAll because this button may not exist yet in the DOM

	selectedList = e.target.parentElement.parentElement;

	if (e.target.className === "delete-btn") {
		deleteListDialog.showModal();
	}
});

cancelDeleteBtn.addEventListener("click", (e) => {
	deleteListDialog.close();
});

//handles deletion of lists
deleteListForm.addEventListener("submit", (e) => {
	e.preventDefault();

	//filter out any list that matches the id of the one the user selected
	const newListForLocalStorage = listFromLocalStorage().filter(
		(obj) => obj.id !== Number(selectedList.id),
	);

	//if there's no items left to store in the local storage array, then remove the array from local storage completely
	if (newListForLocalStorage.length === 0) {
		localStorage.removeItem("lists");
		toggleListDisplay();
	} else {
		localStorage.setItem("lists", JSON.stringify(newListForLocalStorage));
	}

	selectedList.remove(); //removes the selected list from the DOM

	selectedList = null; //reset selected list to null so that another list can be stored inside in the future

	deleteListDialog.close();
});

//stores the user's input in local storage and then displays it to the user
function storeList() {
	//store last modified
	const lastModified = null; //list hasn't been modified yet
	listObj["lastModified"] = lastModified;

	//store list id
	const listId = Math.floor(Math.random() * 1000);
	listObj["id"] = listId;

	//store date of creation
	const dateObj = new Date();
	const month = dateObj.toLocaleString("default", { month: "short" });
	const day = dateObj.getDate();
	const year = dateObj.getFullYear();
	const dateOfCreation = `Created: ${month} ${day} ${year}`;
	listObj["dateOfCreation"] = dateOfCreation;

	updateLocalStorage();

	function updateLocalStorage() {
		if (localStorageEmpty()) {
			localStorage.setItem("lists", JSON.stringify([listObj]));
		} else {
			const arrOfLists = JSON.parse(localStorage.getItem("lists"));
			arrOfLists.push(listObj);

			localStorage.setItem("lists", JSON.stringify(arrOfLists));
		}
	}
}

//adds a new item to the list container and populates it with the newly added list data (e.g the list name the user just typed in)
function addListToHTML() {
	const lastObjInLocalStorage =
		listFromLocalStorage()[listFromLocalStorage().length - 1];

	if (listFromLocalStorage().length === 1) {
		populateListItem(lastObjInLocalStorage); //update the newly added item with the right information
		toggleListDisplay(); //display list container for the first time
	} else {
		//if there are some lists in the container

		const cloned = lastElemOfList().cloneNode(true); //clone the last item in the list
		listsCont.appendChild(cloned); //add it to the list
		populateListItem(lastObjInLocalStorage);
	}
}
