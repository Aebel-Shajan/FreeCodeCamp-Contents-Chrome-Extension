from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
import time
import json


def element_exists(base_element, by_blank, text):
    try:
        base_element.find_element(by_blank, text)
        return True
    except NoSuchElementException:
        return False


def extract_link(element):
    return {
        "title": element.get_attribute("innerText"),
        "link": element.get_attribute("href"),
        "children": [],
    }


def scrape_sidebar(content_data, driver):
    sidebar = driver.find_elements(By.CSS_SELECTOR, ".w3-sidebar > div > div > *")
    for i, element in enumerate(sidebar):
        if element.tag_name == "h2":
            item = {
                "title": element.get_attribute("innerText"),
                "link": sidebar[i + 1].get_attribute("href"),
                "children": [],
            }
            content_data["children"].append(item)
        elif element.tag_name == "a":
            content_data["children"][-1]["children"].append(extract_link(element))
    return content_data


if __name__ == "__main__":
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    base_link = "https://www.w3schools.com/"
    driver.get(base_link)
    contents = []
    time.sleep(2)  # may need to change this based on how good your internet is

    topnav_len = len(driver.find_elements(By.CSS_SELECTOR, "#subtopnav > .ga-nav"))
    content_filter = ["html", "css", "javascript", "react", "python", "git"]
    for i in range(topnav_len):
        driver.get(base_link)
        topnav = driver.find_elements(By.CSS_SELECTOR, "#subtopnav > .ga-nav")
        subject = topnav[i]
        if subject.get_attribute("innerText").lower() in content_filter:
            item = extract_link(subject)
            driver.get(subject.get_attribute("href"))
            item = scrape_sidebar(item, driver)
            contents.append(item)

    driver.quit()

    with open("data/w3schools_contents.json", "w") as file:
        json.dump(contents, file, indent=2)
