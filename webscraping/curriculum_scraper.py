from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time
import json

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

url = 'https://www.freecodecamp.org/learn'
driver.get(url)
time.sleep(1)

courses = []
elements = driver.find_element(By.CLASS_NAME, 'map-ui').find_elements(By.TAG_NAME, 'a')

for element in elements:
    title = element.text.strip()
    href = element.get_attribute('href')
    if href:
        courses.append({"course title": title, "course link": href})

driver.quit()

with open('courses.json', 'w') as file:
    json.dump(courses, file, indent=2)