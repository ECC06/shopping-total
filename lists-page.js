const arrOfLists = [];

const createListBtn = document.querySelector("#create-list-btn");
const cancelCreateListBtn = document.querySelector("#cancel-create-list-btn");
const nameListForm = document.querySelector("form");
const nameListDialogue = document.querySelector("dialog");
const addListBtn = document.querySelector("#add-list-btn");
const listFromLocalStorage = () => JSON.parse(localStorage.getItem("lists"));
const listsCont = document.querySelector("#lists-cont");

const localStorageEmpty = () => {
	if (!localStorage.getItem("lists")) {
		return true;
	} else {
		return false;
	}
};

// Code to execute after the DOM has been parsed
document.addEventListener("DOMContentLoaded", () => {
	if (!localStorageEmpty()) {
		createListItems();
		displayList();
	}
});

createListBtn.addEventListener("click", () => {
	nameListDialogue.showModal();
});

cancelCreateListBtn.addEventListener("click", () => {
	nameListDialogue.close();
});

//create the first list when the user submits the form
nameListForm.addEventListener("submit", (e) => {
	e.preventDefault();
	storeAndDisplayInput();
});

addListBtn.addEventListener("click", (e) => {
	nameListDialogue.showModal();
});

//stores the user's input in local storage and then displays it to the user
function storeAndDisplayInput() {
	//object that will contain info about each list item
	const listObj = {};

	//store last modified
	const lastModified = null; //list hasn't been modified yet
	listObj["lastModified"] = lastModified;

	//store list id
	const listId = Math.floor(Math.random() * 1000);
	listObj["id"] = listId;

	//store list name
	const userInput = nameListForm.elements["list-name-input"].value;
	listObj["userInput"] = userInput;

	//store date of creation
	const dateObj = new Date();
	const month = dateObj.toLocaleString("default", { month: "short" });
	const day = dateObj.getDate();
	const year = dateObj.getFullYear();
	const dateOfCreation = `${month} ${day} ${year}`;
	listObj["dateOfCreation"] = dateOfCreation;

	//returns true if the name the user types in has been stored by them previously
	function userDuplicatedTitle() {
		if (listsCont.children.length > 0) {
			for (const obj of listFromLocalStorage()) {
				if (obj.userInput === userInput) {
					return true;
				}
			}
		}

		return false;
	}

	if (userDuplicatedTitle()) {
		alert(`You already have a list named ${userInput}!`);
		return;
	} else {
		arrOfLists.push(listObj);
		localStorage.setItem("lists", JSON.stringify(arrOfLists));
		createListItems();
		displayList();
	}
}

//iterates over the list of objects from local storage and converts them to HTML
function createListItems() {
	if (!localStorageEmpty()) {
		listFromLocalStorage().forEach((listObj) => {
			const listCont = document.querySelector(".list-cont");

			if (listsCont.children.length === 0) {
				listsCont.appendChild(listCont);
				setNames();
				listCont.classList.remove("display-none");
			} else {
				const cloned = listCont.cloneNode(true);
				listsCont.appendChild(cloned); //add a cloned element to the container of lists
				setNames();
			}

			function setNames() {
				const listOfNames = document.querySelectorAll("#list-name");

				listOfNames[listOfNames.length - 1].innerText = listObj.userInput;

				const listOfDatesCreated = document.querySelectorAll("#list-created");

				listOfDatesCreated[listOfDatesCreated.length - 1].innerText =
					listObj.dateOfCreation;
			}
		});
	}
}

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
