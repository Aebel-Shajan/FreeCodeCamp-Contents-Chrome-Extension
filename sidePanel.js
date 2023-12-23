import curriculum from './webscraping/curriculum.json' assert { type: 'json' };

let contentList = document.body.querySelector("#contents-list");
let linkTemplate = document.body.querySelector("#link-template");
console.log(curriculum)

for (let course of curriculum) {
	let link = linkTemplate.content.cloneNode(true);
	link.querySelector('.contents-link').setAttribute("href", course["course link"]);
	link.querySelector('.contents-item').innerText = course["course title"];
	contentList.appendChild(link);
}