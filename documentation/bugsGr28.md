# A problem with tiebreakers in Preliminaries

When three contestants have equal points in the preliminaries, 2 tie-breaker matches
are created, but both those have only one contestant making it impossible to move on
with the tournament.

# Match clock does not always stop when reaching the specified limit

If the GameInterface user leaves the page, and the match clock is ticking,
(and the user is responsible for the clock), the clock does not stop automatically, when
reaching the specified limit (eg. 3 minutes). This will cause additional problems for the
progress of the ongoing tournament.

# The view sometimes breaks

The view might break occassionally, at least if the user has not been signed in.
Might be a performance related issue in development. It is not known if this bug
still persists in production, as the code is optimized then.

# Changing the lenght of a match

It is currently not possible to change the lenght of match before the tournament has started.

# Problems with password recovery

The application should send an email for password recovery, but it does not work.