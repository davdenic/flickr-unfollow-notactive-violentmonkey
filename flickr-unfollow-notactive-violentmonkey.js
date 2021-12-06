// ==UserScript==
// @name        Automatically Unfollow Flickr not-following and not-active
// @namespace   Violentmonkey Scripts
// @include *.flickr.com/people/*/contacts/
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      --
// @description 3/8/2020, 8:42:28 PM
// ==/UserScript==

var config = {
    "unfollow": 'non-reciprocal', // 'all' or 'non-reciprocal'
    "protect": ['friend','family'], // 'friend' or 'family'
    "addedOn": ['months','ages'], // 'weeks', 'months', 'ages'
    "anyAddedTime": false, // true, false
    "lastUpload": [24, 'months'] // number, 'week'|'months'
};

function run()
{
    //This injects jquery
    s = document.createElement('script');
    s.type = 'text/javascript';
    s.id = 'jqueryInject';
    s.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js";
    document.head.appendChild(s);

    setTimeout(addEvent, 500)
}

setTimeout(run, 1000);

function addEvent()
{
    $('.contact-list-edit a').text('Unfollow');
    $('body').on('click', '.contact-list-edit a', function () {
        setTimeout(function () {
            $('#contactChangerContainer #contactChangerCheckContact').click();
        }, 1000);
        setTimeout(function () {
            $('#contactChangerContainer #contactChangerButtonRemove').click();
        }, 1000);
    });

    function unfollow()
    {
        var $notFollowing = $('.not-following').find('.contact-list-edit a');

        if ( $notFollowing.length <= 0 ) {
            console.log('all following');
            window.location = 'https://' + document.location.host + $('a.Next').attr('href');
        } else {
            $notFollowing.each(function (i) {
                var $this = $(this);
                setTimeout(function () {
                    $this.click();
//                    console.log('click' , i);
                }, (i * 2000));

                console.log(i, $notFollowing.length - 1);
                if ( i === ($notFollowing.length - 1) ) {
                    setTimeout(function () {
                        window.location.reload();
                    }, i * 2000 + 3000);
                }

            });
        }

    }

    setTimeout(unfollow, 1000);

    (function () {
        snapIcons = document.evaluate(
            "//td[@class='contact-list-bicon']/a/img[@class='BuddyIconX']",
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        if (snapIcons.snapshotLength == 0) {
            snapIcons = document.evaluate(
                "//td[@class='contact-list-bicon contact-list-sorted']/a/img[@class='BuddyIconX']",
                document,
                null,
                XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                null
            );
        }

        if (snapIcons.snapshotLength == 0) {
            return;
        }
        for (var i = snapIcons.snapshotLength - 1; i >= 0; i--) {
            //console.log(i);
            var thisIcon = snapIcons.snapshotItem(i);
            var matchNSID = /([a-zA-Z0-9]+@[A-Z0-9]+)/;
            var matches = matchNSID.exec(thisIcon.src);
            if (matches[1]) {
                // first cleans not active users that have not uploaded since LastUpload or never
                let thisNumPhoto = parseInt($(thisIcon).parents('tr').find('.contact-list-num').text(), 10);
                let thislastUp = $(thisIcon).parents('tr').find('.contact-list-last').text();
                let [thisLastUpNum, ...thisLastUpText] = thislastUp.split(" ");
                thisLastUpText = thisLastUpText.join(" ");
                //console.log(matches[1], thisNumPhoto, thisLastUpNum, thisLastUpText);
                if (thisNumPhoto === 0) {
                    // mark to unfollow and red if 0 photo
                    $(thisIcon).parents('tr').addClass('not-following');
                    console.log('zero found');
                    continue;
                } 
                if (thislastUp.includes('ages')) {
                    // mark to unfollow if last upload is ages ago
                    $(thisIcon).parents('tr').addClass('not-following');
                    console.log('ages found');
                    continue;
                }
                if (thislastUp.includes(config.lastUpload[1]) && parseInt(thisLastUpNum, 10) > config.lastUpload[0] ) {
                    // mark to unfollow if last upload is more 24 months ago
                    $(thisIcon).parents('tr').addClass('not-following');
                    console.log(parseInt(thisLastUpNum, 10), config.lastUpload[1], 'found');
                    continue;
                }
              
                // and then it search who is not a reciprocal follower
                var listener = {
                    flickr_people_getInfo_onLoad: function (success, responseXML, responseText, params) {
                        if (success) {
                            var rsp = responseText.replace(/jsonFlickrApi\(/,'');
                            rsp = eval('(' + rsp);
                            if (rsp.stat == 'ok') {
                                if (
                                    rsp.person.revcontact == 0 &&
                                    rsp.person.revfriend == 0 &&
                                    rsp.person.revfamily == 0
                                ) {
                                    snapUnames = document.evaluate(
                                        "//td[@class='contact-list-name']/a/text()",
                                        document,
                                        null,
                                        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                                        null
                                    );

                                    if (snapUnames.snapshotLength == 0) {
                                        snapUnames = document.evaluate(
                                            "//td[@class='contact-list-name contact-list-sorted']/a/text()",
                                            document,
                                            null,
                                            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                                            null
                                        );
                                    }
                                    //console.log(snapUnames);
                                    for (j = 0; j < snapUnames.snapshotLength; j++) {
                                        if ( snapUnames.snapshotItem(j).nodeValue == rsp.person.username._content || config.unfollow == 'all' ) {
                                            var contactType = $(snapUnames.snapshotItem(j)).parents('tr').find('.contact-list-youthem span').eq(0).text();
                                            contactType = contactType.toLowerCase();
                                            var addedOn = $(snapUnames.snapshotItem(j)).parents('tr').find('.contact-list-added').text();

                                            //console.log(lastUpload);

                                            var protect = false;
                                            for (i = 0; i < config.protect.length; i++) {
                                                if ( contactType.includes(config.protect[i]) ) {
                                                    protect = true;
                                                    break;
                                                }
                                            }//end loop to check contact type

                                            if (!protect) {
                                                //console.log('not protected');
                                                if (config.anyAddedTime === true ) {
                                                    //console.log('anyAddedTime is true');
                                                    snapUnames.snapshotItem(j).parentNode.style.color = 'red';
                                                    $(snapUnames.snapshotItem(j)).parents('tr').addClass('not-following');
                                                } else {
                                                    for (i = 0; i < config.addedOn.length; i++) {
                                                        if (addedOn.includes(config.addedOn[i]) ) {
                                                            // mark to unfollow and red if added time ago
                                                            snapUnames.snapshotItem(j).parentNode.style.color = 'red';
                                                            $(snapUnames.snapshotItem(j)).parents('tr').addClass('not-following');
                                                            break;
                                                        } else {
                                                            //orange added recently
                                                            snapUnames.snapshotItem(j).parentNode.style.color = 'orange';
                                                        }
                                                    }//end for loop check addedOn
                                                }//end protect else
                                            }//end if !protect
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
                var f = function () {
                    try {
                        unsafeWindow.F.API.callMethod(
                            'flickr.people.getInfo',
                            {
                                user_id: matches[1],
                                format: 'json'
                            },
                            listener
                        );
                    } catch (err) {
                        setTimeout(f, 1000);
                    }
                };
                f();
            }
        }
    })()
}
