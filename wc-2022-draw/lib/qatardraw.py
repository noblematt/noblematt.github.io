#! /usr/bin/env python

import random
from collections import defaultdict
from itertools import permutations, count

# Countries within each pot are represented by their confederation to reduce the
# number of permutations; if two countries in the same pot are from the same
# confederation, their probabilities will be identical for any given event
# Letters map onto confederations as follows:
#  - A: Asia
#  - E: Europe
#  - F: Africa
#  - N: North America
#  - P: Playoff between Asia and South America
#  - S: South America
# Note that Oceania is not represented here. While they have a playoff with
# North America, we can represent this with N as there is no other team from
# Oceania and so it can only clash with North America
POT_DEFINITIONS = (
    ('EEEEESS', 'A'),
    ('EEEEENNS', ),
    ('AAAEEFFF', ),
    ('AEFFNNPS', ),
)

def main():
    # Pass in a different extractor function here to get probabilities for a
    # different set of events
    monte_carlo(extract_pot_confederations)

def monte_carlo(extract, display_interval=1000, already_drawn=''):
    '''
    Run a Monte Carlo simulation
    Uses the given `extract` function to extract events from each iteration
    Prints the number of iterations, and the probability of each event, after
    every n iterations, where n is the value of `display_interval`
    '''
    counts = defaultdict(int)
    for i in count(1):
        draw_order = ''.join(
            ''.join(random_draw(*pot)) for pot in POT_DEFINITIONS
        )
        draw_order = already_drawn + draw_order[len(already_drawn):]
        groups = ''.join(draw_pot(draw_order))
        for key in extract(groups):
            counts[key] += 1

        if i % display_interval == 0:
            print(i, *sorted(
                '%s:%f' % (key, n / i)
                for key, n in counts.items()
            ))

def random_draw(pot, prefix=''):
    for c in prefix:
        yield c
    pot = list(pot)
    while pot:
        yield pot.pop(random.randint(0, len(pot) - 1))

def pot_permutations(pot, prefix=''):
    '''
    Generate the permutations for the given pot
    The optional `prefix` is used to define a team or teams which are already
    known to be at the start of the sequence
    '''
    return tuple(
        prefix + string
        for string in sorted(set(
            ''.join(perm)
            for perm in permutations(pot)
        ))
    )

def draw_pot(pot, groups=('', '', '', '', '', '', '', '')):
    '''
    Generate the state of the groups given teams coming out of the pot in the
    sequence defined by `pot`
    If the given sequence of teams cannot legally be placed, returns None
    '''
    # If no teams are left in the pot, we are finished
    if not pot:
        return groups

    # Establish the size of an available group, and the number of teams from the
    # next team's confederation that are allowed in a group
    min_group_len = min(map(len, groups))
    team = pot[0]
    max_double_europes_reached = 5 == sum(
        sum(c == 'E' for c in g) == 2
        for g in groups
    )
    max_count = 2 if (team == 'E' and not max_double_europes_reached) else 1

    # Iterate over the groups, placing the team in the first legal group
    for i, group in enumerate(groups):

        # If the group is larger than the smallest, it already has a team from this pot
        if len(group) > min_group_len:
            continue

        # If the group already has the maximum number of teams from this confederation, move on
        if sum(c == team or (c in 'AS' and team == 'P') for c in group) >= max_count:
            continue

        # Construct the new groups and call this function with the remaining teams
        new_groups = tuple(
            g if i != j else g + team
            for j, g in enumerate(groups)
        )
        result = draw_pot(pot[1:], new_groups)

        # If we can successfully assign the remaining teams, return the result
        if result:
            return result

def extract_pot_confederations(groups):
    '''
    From each pot, extract the confederation which is drawn into the same group
    as the UEFA team in pot 4
    '''
    pot4_uefa_index = next(
        i for i in range(3, len(groups), 4)
        if groups[i] == 'E'
    )
    for pot in range(3):
        yield str(pot + 1) + groups[pot4_uefa_index - 3 + pot]

def extract_first_three_confederations(groups):
    '''
    Extract the confederations from the first three pots, which are drawn into
    the same group as the UEFA team in pot 4
    '''
    pot4_uefa_index = next(
        i for i in range(3, len(groups), 4)
        if groups[i] == 'E'
    )
    yield groups[pot4_uefa_index-3:pot4_uefa_index]

def extract_group(groups):
    pot4_uefa_index = next(
        i for i in range(3, len(groups), 4)
        if groups[i] == 'E'
    )
    yield 'ABCDEFGH'[pot4_uefa_index // 4]

def extract_group_and_third_pot_team(groups):
    pot4_uefa_index = next(
        i for i in range(3, len(groups), 4)
        if groups[i] == 'E'
    )
    yield 'ABCDEFGH'[pot4_uefa_index // 4] + groups[pot4_uefa_index - 1]

if __name__ == '__main__':
    main()
