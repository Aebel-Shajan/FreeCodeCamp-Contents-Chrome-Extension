from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import time
import json
from urllib.parse import urlparse

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
data = []
with open("resources.json", "r") as file:
  data = json.load(file)
  for i, resource in enumerate(data):
    driver.get(resource["link"])
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    icon_link = soup.find("link", rel="shortcut icon")
    if icon_link is None:
        icon_link = soup.find("link", rel="icon")
    if icon_link is not None:
      link = icon_link["href"]
      if link[0] == "/":
        parsed_url = urlparse(resource["link"])
        base_url = '{uri.scheme}://{uri.netloc}'.format(uri=parsed_url)
        link = base_url + link
      resource["icon link"] = link
      data[i] = resource
  
if len(data) > 0:
  with open("data/resources.json", "w") as file:
    json.dump(data, file, indent=2)