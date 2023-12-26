function openInTabGroup(urlToOpen) {
	// Search if tab group already exists
	chrome.tabGroups.query({ title: "FCC Research" }, function (groups) {
		if (groups.length > 0) {
			groupId = groups[0].id;
		} else {
			groupId = null;
		}
	});
	// Create new tab
	chrome.tabs.create({ url: urlToOpen, active: true }, function (tab) {
		// If tab group doesnt exist then create new group.
		if (groupId === null) {
			chrome.tabs.group({ tabIds: tab.id }, function (newGroupId) {
				groupId = newGroupId;
				chrome.tabGroups.update(groupId, { title: "FCC Research", color: "red", collapsed: false })
			});
			chrome.tabs.move(tab.id, { index: 0 });
		// Otherwise put the tab in the existing group
		} else {
			let url = new URL(urlToOpen);
			let baseUrl = url.protocol + '//' + url.host + '/*';
			// Check if any of the tabs in the existing group have the same website open
			chrome.tabs.query({ groupId: groupId, url: baseUrl }, function (sameUrlTabs) {
				if (sameUrlTabs.length > 0) {
					// Cancel creation of new tab and instead update existing tab
					chrome.tabs.remove(tab.id);
					chrome.tabs.update(sameUrlTabs[0].id, { url: urlToOpen, active: true })
				} else {
					chrome.tabs.group({ groupId: groupId, tabIds: tab.id });
				};
			})
			chrome.tabGroups.update(groupId, { collapsed: false });
		}
	});
}

function openTab(event, urlToOpen) {
	event.preventDefault();
	const openInGroup = document.querySelector(".tab-group-toggle").id;
	if (openInGroup === "on") {
		openInTabGroup(urlToOpen)
	} else if (openInGroup === "off") {
		chrome.tabs.update(undefined, {url: urlToOpen});
	}
}

export default openTab;