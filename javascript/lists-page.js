const initialCreateListBtn = document.querySelector("#create-list-btn");
const cancelCreateListBtn = document.querySelector("#close-dialog-btn");
const nameListForm = document.querySelector("#add-item-form");
const addListDialog = document.querySelector("#add-list-dialog");
const addListBtn = document.querySelector("#add-list-btn");
const listsCont = document.querySelector("#lists-cont");
const updateListNameDialog = document.querySelector("#update-name-dialog");
const changeListNameBtn = document.querySelector("#change-name-btn");
const cancelChangeBtn = document.querySelector("#cancel-change-btn");
const newNameInputElem = document.querySelector("#new-name-input");
let listToUpdateName = null;

const listFromLocalStorage = () => JSON.parse(localStorage.getItem("lists"));
const localStorageEmpty = () => !localStorage.getItem("lists");

const lastElemOfList = () => listsCont.lastElementChild; //gets the current last element of the list (it's changes as more and more are added)

//object that will contain info about each list item
const listObj = {};

//!UTILITY FUNCTIONS (CALLED MULTIPLE TIMES)

//hides the default page and shows the list
function displayList() {
	const listsAndAddButtonCont = document.querySelector(
		"#lists-and-add-button-cont",
	);
	const noListsCont = document.querySelector("#no-lists-cont");
	const header = document.querySelector("header");

	noListsCont.classList.add("display-none"); //hide default page

	header.classList.remove("display-none"); //show header
	listsAndAddButtonCont.classList.remove("display-none"); //show lists
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
	// debugger;
	lastElemOfList().id = listObj.id; //populate this single list item with the id of the single list object in local storage

	lastElemOfList().classList.remove("display-none");

	//extracts the elements containing the list element's name and date of creation from a the first div in the last list item
	const [listNameElem, dateCreatedElem] =
		lastElemOfList().firstElementChild.children;

	//updates the inner text of the newly added list element with properties the last object in local storage
	listNameElem.innerText = listObj.listName;
	dateCreatedElem.innerText = listObj.dateOfCreation;
}

//!EVENT HANDLERS AND MAIN LOGIC

//button that is shown on the "no lists yet" page
initialCreateListBtn.addEventListener("click", () => {
	addListDialog.showModal();
});

//if local storage is not empty, this handler fetches the array of lists from local storage and displays it as HTML on the page
document.addEventListener("DOMContentLoaded", () => {
	const listCont = document.querySelector(".list-cont");

	if (!localStorageEmpty()) {
		listsCont.innerHTML = "";

		listFromLocalStorage().forEach((obj) => {
			//each iteration appends a clone of listCont so that listCont doesn't get moved every time appendChild is called
			listsCont.appendChild(listCont.cloneNode(true));
			populateListItem(obj);
			displayList();
		});
	}
});

//when submitted, a new list created
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

updateListNameDialog.addEventListener("submit", (e) => {
	e.preventDefault();
	const storedList = listFromLocalStorage();

	if (userDuplicatedTitle(newNameInputElem.value)) {
		alert(`You already have a list named ${newNameInputElem.value}!`);
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
	updateListNameDialog.close();
});

cancelChangeBtn.addEventListener("click", (e) => {
	updateListNameDialog.close();
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
		displayList(); //display list container for the first time
	} else {
		//if there are some lists in the container

		const cloned = lastElemOfList().cloneNode(true); //clone the last item in the list
		listsCont.appendChild(cloned); //add it to the list
		populateListItem(lastObjInLocalStorage);
	}
}
