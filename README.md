# Flickr unfollow not active violentmonkey script
## tested on firefox v94.0.2 (macos), Violentmonkey v2.13.0

## Why this script
The reason is clearly that you can start following someone but he can be not-active or someone who deleted his/her/its photos or make them private. 
Flickr changed ownership twice since I've started using it and I collected something around 9k contacts, some of them in the meanwhile became not-active or remove their photos. Remove them is a tedious job.
I'm removing also non reciprocal contacts, after giving them a reasonable amount of time.

### How to install
copy the raw script into a new violentmonkey script
open your flickr page contacts https://www.flickr.com/people/YOURACCOUNT/contacts/?page=1

### How it works
The script fetches for each page of your contacts who is not active and who is not your reciprocal follower then it unfollow them.
In each page there are 15 contacts.
After remove some contacts it refresh the page.
If none to be removed is found it moves to next page.

### Criterias
 - First it searches for contacts with 0 photos.
 - Then for contacts where the last upload is older than 24 months.
 - Then for contacts that does not follow you back and you added "months" or "ages" ago. 

At the top of the script there are some variables you can configure.

Note: Flickr uses dates like "54 months ago", "ages ago", "12 weeks ago", "2 days ago" so the search is based on the keywords "months", "ages".

### Known bugs and issues
 - Flickr pagination numbers does not update as the script proceed. As consequence at a certain point in the end of the process it will open a undefined url. 
 - It may requires some hours to perform over a "thousands" of contacts account. I've been use it on 9k contacts for 1-2 hours, but since it does automatically I left it run for the time needed
