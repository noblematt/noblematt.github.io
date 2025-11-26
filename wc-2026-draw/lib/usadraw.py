#! /usr/bin/env python

from datetime import datetime, timedelta
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
#  - S: South America
#  - O: Oceania
#  - D: Scotland
#  - P: Playoff between Africa, Oceania and North America
#  - Q: Playoff between Asia, South America and North America
# Note that Oceania is not represented here. While they have a playoff with
# North America, we can represent this with N as there is no other team from
# Oceania and so it can only clash with North America
POT_DEFINITIONS = (
    ("EEEEEEESS", "NN?N"),
    ("EEEFFSSSAAAA",),
    ("AAAEDNFFFFFS",),
    ("EEEEAFFNNOPQ",),
)


def main():
    # Pass in a different extractor function here to get probabilities for a
    # different set of events
    monte_carlo(extract_group_and_teams)


def monte_carlo(extract, display_interval=1000, already_drawn=""):
    """
    Run a Monte Carlo simulation
    Uses the given `extract` function to extract events from each iteration
    Prints the number of iterations, and the probability of each event, after
    every n iterations, where n is the value of `display_interval`
    """
    counts = defaultdict(int)
    last = datetime.now()
    for i in count(1):
        now = datetime.now()
        if now - last > timedelta(seconds=1):
            print(f"{draw_order!r} took {(now - last).total_seconds()} seconds")
        last = now
        draw_order = "".join("".join(random_draw(*pot)) for pot in POT_DEFINITIONS)
        draw_order = already_drawn + draw_order[len(already_drawn) :]
        groups = "".join(draw_pot(draw_order))
        for key in extract(groups):
            counts[key] += 1

        if i % display_interval == 0:
            print(i, *sorted("%s:%f" % (key, n / i) for key, n in counts.items()))


def random_draw(pot, prefix=""):
    """
    Draw teams out of this pot randomly

    If a prefix is provided, draw teams from this first, taking a random team
    from the pot wherever a "?" is specified
    """
    pot = list(pot)
    for c in prefix:
        if c == "?":
            yield pot.pop(random.randint(0, len(pot) - 1))
        else:
            yield c

    while pot:
        yield pot.pop(random.randint(0, len(pot) - 1))


def pot_permutations(pot, prefix=""):
    """
    Generate the permutations for the given pot
    The optional `prefix` is used to define a team or teams which are already
    known to be at the start of the sequence
    """
    return tuple(
        string
        for string in sorted(set("".join(perm) for perm in permutations(pot)))
        if any(a in (b, "?") for a, b in zip(prefix, string))
    )


def draw_pot(pot, groups=("", "", "", "", "", "", "", "", "", "", "", "")):
    """
    Generate the state of the groups given teams coming out of the pot in the
    sequence defined by `pot`
    If the given sequence of teams cannot legally be placed, returns None
    """
    # If no teams are left in the pot, we are finished
    if not pot:
        return groups

    # Establish the size of an available group, and the number of teams from the
    # next team's confederation that are allowed in a group
    min_group_len = min(map(len, groups))
    team = pot[0]
    max_double_europes_reached = 4 == sum(
        sum(c in "DE" for c in g) == 2 for g in groups
    )
    max_count = 2 if (team in "DE" and not max_double_europes_reached) else 1

    # Iterate over the groups, placing the team in the first legal group
    for i, group in enumerate(groups):
        # If the group is larger than the smallest, it already has a team from this pot
        if len(group) > min_group_len:
            continue

        if len(group) == 3 and not any(c in group + team for c in "DE"):
            continue

        # If the group already has the maximum number of teams from this confederation, move on
        if sum(confederations_clash(c, team) for c in group) >= max_count:
            continue

        # Construct the new groups and call this function with the remaining teams
        new_groups = tuple(g if i != j else g + team for j, g in enumerate(groups))
        if groups_are_illegal(new_groups):
            continue

        result = draw_pot(pot[1:], new_groups)

        # If we can successfully assign the remaining teams, return the result
        if result:
            return result


def confederations_clash(a, b):
    """
    Return True iff a and b both represent teams from the same confederation
    (or if b represents an intercontinental playoff that contains a team from
    the confederation specified by a)
    """
    if a == b:
        return True
    if a in "FON" and b == "P":
        return True
    if a in "ASN" and b == "Q":
        return True
    if a in "DE" and b in "DE":
        return True

    return False


def groups_are_illegal(groups):
    """
    Return True iff some constraint has been broken that means the rest of the
    teams cannot legally be drawn
    """
    # Flag groups as illegal if there are no groups for either one of the
    # intercontinental playoff winners to enter, after pot 3
    if all(any(c in group[:3] for c in "NAS") for group in groups):
        return True
    if all(any(c in group[:3] for c in "NOF") for group in groups):
        return True

    # Flag groups as illegal if there are fewer than three remaining groups
    # with space for an African team; noting that if 3 pots are drawn and a
    # group has no European team, then an African team cannot be drawn there as
    # a European team is required in each group
    if all(len(g) == 3 for g in groups):
        african_allowed_count = sum(
            any(c in g for c in "DE") and not "F" in g for g in groups
        )
        if african_allowed_count < 3:
            return True

        # And the same for Asian teams
        asian_allowed_count = sum(
            any(c in g for c in "DE") and not "A" in g for g in groups
        )
        if asian_allowed_count < 2:
            return True

        # Ensure there is enough space for both of the above (in case of one
        # group counting for both)
        african_or_asian_allowed_count = sum(
            any(c in g for c in "DE") and not all(c in g for c in "AF") for g in groups
        )
        if african_or_asian_allowed_count < 5:
            return True

    return False


def extract_pot_confederations(groups):
    """
    From each pot, extract the confederation which is drawn into the same group
    as Scotland
    """
    pot3_scotland_index = next(i for i in range(2, len(groups), 4) if groups[i] == "D")
    for pot in (0, 1, 3):
        yield str(pot + 1) + groups[pot3_scotland_index - 2 + pot]


def extract_group_and_teams(groups):
    """
    Extract the confederations Scotland face from all three other pots
    """
    pot3_scotland_index = next(i for i in range(2, len(groups), 4) if groups[i] == "D")
    for pot in (0, 1, 3):
        yield str(pot + 1) + groups[pot3_scotland_index - 2 + pot]
    yield "ABCDEFGHIJKL"[pot3_scotland_index // 4]


def extract_group(groups):
    """Extract the group Scotland are drawn into"""
    pot3_scotland_index = next(i for i in range(2, len(groups), 4) if groups[i] == "D")
    yield "ABCDEFGHIJKL"[pot3_scotland_index // 4]


if __name__ == "__main__":
    main()
