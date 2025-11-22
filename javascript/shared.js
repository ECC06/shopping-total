//...THIS FILE CONTAINS FUNCTIONS that are shared by list-page.js and lists-page.js

//creates a new array in local storage if it's empty, or updates the existing array if it's not
export function updateLocalStorage(key, obj) {
	if (!localStorage.getItem(key)) {
		localStorage.setItem(key, JSON.stringify([obj]));
	} else {
		const arrOfLists = JSON.parse(localStorage.getItem(key));
		arrOfLists.push(obj);

		localStorage.setItem(key, JSON.stringify(arrOfLists));
	}
}
