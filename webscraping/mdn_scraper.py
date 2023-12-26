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
    fcc_link = "https://developer.mozilla.org/en-US/docs/Learn"
    driver.get(fcc_link)
    time.sleep(2)  # may need to change this based on how good your internet is

    sidebar = driver.find_elements(By.CSS_SELECTOR, ".sidebar-body > ol > li")

    for item in sidebar:
        # Check if a direct child link exists
        if element_exists(item, By.CSS_SELECTOR, ":scope > a"):
            print(item.get_attribute("innerText"))

    driver.quit()