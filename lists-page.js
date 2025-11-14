const listObj = {};

const createListBtn = document.querySelector("#create-list-btn");
const cancelCreateListBtn = document.querySelector("#cancel-create-list-btn");
const nameListForm = document.querySelector("form");
const nameListDialogue = document.querySelector("dialog");

createListBtn.addEventListener("click", () => {
	nameListDialogue.showModal();
});

cancelCreateListBtn.addEventListener("click", () => {
	nameListDialogue.close();
});

//set the name of the first list when the user creates it
nameListForm.addEventListener("submit", (e) => {
	event.preventDefault();

	debugger;
	storeListInLocalStorage(e.target);
	populateList();
	displayCreatedList();
});

function storeListInLocalStorage(form) {
	//store last modified
	const lastModified = null; //list hasn't been modified yet
	listObj["lastModified"] = lastModified;

	//store list id
	const listId = Math.floor(Math.random() * 1000);
	listObj["id"] = listId;

	//store list name
	const userInput = form.elements["list-name-input"].value;
	listObj["userInput"] = userInput;

	//store date of creation
	const dateObj = new Date();
	const month = dateObj.toLocaleString("default", { month: "short" });
	const day = dateObj.getDate();
	const year = dateObj.getFullYear();
	const dateOfCreation = `${month} ${day} ${year}`;
	listObj["dateOfCreation"] = dateOfCreation;

	//store list name and date of creation in local storage
	localStorage.setItem("listObj", JSON.stringify(listObj));
}

function populateList() {
	const listNameElem = document.querySelector("#list-name");
	const listCreatedElem = document.querySelector("#list-created");
	const listObjFromLocalStorage = JSON.parse(localStorage.getItem("listObj"));

	listNameElem.innerText = listObjFromLocalStorage.userInput;
	listCreatedElem.innerText = listObjFromLocalStorage.dateOfCreation;
}

function displayCreatedList() {
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
