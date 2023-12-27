import fcc_curriculum from './data/curriculum.json' assert { type: 'json' };
import mdn_contents from './data/mdn_contents.json' assert {type: "json"};
import w3schools_contents from "./data/w3schools_contents.json" assert { type: "json"};
import resources from './data/resources.json' assert {type: 'json'};
import openTab from "./newTabLogic.js";


const CONTENT_LIST = document.body.querySelector("#contents-list");
const LINK_TEMPLATE = document.body.querySelector("#link-template");
let focusedItemIndicies = [];
let useNumbering = () => { return document.querySelector(".numbering-toggle").id === "on" };
console.log(useNumbering());
let currentContentList = fcc_curriculum;

function loadResourceLinks() {
	for (let i = 0; i < resources.length; i++) {
		let resource = resources[i];
		let clickableSquare = document.createElement('div');
		clickableSquare.className = "resource-div"
		clickableSquare.addEventListener('click', (event) => {
			openTab(event, resource["link"]);
		})
		if (resource.hasOwnProperty("icon link")) {
			let img = document.createElement('img');
			img.src = resource["icon link"];
			img.className = "resource-icon";
			clickableSquare.appendChild(img);
		} else {
			let svg = document.createElement('svg');
			svg.className = "resource-svg";
			let text = document.createElement('text');
			text.innerText = resource["name"];
			svg.appendChild(text);
			clickableSquare.appendChild(svg);
		}
		document.querySelector("#resources").appendChild(clickableSquare);
	}
}

function searchElement(element, searchTerm, indexString) {
	let title = element["title"];
	if (useNumbering()) {
		title = indexString + ". " + title;
	}
	// If the title of the element matches the search term, create a new HTML element and append it to the results container
	if (title.toLowerCase().includes(searchTerm.toLowerCase())) {
		let resultElement = createContentItem(title, element["link"], false, 0);
		CONTENT_LIST.appendChild(resultElement);
	}
	// If the element has children, recursively search through each child
	if (element["children"]) {
		for (let j = 0; j < element["children"].length; j++) {
			searchElement(element["children"][j], searchTerm, indexString + "." + parseInt(j));
		}
	}
}

function updateSearchList() {
	// Get the search term
	let searchBar = document.querySelector("#search-bar");
	let searchTerm = searchBar.value;
	if (searchTerm !== "") {
		clearContentsList();
		console.log(searchTerm);
		// Iterate over the elements in currentContentList.json
		for (let i = 0; i < currentContentList.length; i++) {
			searchElement(currentContentList[i], searchTerm, parseInt(i));
		}
	} else {
		loadContentsList();
	}
}

function loadOptions() {
	let toggleButtons = document.querySelectorAll(".toggle-buttons");
	toggleButtons.forEach((option) => {
		let buttons = option.querySelectorAll(".fcc-button");
		buttons.forEach((button) => {
			button.addEventListener('click', () => {
				buttons.forEach((btn) => {
					btn.classList.remove("enabled");
				})
				button.classList.add('enabled');
				option.id = button.innerText.toLowerCase();

				updateSearchList()
			})
		})
	})

	let websiteButtons = document.querySelector(".website-toggle").querySelectorAll(".fcc-button");
	websiteButtons.forEach((button) => {
		button.addEventListener("click", () => {
			switch (button.innerText) {
				case "FCC":
					currentContentList = fcc_curriculum;
					break;
				case "MDN":
					currentContentList = mdn_contents;
					break;
				case "W3SCHOOLS":
					currentContentList = w3schools_contents;
			}
			updateSearchList();
		})
	})

	// Get the input element
	let searchBar = document.querySelector("#search-bar");
	document.querySelector("#clear-button").addEventListener("click", () => {
		searchBar.value = "";
		loadContentsList();
	});
	// Add an event listener to the input element
	searchBar.addEventListener("input", function () {
		updateSearchList();
	});
}


function createContentItem(title, link, isExpandable, depthLevel) {
	let contentItem = LINK_TEMPLATE.content.cloneNode(true);
	contentItem.querySelector('.content-text').innerText = title;
	contentItem.querySelector('.content-link').setAttribute("href", link);
	contentItem.querySelector('.content-link').addEventListener('click', event => {
		openTab(event, event.target.parentElement.href);
	});
	if (!isExpandable) {
		contentItem.querySelector('.content-expand').remove();
	}
	contentItem.querySelector("li").style.paddingLeft = parseFloat(depthLevel * 1.5) + "rem";
	return contentItem
}

function makeExpandable(contentItem, index) {
	contentItem.querySelector(".content-expand").addEventListener("click", event => {
		focusedItemIndicies.push(index);
		loadContentsList();
	});
	contentItem.querySelector("i").className = "fa-solid fa-circle-plus"
	return contentItem;
}

function makeCollapsable(contentItem, depth) {
	contentItem.querySelector(".content-expand").addEventListener("click", event => {
		while (focusedItemIndicies.length > depth) {
			focusedItemIndicies.pop();
		}
		loadContentsList();
	});
	contentItem.querySelector("i").className = "fa-solid fa-circle-minus"
	return contentItem;
}

function clearContentsList() {
	while (CONTENT_LIST.firstChild) {
		CONTENT_LIST.removeChild(CONTENT_LIST.firstChild);
	}
}

function loadContentsList() {
	clearContentsList();
	let childrenToDisplay = currentContentList;
	let indexString = "";
	for (let i = 0; i < focusedItemIndicies.length; i++) {
		indexString += parseInt(focusedItemIndicies[i]) + "."
		let content = childrenToDisplay[focusedItemIndicies[i]];
		let title = content["title"];
		if (useNumbering()) {
			title = indexString + " " + title;
		}
		let contentItem = createContentItem(
			title,
			content["link"],
			content["children"].length > 0,
			i
		);
		contentItem = makeCollapsable(contentItem, i);
		CONTENT_LIST.appendChild(contentItem);
		childrenToDisplay = childrenToDisplay[focusedItemIndicies[i]]["children"];
	}

	for (let i = 0; i < childrenToDisplay.length; i++) {
		let content = childrenToDisplay[i];
		let isExpandable = content["children"].length > 0
		let title = content["title"];
		if (useNumbering()) {
			title = indexString + parseInt(i) + ". " + title;
		}
		let contentItem = createContentItem(
			title,
			content["link"],
			isExpandable,
			focusedItemIndicies.length
		);
		if (isExpandable) {
			contentItem = makeExpandable(contentItem, i);
		}

		CONTENT_LIST.appendChild(contentItem);
	}
}

// load everything
loadOptions()
// loadResourceLinks()
loadContentsList();
setTimeout(loadContentsList, 500); // 😭, to fix css height calculation
