import curriculum from './webscraping/curriculum.json' assert { type: 'json' };

let contentList = document.body.querySelector("#contents-list");
let linkTemplate = document.body.querySelector("#link-template");
let groupId = null;


console.log(curriculum);
console.log(groupId);

for (let course of curriculum) {
	let link = linkTemplate.content.cloneNode(true);

	link.querySelector('.contents-item').innerText = course["course title"];
	link.querySelector('.contents-link').setAttribute("href", course["course link"]);
	link.querySelector('.contents-link').addEventListener('click', openInTabGroup)
	contentList.appendChild(link);
}

function openInTabGroup(event) {
	event.preventDefault();
	chrome.tabGroups.query({title: "FCC Research"}, function(groups) {
		if (groups.length > 0) {
				groupId = groups[0].id;
		} else {
			groupId = null;
		}
	});
	console.log(event.target.href)
	chrome.tabs.create({url: event.target.parentElement.href}, function(tab) {
			if (groupId === null) {
					chrome.tabs.group({tabIds: tab.id}, function(newGroupId) {
							groupId = newGroupId;
							chrome.tabGroups.update(groupId, {title: "FCC Research", color: "blue"})
					});
			} else {
					chrome.tabs.group({groupId: groupId, tabIds: tab.id});
			}
	});
}