/**** PLAYLIST METHODEN ****/
var queue = ['M7lc1UVf-VE',]; // De playlist queue

// Just queue a video and directly play if none is playing
function queueVid(vidId) 
{
    console.log("queueVid:"+vidId +" "+player.getPlayerState())
    if (player.getPlayerState() > 0  && player.getPlayerState() != 5)
    {
        console.log("queuing vid: "+vidId +"plrState: " +player.getPlayerState());
        queue.push(vidId);
    }
    else 
    {
        console.log("instant play vid: "+vidId);
        player.loadVideoById({
            'videoId': vidId,
            'startSeconds': 0, 
            'endSeconds': 6
            });
        //player.loadVideoById(vidId,0);
        $('#'+vidId).remove();
    }
}

function popFirstVid()
{
    var vidId = queue.shift();
    //remove element?
    console.log("removing "+vidId)
    $('#'+vidId).remove();
    return vidId;
}

/**** YOUTUBE PLAYER METHODEN ****/
// Google api Iframe prepare dingen
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Deve vult de Iframe
var player;
function onYouTubeIframeAPIReady() 
{
    player = new YT.Player('player', 
    {
      height: '390',
      width: '640',
      videoId: popFirstVid(),
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
    else if (event.data == YT.PlayerState.ENDED && queue.length && !queued )
    {
        console.log("Play new vid");
        player.loadVideoById(popFirstVid(),0);
            /*{
            'videoId': popFirstVid(),
            'startSeconds': 0, 
            'endSeconds': 6
            });*/
        queued = true;
    }
    else if (event.data == -1 && queue.length && !queued )
    {
        console.log("Play new vid");
        player.loadVideoById({
            'videoId': popFirstVid(),
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

/**** GOOGLE/YOUTUBE API METHODEN ****/
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
            part: 'snippet'                        
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

/**** PLAYLIST SORTING METHODEN ****/
function init_search()
{
    var searchbtn = '<label><input id="query" value="spacedisco" type="text"/><button id="search-button"  onclick="keyWordsearch()">Search</button></label><div id="searchresults"></div>';
    $('#searchlist').append(searchbtn);
}
init_search();

function add_to_playlist(ev)
{
    ev.preventDefault();
    var img = ev.target;
    ev.target.remove();
    $('#playlist').append(img);
    console.log("add_to_playlist "+ev.target.id);
    queueVid(ev.target.id);
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
