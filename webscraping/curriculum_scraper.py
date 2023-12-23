from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time
import json

def scrape_courses(course_map):
  courses = []
  for element in course_map:
      title = element.text.strip()
      href = element.get_attribute('href')
      if href:
          courses.append({"course title": title, "course link": href})
  return courses

def scrape_chapters(chapter_blocks, url):
  chapters = []
  if not chapter_blocks:
    print("Did not scrape: " + url)
    
  for block in chapter_blocks:
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
      chapters.append({
        "chapter title": chapter_title,
        "chapter link": chapter_link,
        "lessons": scrape_lessons(block)
        })    
  return chapters
  
def scrape_lessons(block):
  expand_button = block.find_elements(By.CLASS_NAME, "map-title")
  if (expand_button):
    if expand_button[0].get_attribute('aria-expanded') == 'false':
      expand_button[0].click()
  lessons = []
  lesson_list = block.find_elements(By.CLASS_NAME, "map-challenges-ul")
  if (lesson_list):
    for lesson in lesson_list[0].find_elements(By.TAG_NAME, 'a'):
      lesson_title = remove_spans(lesson)
      lesson_link = lesson.get_attribute("href")
      if lesson_link:
        lessons.append({
          "lesson title": lesson_title,
          "lesson link": lesson_link
          })
  return lessons

def remove_spans(element):
  output = element.text.strip()
  spans = element.find_elements(By.CLASS_NAME, "sr-only")
  for span in spans:
    output = output.replace(span.text, '')
  output = output.replace("\n", "")
  return output

if __name__ == "__main__":
  driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
  fcc_link = "https://www.freecodecamp.org/learn"
  driver.get(fcc_link)
  time.sleep(2) # may need to change this based on how good your internet is
  
  course_map = driver.find_element(By.CLASS_NAME, 'map-ui').find_elements(By.TAG_NAME, 'a')
  courses = scrape_courses(course_map)
  for i, course in enumerate(courses):
    driver.get(course["course link"])
    time.sleep(3)
    chapter_blocks = driver.find_elements(By.CLASS_NAME, "block")
    course["chapters"] = scrape_chapters(chapter_blocks, course["course link"])
    courses[i] = course
  
  driver.quit()
  
  with open("curriculum.json", 'w') as file:
    json.dump(courses, file, indent=2)