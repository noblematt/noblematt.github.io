#! /usr/bin/env python3

import os
import json
import datetime
import bs4
import requests

URL = 'https://adventofcode.com/%d/leaderboard/day/%d'
FILENAME = os.path.join(os.path.dirname(__file__), 'data.js')
YEAR = 2021

def main():
    with open(FILENAME, 'r') as fin:
        data = json.loads(fin.read()[7:-2])

    next_day = len(data['daily-leaderboards']) + 1

    for day in range(len(data['daily-leaderboards']), datetime.date.today().day):
        response = requests.get(URL % (YEAR, day + 1))
        soup = bs4.BeautifulSoup(response.text, features='html.parser')
        entries = soup.find_all('div', class_='leaderboard-entry')

        leaderboards = []
        for i in (1, 0):
            leaderboard = []
            for entry in entries[i * 100:(i + 1) * 100]:
                leaderboard.append(entry.text[22:].replace(' (AoC++)', '').replace(' (Sponsor)', ''))
            leaderboards.append(leaderboard)

        data['daily-leaderboards'].append(leaderboards)

    with open(FILENAME, 'w') as fin:
        fin.write('DATA = ' + json.dumps(data, indent=4) + ';\n')


if __name__ == '__main__':
    main()
