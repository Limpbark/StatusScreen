# StatusScreen

## Step 1: Download the Images
There's 2 main designs (red and black), and another 2 variants (trauma border vs no border) of those depending on what you fancy (mixing also works if you'd like to have black stress but red trauma, etc).

Link: https://drive.google.com/open?id=0B3G7DJD-H2KgVnlKSEdodFNkR0U

## Step 2: Tables
Create one table for each relevant attribute ("stress", "trauma", "armor", "heavy", "special" and "injury") and populate them with the images from above. Start with image 0 and go up in order.

## Step 3: Setup Script
Add the script to the campaign and type "!status" followed by the character names, seperated by "--". For example, for a campaign containing 4 characters named Aldo, Carriless Firm, Miss Cattaby and Rune, you would type ```!status --Aldo --Carriless Firm --Miss Cattaby --Rune``` 

### v1.3.1 
* Now specifices which character it was who was missing an attribute
* Now creates the text object with all the names, but they require manual positioning

### v1.3.0 / v1.3.1
* Fixed layer problem by sending all images to front as they're created
* Now says in chat when it runs into a problem, and what that problem is
* Now creates attributes if they exist, rather than stopping
* No longer resets your stats
