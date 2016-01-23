/**** Disclaimer ****
 * 
 * De pagina start met een standaard youtube filmpje. Je dient een search
 * query in te vullen en de resultaten aan de playlist toe te voegen door
 * er op te klikken. Vervolgens kan de je playlist queue sorteren door
 * de thumbnails te 'drag&droppen'
 * 
 * Ik heb de code alleen onder chromium getest! Version 46.0.2490.71
 * De code gebruikt zowel jQuery als native JS. Puur ter illustratie en
 * welke methode op dat moment het beste uit kwam. Ik werk zelf 
 * voornamelijk met jQuery.
 * 
 * De videos spelen maar voor 6 sec.
 * 
 */
 
/**** PLAYLIST METHODEN ****
 * 
 * De playlist methode queueVid ontvangt een DOM element en 'append' die
 * aan de '#playlist' div. De popFirstVid returned de eerste child
 * van de '#playlist' div en verwijdert die.
 */
function PlaylistException(message) {
   this.message = message;
   this.name = "PlaylistException";
}

// Just queue a video and directly play if none is playing
function queueVid(vidId) 
{
    console.log("queueVid:"+vidId.id +" "+player.getPlayerState())
    if (player.getPlayerState() > 0  && player.getPlayerState() != 5)
    {
        console.log("queuing vid: "+vidId.id +"plrState: " +player.getPlayerState());
        $("#playlist").append(vidId);
    }
    else 
    {
        console.log("instant play vid: "+vidId.id);
        player.loadVideoById({
            'videoId': vidId.id,
            'startSeconds': 0, 
            'endSeconds': 6
            });
        //player.loadVideoById(vidId,0);
    }
}

function popFirstVid()
{
    var vidId = document.getElementById('playlist').children[0]
    if (vidId.id === undefined)
    {
        throw new PlaylistException("Empty playlist");
    }
    else
    {
        console.log("removing "+vidId.id);
        vidId.remove();  //remove element
        return vidId;
    }
}

/**** YOUTUBE PLAYER METHODEN ****
 * 
 * Dit zijn eigenlijk standaard YT api methoden.
 * Ik heb alleen de playlist methoden toegevoegd en wat state logica
 */
   // Google api Iframe prepare dingen
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Deze vult de Iframe
var player;
function onYouTubeIframeAPIReady() 
{
    var vidId = "M7lc1UVf-VE";
    try
    {
        var vidId = popFirstVid().id;
    }
    catch(e)
    {
        vidId = "M7lc1UVf-VE";
    }
    player = new YT.Player('player', 
    {
      height: '390',
      width: '640',
      videoId: vidId,
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event)
{
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var queued = false;
function onPlayerStateChange(event) 
{
    console.log("PlayerState: "+event.data);
    if (event.data == YT.PlayerState.PLAYING) 
    {
        setTimeout(stopVideo, 6000);
        queued = false;
    }
    // ENDED && there is a queue to play && there is nothing queued in player
    else if (event.data == YT.PlayerState.ENDED 
                && document.getElementById('playlist').children.length 
                && !queued )
    {
        console.log("Play new vid");
        player.loadVideoById(popFirstVid().id,0);
            /*{
            'videoId': popFirstVid(),
            'startSeconds': 0, 
            'endSeconds': 6
            });*/
        queued = true;
    }
    else if (event.data == -1 && $("#playlist img").length && !queued )
    {
        console.log("Play new vid");
        player.loadVideoById({
            'videoId': popFirstVid().id,
            'startSeconds': 0, 
            'endSeconds': 6
            });
        queued = true;
    }
    else 
    {
        //console.log("PlayerState: "+event.data);
        //console.log(JSON.stringify(event) + "\n:" + event.data);
    }
}

function stopVideo() 
{
    player.stopVideo();
}

/**** GOOGLE/YOUTUBE API METHODEN ****
 * 
 * Wederom standaard Google API methoden. Ik heb alleen code toegevoegd
 * om de juiste data uit de resultaten te vissen.
 * Door op de search results te clicken voeg je ze toe aan de playlist
 */
function keyWordsearch()
{
    gapi.client.setApiKey('AIzaSyA20UyrC5ULMAj80Xb0iztNb4pjvjNPQTo'); //Mijn Key
    gapi.client.load('youtube', 'v3', function() 
    {
            makeRequest();
    });
}

function makeRequest() 
{
    var q = $('#query').val();
    var request = gapi.client.youtube.search.list(
    {
               q: q,
            part: 'snippet',
            maxResults: 20,
            type: 'video'
    });
    request.execute(function(response) 
    {
        //console.log(JSON.stringify(response.result));
        $('#searchresults').empty();
        for (var key in response.result.items)
        {
            //only youtube videos (better search params?)
            if (response.result.items[key].id.kind == "youtube#video") 
            {
                //console.log(JSON.stringify(response.result.items[key]));
                console.log(response.result.items[key].id.videoId +"\n"+
                            response.result.items[key].snippet.title+"\n"+
                            response.result.items[key].snippet.thumbnails.default.url+"\n---");
                var thumb = $('<img />', {
                    src : response.result.items[key].snippet.thumbnails.default.url,
                    id : response.result.items[key].id.videoId,
                    title : response.result.items[key].snippet.thumbnails.default.url,
                    style : "height:90",
                    draggable : true,
                    onclick : "add_to_playlist(event)"
                });
                $('#searchresults').append(thumb);
            }
        }
    });
}

/**** PLAYLIST SORTING METHODEN ****
 * 
 * De methoden haken in op de html5 drag&drop API
 * Een dragout zou nog gebruikt kunnen worden voor verwijderen uit de
 * playlist. 
 */  
function init_search()
{
    var searchbtn = '<label><input id="query" value="magicfly" type="text"/><button id="search-button"  onclick="keyWordsearch()">Search</button></label><div id="searchresults"></div>';
    $('#searchlist').append(searchbtn);
}
init_search();

function add_to_playlist(ev)
{
    ev.preventDefault();
    ev.target.remove();
    //still need to remove the click handler
    console.log("add_to_playlist "+ev.target.id);
    queueVid(ev.target);
}

function sortable(rootEl, update){
    console.log(rootEl);
    var dragEl, nextEl;
    
    function on_drag_over(evt) {
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'move';

        var target = evt.target;
        if (target && target !== dragEl && target.nodeName == 'IMG') {
            // Sorting
            rootEl.insertBefore(dragEl, rootEl.children[0] !== target && target.nextSibling || target);
            console.log(dragEl, rootEl.children[0].id);
        }
    }
    
    function on_drag_end(evt)
    {
        evt.preventDefault();
       
        dragEl.classList.remove('ghost');
        rootEl.removeEventListener('dragover', on_drag_over, false);
        rootEl.removeEventListener('dragend', on_drag_end, false);

        if( nextEl !== dragEl.nextSibling )
        {
            update(dragEl);
        }
    }
    
    rootEl.addEventListener('dragstart', function (evt){
        dragEl = evt.target; // save elements
        nextEl = dragEl.nextSibling;
        
        evt.dataTransfer.effectAllowed = 'move';
        evt.dataTransfer.setData('Text', dragEl.textContent);

        // event subscription
        rootEl.addEventListener('dragover', on_drag_over, false);
        rootEl.addEventListener('dragend', on_drag_end, false);

        setTimeout(function (){
            //borrowed from sortable lib
            dragEl.classList.add('ghost');
        }, 0)
    }, false);

}

sortable( document.getElementById('playlist'), function (item){
    console.log(item + "sorted");
    return false;
});
