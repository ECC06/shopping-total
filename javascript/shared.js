//...This file contains FUNCTIONS AND VARIABLES that are shared by list-page.js and lists-page.js

//creates a new array in local storage if it's empty, or updates the existing array if it's not
export function addNewItemToLocalStorage(key, obj) {
    if (!localStorage.getItem(key)) {
        //store an array with the first object in local storage
        localStorage.setItem(key, JSON.stringify([obj]));
    } else {
        //update the existing local storage array
        const arrOfObjects = JSON.parse(localStorage.getItem(key));
        arrOfObjects.push(obj);

        localStorage.setItem(key, JSON.stringify(arrOfObjects));
    }
}

export const listsArrFromLocalStorage = () =>
    JSON.parse(localStorage.getItem("lists"));

export const getLast = (list) => list[list.length - 1];
