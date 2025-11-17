const createListBtn = document.querySelector("#create-list-btn");
const cancelCreateListBtn = document.querySelector("#cancel-create-list-btn");
const nameListForm = document.querySelector("form");
const nameListDialogue = document.querySelector("dialog");
const addListBtn = document.querySelector("#add-list-btn");
const listFromLocalStorage = () => JSON.parse(localStorage.getItem("lists"));
const listsCont = document.querySelector("#lists-cont");
const listCont = document.querySelector(".list-cont");
//object that will contain info about each list item
const listObj = {};

const localStorageEmpty = () => {
	if (!localStorage.getItem("lists")) {
		return true;
	} else {
		return false;
	}
};

//clear the "list-name" input field
const closeDialogAndClearInput = () => {
	nameListForm.elements["list-name-input"].value = "";
	nameListDialogue.close();
};

// executes after the DOM has been parsed (i.e, just before the JS runs)
document.addEventListener("DOMContentLoaded", () => {
	if (!localStorageEmpty()) {
		listFromLocalStorage().forEach((listObj) => {
			const cloned = listCont.cloneNode(true);
			listsCont.appendChild(cloned); //add a cloned element to the container of lists

			cloned.classList.remove("display-none");

			const [listName, dateOfCreation] = cloned.firstElementChild.children;

			listName.innerText = listObj.userInput;
			dateOfCreation.innerText = listObj.dateOfCreation;
		});
		displayList();
	}
});

createListBtn.addEventListener("click", () => {
	nameListDialogue.showModal();
});

cancelCreateListBtn.addEventListener("click", () => {
	closeDialogAndClearInput();
});

addListBtn.addEventListener("click", () => {
	//clear the "list-name" input field
	nameListDialogue.showModal();
});

//create the first list when the user submits the form
nameListForm.addEventListener("submit", (e) => {
	e.preventDefault();

	//store list name
	const input = nameListForm.elements["list-name-input"].value;

	// Check for duplicates before storing
	if (userDuplicatedTitle(input)) {
		alert(`You already have a list named ${input}!`);
		closeDialogAndClearInput();
		return; //terminates the function
	} else {
		listObj["userInput"] = input;
	}

	storeList();
	addNewItem();
	closeDialogAndClearInput();
});

//returns true if the name the user types in has been stored by them previously. otherwise, it returns false
function userDuplicatedTitle(userInput) {
	if (listsCont.children.length > 0) {
		for (const obj of listFromLocalStorage()) {
			if (obj.userInput === userInput) {
				return true;
			}
		}
	}

	return false;
}

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
function addNewItem() {
	const listOfItems = listsCont.children;

	//if there are no lists inside the container, then just add a single list item (defined outside of the main element in html)
	if (listsCont.children.length === 0) {
		listsCont.appendChild(listCont);
		displayList();
	} else {
		//if there are some lists in the container, clone the last element and add it to the container
		const cloned = listCont.cloneNode(true);
		listsCont.appendChild(cloned);
	}

	populateListItem();

	function populateListItem() {
		//removes the "display-none" class from the last list element
		const lastListItem = listOfItems[listOfItems.length - 1];
		const lastListObj =
			listFromLocalStorage()[listFromLocalStorage().length - 1];

		lastListItem.classList.remove("display-none");

		const [listNameElem, dateCreatedElem] =
			lastListItem.firstElementChild.children;

		//updates the inner text of the newly added list element with properties the last object in local storage
		listNameElem.innerText = lastListObj.userInput;
		dateCreatedElem.innerText = lastListObj.dateOfCreation;
	}
}

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
	nameListDialogue.close();
}
