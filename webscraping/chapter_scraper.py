from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time
import json

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

url = "https://www.freecodecamp.org/learn/front-end-development-libraries/"
driver.get(url)
time.sleep(1)

chapters = [] 
"""
chapter title:
chapter link:
lessons: [
  lesson title:
  lesson link:
]
"""

blocks = driver.find_elements(By.CLASS_NAME, "block")


def remove_spans(element):
  output = element.text.strip()
  spans = element.find_elements(By.CLASS_NAME, "sr-only")
  for span in spans:
    output = output.replace(span.text, '')
  output = output.replace("\n", "")
  return output

for block in blocks:
  big_block_title = block.find_elements(By.CLASS_NAME, "big-block-title")
  block_grid_title = block.find_elements(By.CLASS_NAME, "block-grid-title")
  
  if (block_grid_title):
    clickable_div = block_grid_title[0].find_elements(By.CLASS_NAME, "block-header")
    if (clickable_div):
      chapter_title = remove_spans(clickable_div[0])
      chapter_link = url + "#" + chapter_title.lower().replace(" ", "-")
      chapters.append({
        "chapter title": chapter_title,
        "chapter link": chapter_link,
        "lessons": []
        })
      
  elif (big_block_title):
    chapter_title = big_block_title[0].text
    chapter_link = url + "#" + chapter_title.lower().replace(" ", "-")
    
    expand_button = block.find_elements(By.CLASS_NAME, "map-title")
    if (expand_button):
      if expand_button[0].get_attribute('aria-expanded') == 'false':
        expand_button[0].click()
    
    lessons = []
    lesson_list = block.find_elements(By.CLASS_NAME, "map-challenges-ul")
    if (lesson_list):
      for lesson in lesson_list[0].find_elements(By.TAG_NAME, 'a'):
        lesson_name = remove_spans(lesson)
        lesson_link = lesson.get_attribute("href")
        if lesson_link:
          lessons.append({
            "lesson name": lesson_name,
            "lesson link": lesson_link
            })
        
    chapters.append({
      "chapter title": chapter_title,
      "chapter link": chapter_link,
      "lessons": lessons
      })
    
    
    
      
      

driver.quit()

with open('chapters.json', 'w') as file:
    json.dump(chapters, file, indent=2)
