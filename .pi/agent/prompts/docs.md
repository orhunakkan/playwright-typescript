DO NOT use web search. DO NOT use your training knowledge.

You MUST run this bash command right now:
grep -r -i "$1" ./docs/ -l

Then read EVERY file listed in the output using the read tool.
Only after reading those files, answer the question.

If grep returns no results, tell the user: "No docs found for: $1"
