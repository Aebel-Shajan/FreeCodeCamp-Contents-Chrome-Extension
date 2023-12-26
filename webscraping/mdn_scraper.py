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


if __name__ == "__main__":
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    base_link = "https://developer.mozilla.org/en-US/docs/Learn"
    driver.get(base_link)
    contents = []
    time.sleep(2)  # may need to change this based on how good your internet is

    sidebar = driver.find_elements(By.CSS_SELECTOR, ".sidebar-body > ol > li")

    for element in sidebar:
        # Check if a direct child link exists
        if element_exists(element, By.CSS_SELECTOR, ":scope > a"):
          newElement = element.find_element(By.CSS_SELECTOR, ":scope > a")
          item = {
						"title": newElement.get_attribute("innerText"),
						"link": newElement.get_attribute("href"),
						"children": []
					}
          contents.append(item)
        
        if element_exists(element, By.CSS_SELECTOR, ":scope > details") & element_exists(element, By.CSS_SELECTOR, ":scope > details > ol"):
          newElement = element.find_element(By.CSS_SELECTOR, ":scope > details")
          child_elements = newElement.find_elements(By.TAG_NAME, "a")
          item = {
						"title": newElement.find_element(By.TAG_NAME, "summary").get_attribute("innerText"),
						"link": child_elements[0].get_attribute("href"),
						"children": []
					}
          for child_element in child_elements:
            child_item = {
							"title": child_element.get_attribute("innerHTML"),
							"link": child_element.get_attribute("href"),
							"children": []
						}
            item["children"].append(child_item)
          contents[-1]["children"].append(item)
        
    driver.quit()
    
    with open("data/mdn_contents.json", 'w') as file:
    	json.dump(contents, file, indent=2)