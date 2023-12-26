import curriculum from './webscraping/curriculum.json' assert { type: 'json' };
import resources from './webscraping/resources.json' assert {type: 'json'};
import openTab from "./newTabLogic.js";

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
			})
		})
	})
}

const CONTENT_LIST = document.body.querySelector("#contents-list");
const LINK_TEMPLATE = document.body.querySelector("#link-template");
let focusedItemIndicies = [];

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

function expandContentItem(index) {
	focusedItemIndicies.push(index);
	loadContentsList();
}

function collapseContentItem(depth) {
	while (focusedItemIndicies.length > depth) {
		focusedItemIndicies.pop();
	}
	loadContentsList();
}

function getElementHeight(selector) {
	return window.getComputedStyle(document.querySelector(selector)).height;
}

function loadContentsList() {
	let contentsContainer = document.querySelector("#contents-container");
	contentsContainer.style.height = "calc( 100%" + " - (" + 
		getElementHeight("#title-container") + " + " +
		getElementHeight("#options-container") + " + " +
		getElementHeight("#resource-container") + ") )";
	while (CONTENT_LIST.firstChild) {
		CONTENT_LIST.removeChild(CONTENT_LIST.firstChild);
	}

	let childrenToDisplay = curriculum;
	let indexString = "";
	for (let i = 0; i < focusedItemIndicies.length; i++) {
		indexString += parseInt(focusedItemIndicies[i]) + "."
		let content = childrenToDisplay[focusedItemIndicies[i]];
		let contentItem = createContentItem(
			indexString + " " + content["title"],
			content["link"],
			content["children"].length > 0,
			i
		);
		contentItem.querySelector(".content-expand").addEventListener("click", event => {
			collapseContentItem(i);
		});
		CONTENT_LIST.appendChild(contentItem);
		childrenToDisplay = childrenToDisplay[focusedItemIndicies[i]]["children"];
	}

	for (let i = 0; i < childrenToDisplay.length; i++) {
		let content = childrenToDisplay[i];
		let isExpandable = content["children"].length > 0
		let contentItem = createContentItem(
			indexString + parseInt(i) + ". " + content["title"],
			content["link"],
			isExpandable,
			focusedItemIndicies.length
		);
		if (isExpandable) {
			contentItem.querySelector(".content-expand").addEventListener("click", event => {
				expandContentItem(i);
			});
		}
		CONTENT_LIST.appendChild(contentItem);
	}
}

// load everything
loadOptions()
loadResourceLinks()
loadContentsList();
setTimeout(loadContentsList, 500); // 😭
