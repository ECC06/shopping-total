//...THIS FILE CONTAINS FUNCTIONS that are shared by list-page.js and lists-page.js
//creates a new array in local storage if it's empty, or updates the existing array if it's not
export function storeItemsInLocalStorage(key, obj) {
	if (!localStorage.getItem(key)) {
		//store an array with the first object in local storage
		localStorage.setItem(key, JSON.stringify([obj]));
	} else {
		//update the existing local storage array
		const arrOfLists = JSON.parse(localStorage.getItem(key));
		arrOfLists.push(obj);

		localStorage.setItem(key, JSON.stringify(arrOfLists));
	}
}

export const listsArrFromLocalStorage = () =>
	JSON.parse(localStorage.getItem("lists"));
