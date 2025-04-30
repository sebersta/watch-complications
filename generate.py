import requests
import json

# URL for the live Waitz data
url = "https://www.waitz.io/live/ucsb"

# Fetch the data
response = requests.get(url)
data = response.json()

# Find the "1st Floor Ocean" sub-location
target = None
for loc in data["data"]:
    for subloc in loc.get("subLocs", []):
        if subloc["name"] == "1st Floor Ocean":
            target = subloc
            break

# Abort if not found
if not target:
    raise ValueError("1st Floor Ocean not found")

# Extract values
people = target["people"]
capacity = target["capacity"]
percentage = target["percentage"] * 100
name = target["name"]

# Construct output JSON
output = {
    "name": name,
    "showOnLockScreen": True,
    "views": [
        {
            "type": "text",
            "body": f"Status: Not Busy\n{people} People\nCapacity: {capacity}"
        },
        {
            "type": "text",
            "body": f"Filled: {int(percentage)}%\nOpen Now\nLocation: UCSB Library"
        }
    ],
    "families": [
        {
            "family": "graphicCircular",
            "class": "CLKComplicationTemplateGraphicCircularStackText",
            "line1": "1st Flr",
            "line2": f"{int(percentage)}%"
        },
        {
            "family": "circularSmall",
            "class": "CLKComplicationTemplateCircularSmallStackText",
            "line1": "Ocean",
            "line2": f"{int(percentage)}%"
        },
        {
            "family": "modularSmall",
            "class": "CLKComplicationTemplateModularSmallStackText",
            "line1": "People",
            "line2": str(people)
        },
        {
            "family": "modularLarge",
            "class": "CLKComplicationTemplateModularLargeStandardBody",
            "header": name,
            "body1": f"People: {people}",
            "body2": f"Cap: {capacity} ({int(percentage)}%)"
        },
        {
            "family": "graphicCorner",
            "class": "CLKComplicationTemplateGraphicCornerStackText",
            "innerText": f"{people} People",
            "outerText": "Ocean Floor"
        },
        {
            "family": "graphicBezel",
            "class": "CLKComplicationTemplateGraphicBezelCircularText",
            "line1": "Ocean",
            "line2": f"{int(percentage)}%",
            "text": "1st Floor"
        },
        {
            "family": "utilitarianSmall",
            "class": "CLKComplicationTemplateUtilitarianSmallFlat",
            "text": f"Ocean {int(percentage)}%"
        },
        {
            "family": "utilitarianLarge",
            "class": "CLKComplicationTemplateUtilitarianLargeFlat",
            "text": f"{name} - {int(percentage)}%"
        },
        {
            "family": "graphicRectangular",
            "class": "CLKComplicationTemplateGraphicRectangularStandardBody",
            "header": "Ocean Floor",
            "body1": f"{people} People",
            "body2": f"Capacity {capacity}"
        }
    ]
}

# Write to file
with open("watch.json", "w") as f:
    json.dump(output, f, indent=2)

print("watch.json")
