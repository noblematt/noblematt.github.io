#! /usr/bin/env python3

'''
Generate animated SVG world map showing the timeline of countries qualifying /
being eliminated from the 2022 FIFA Men's World Cup

This is based on the revision history of the SVG image at
https://commons.wikimedia.org/wiki/File:2022_world_cup_qualification.svg

This tool makes certain assumptions about the format of the SVG files found at
the wikimedia URL. If that format changes and these assumptions no longer hold,
this tool may not work correctly.
'''

import argparse
import requests
import bs4

# Assumption: there will not be more than 500 revisions of the file
FILE_URL = (
    'https://commons.wikimedia.org/w/index.php' +
    '?title=File:2022_world_cup_qualification.svg&limit=500'
)

# Assumption: The colour codes will not change
COLOUR_CODES = {
    'eliminated': '#FFCC00',
    'qualified': '#0000FF',
}
NOT_YET_QUALIFIED_COLOUR = '#2FC0FF'

XLINK_XMLNS = 'xmlns:xlink="http://www.w3.org/1999/xlink"'

SCRIPT_HEADER = '''
<style>text {font-size:25px}</style>
<a xlink:href="./animate_world_cup_qualification_map.py" target="_blank">
    <text x="10" y="1000">Generated using python script</text>
</a>
<a xlink:href="https://commons.wikimedia.org/wiki/File:2022_world_cup_qualification.svg" target="_blank">
    <text x="10" y="1030">Based on image by 4hrue2kd83f, CC0, via Wikimedia Commons</text>
</a>

<script>
//<![CDATA[
    function start_animation() {
'''

CHANGE_COUNTRY_COLOUR_SCRIPT = '''
        window.setTimeout(
            function() {document.styleSheets[0].addRule(".COUNTRY", "fill:COLOUR");},
            TIMEOUT
        );
'''

SCRIPT_FOOTER = '''

        window.setTimeout(
            function() {
                for(var i=0; i<N_RULES; i++) {
                    document.styleSheets[0].removeRule(document.styleSheets[0].rules.length - 1);
                }
                start_animation();
            },
            TIMEOUT
        );

    }

    start_animation();
//]]>
</script>
</svg>
'''

# These country codes changed between the first revision and the countries
# being eliminated
NAME_TRANSFORMS = {
    'kosovo': 'xk',
    'northernireland': 'nireland',
}

def main():
    '''Retrieve revisions, build animation and write animated SVG to stdout'''

    headers = build_http_headers()
    version_urls = retrieve_version_urls(headers)

    states = [
        extract_qualified_eliminated(url, headers)
        for url in version_urls
    ]

    print(build_animated_svg(version_urls[0], states, headers))

def build_http_headers():
    '''
        Build User-Agent to include in http headers for requests to wikimedia
        app_name and email_address for API provided as command-line arguments
        Refer to https://api.wikimedia.org/wiki/Main_Page for more information
    '''
    parser = argparse.ArgumentParser()
    parser.add_argument('app_name')
    parser.add_argument('email_address')

    args = parser.parse_args()
    return {
        'User-Agent': f'{args.app_name} ({args.email_address})'
    }

def retrieve_version_urls(headers):
    '''
        Retrieve version URLs

        wikimedia does not (currently) provide an API endpoint to retrieve
        version history for images, so we need to request the web page and
        scrape the HTML to find the version URLs
    '''

    # Assumption: the format of this HTML will not change
    response = requests.get(FILE_URL, headers=headers)
    doc = bs4.BeautifulSoup(response.text, features='html.parser')
    table = doc.find('table', class_='filehistory')

    return [
        row.find('a').get('href')
        for row in table.find_all('tr')[-1:0:-1]
    ]

def build_animated_svg(url, states, headers):
    '''
        Build an animated SVG
        Use the image at the given URL as a base
        Add a script to update the fill colour of countries based on the diff
        from one state to the next
    '''
    response = requests.get(url, headers=headers)
    document = amend_root_tag(response.text).replace('</svg>', SCRIPT_HEADER)
    # DOS format is silly
    document = document.replace('\r\n', '\n')

    i = 0
    n_rules = 0
    remove_mistakes_and_duplicates(states)
    for i, (old, new) in enumerate(zip(states, states[1:]), 1):
        script = CHANGE_COUNTRY_COLOUR_SCRIPT.replace('TIMEOUT', str(i * 500))
        for key in old.keys():

            # new - old to find the countries which have newly qualified/been eliminated
            for country in new.__getitem__(key) - old.__getitem__(key):
                document += script.replace('COUNTRY', country).replace('COLOUR', COLOUR_CODES[key])
                n_rules += 1

    return (
        document +
        SCRIPT_FOOTER.replace('TIMEOUT', str((i + 5) * 500)).replace('N_RULES', str(n_rules))
    )

def amend_root_tag(document):
    '''
        Remove the width and height attributes from the document root tag
        Add xlink xmlns definition
    '''
    for attribute in ('width', 'height'):
        index = document.index(attribute)
        start = index
        while document[index] not in ' >':
            index += 1
        document = document[:start] + document[index:]
    return document[:start] + XLINK_XMLNS + document[start:]

def remove_mistakes_and_duplicates(states):
    '''
        Remove countries from qualified/eliminated states if they are not
        present in a later state (as this will always be a mistake)
        Remove states which are identical to those that follow
    '''
    for i in range(len(states) - 1, 0, -1):
        new = states[i]
        old = states[i-1]
        for key in old.keys():
            old[key] -= (old[key] - new[key])
        if new == old:
            del[states[i]]
        i -= 1

def extract_qualified_eliminated(url, headers):
    '''
        Extract the sets of countries qualified and eliminated from the image
        at the given URL
    '''
    response = requests.get(url, headers=headers)
    style = bs4.BeautifulSoup(response.text, features='html.parser').find('style').text
    return {
        key: get_countries(style, colour)
        for key, colour in COLOUR_CODES.items()
    }

def get_countries(style, colour):
    '''
        Extract the set of countries in the selector for the rule which contains
        the given colour
        Note that this picks only the first such rule; we assume that all the
        countries will continue to be listed in a single rule
    '''
    index = style.index(colour)

    while style[index] != '{':
        index -= 1
    end = index

    while style[index] not in '}/':
        index -= 1
    start = index + 1

    return {
        proper_country_name(e.strip()[1:])
        for e in style[start:end].strip().split(',')
    }

def proper_country_name(name):
    '''
        Map the given name to the value specified in NAME_TRANSFORMS, or return
        it unchanged if it is not defined there
    '''
    return NAME_TRANSFORMS.get(name, name)

if __name__ == '__main__':
    main()
