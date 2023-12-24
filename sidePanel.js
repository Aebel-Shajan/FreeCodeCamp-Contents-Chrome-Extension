import curriculum from './webscraping/curriculum.json' assert { type: 'json' };

let contentList = document.body.querySelector("#contents-list");
let linkTemplate = document.body.querySelector("#link-template");
let groupId = null;
let curriculumLevel = "full curriculum";
let focusedCourse = curriculum[0];
let focusedChapter = focusedCourse["chapters"][0];


function updateSidePanel() {
	// Clear everything in the contents list
	while (contentList.firstChild) {
		contentList.removeChild(contentList.firstChild);
	}

	// Create content items for focused chapter and course
	let courseIndex = curriculum.indexOf(focusedCourse);
	let chapterIndex = focusedCourse["chapters"].indexOf(focusedChapter);
	let focusedCourseItem = createContentItem(
		[courseIndex, " "+focusedCourse["course title"]].join("."),
		focusedCourse["course link"]
	);
	let focusedChapterItem = createContentItem(
		[courseIndex, chapterIndex, " "+focusedChapter["chapter title"]].join("."),
		focusedChapter["chapter link"]
	);
	focusedCourseItem.querySelector('.fa-solid').className = "fa-solid fa-circle-minus";
	focusedChapterItem.querySelector('.fa-solid').className = "fa-solid fa-circle-minus";
	focusedCourseItem.querySelector('.content-expand').addEventListener('click', () => {
		curriculumLevel = "full curriculum";
		updateSidePanel();
	})
	focusedChapterItem.querySelector('.content-expand').addEventListener('click', () => {
		curriculumLevel = "course";
		updateSidePanel();
	})
	focusedChapterItem.querySelector("li").style.paddingLeft = "1.5rem";

	document.querySelector("#title-container").addEventListener('click', () => {
		curriculumLevel = "full curriculum";
		updateSidePanel();
	})

	// Add new content based on how deep you in
	switch (curriculumLevel) {
		case "chapter":
			contentList.appendChild(focusedCourseItem);
			contentList.appendChild(focusedChapterItem);
			for (let i = 0; i < focusedChapter["lessons"].length; i++) {
				let lesson = focusedChapter["lessons"][i];
				let lessonItem = createContentItem(
					[courseIndex, chapterIndex, i, " "+lesson["lesson title"]].join("."),
					lesson["lesson link"]
				);
				lessonItem.querySelector("li").style.paddingLeft = "3.0rem";
				lessonItem.querySelector('.content-expand').remove()
				contentList.appendChild(lessonItem);
			}
			break;

		case "course":
			contentList.appendChild(focusedCourseItem);
			for (let i = 0; i < focusedCourse["chapters"].length; i++) {
				let chapter = focusedCourse["chapters"][i];
				let chapterItem = createContentItem(
					[courseIndex, i, " "+chapter["chapter title"]].join("."),
					chapter["chapter link"]
				);
				chapterItem.querySelector("li").style.paddingLeft = "1.5rem";
				if (chapter["lessons"].length > 0) {
					chapterItem.querySelector('.content-expand').addEventListener('click', (event) => {
						curriculumLevel = "chapter";
						focusedChapter = chapter;
						updateSidePanel();
					})
				} else {
					chapterItem.querySelector('.content-expand').remove()
				}
				contentList.appendChild(chapterItem);
			}
			break;

		default:
			for (let i = 0; i < curriculum.length; i++) {
				let course = curriculum[i];
				let courseItem = createContentItem(
					[i, " "+course["course title"]].join("."),
					course["course link"]
				);
				courseItem.querySelector('.content-expand').addEventListener('click', (event) => {
					curriculumLevel = "course";
					focusedCourse = course;
					updateSidePanel();
				})
				contentList.appendChild(courseItem);
			}
			break;
	}
}

// Call the function to initially populate the side panel
updateSidePanel();

function openInTabGroup(event) {
	event.preventDefault();
	chrome.tabGroups.query({ title: "FCC Research" }, function (groups) {
		if (groups.length > 0) {
			groupId = groups[0].id;
		} else {
			groupId = null;
		}
	});
	console.log(event.target.href)
	chrome.tabs.create({ url: event.target.parentElement.href, active: false }, function (tab) {
		if (groupId === null) {
			chrome.tabs.group({ tabIds: tab.id }, function (newGroupId) {
				groupId = newGroupId;
				chrome.tabGroups.update(groupId, { title: "FCC Research", color: "red" })
			});
			chrome.tabs.move(tab.id, { index: 0 });
		} else {
			chrome.tabs.group({ groupId: groupId, tabIds: tab.id });
		}
	});
}

function createContentItem(title, link) {
	let contentItem = linkTemplate.content.cloneNode(true);
	contentItem.querySelector('.content-text').innerText = title;
	contentItem.querySelector('.content-link').setAttribute("href", link);
	contentItem.querySelector('.content-link').addEventListener('click', openInTabGroup);
	return contentItem
}
