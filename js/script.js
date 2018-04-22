const API_KEY = "AIzaSyDWfNbRt-OJ3Iau2a8bQlGLAVFGndsNTmY";
let xpoints = [];
let ypoints = [];
let titles = [];
let nextPageToken;
let resultsNum;
var traces = [];
let pages = -1;

$(document).ready(function() {
    $("#loadingBar").css("visibility", "hidden");


    $('#addData').on('click', function() {
        addYoutuber();
    });

    $('#youtuber').keypress(function(e) {
        if (e.which == 13) {
            $("#max").focus();
        }
    });

    $("#max").keypress(function(e) {
        console.log(e);
        if (e.which == 13) {
            addYoutuber();
        }
    });

    addData('pewdiepie', 143);
});

function addYoutuber() {
    c = $("#youtuber").val();
    c = c.replace(' ', '');
    n = $("#max").val();
    addData(c, n);
    $("#youtuber").val('');
    $("#youtuber").focus();
}

function addData(channelName, num) {
    $("#loadingBar").css("visibility", "visible");

    n = traces.length + 1;
    $("#graphedYoutubers").append('<div class="channelContainer"><div>YouTuber: ' + channelName + '</div><br><div>Videos: ' + num + '</div><div class="index">' + n + '</div><a href="#" class="close"></a></div>');
    $('.close').unbind('click').on('click', function() {
        index = $(this).parent().find('.index').html() - 1;
        removeData(index);
        $(this).parent().remove();
    });
    resultsNum = num;
    xpoints = [];
    ypoints = [];
    titles = [];
    nextPageToken = undefined;
    pages = -1;

    $.get(
        "https://www.googleapis.com/youtube/v3/channels", {
            part: 'contentDetails',
            forUsername: channelName,
            key: API_KEY
        },
        function(data) {
            $.each(data.items, function(i, item) {
                pid = item.contentDetails.relatedPlaylists.uploads;
                getVids(pid);
            });
        }
    );

    var intervalId = setInterval(function() {
        if (xpoints.length == resultsNum && ypoints.length == resultsNum) {
            graph(xpoints, ypoints, channelName, titles);
            clearInterval(intervalId);
        }
    }, 1000);
}

function graph(xAxis, yAxis, channelName, videoTitles) {
    var trace = {
        x: xAxis,
        y: yAxis,
        mode: 'markers',
        name: channelName,
        text: videoTitles
    };
    traces.push(trace);

    var graphInfo = traces;

    var layout = {
        title: 'YouTube Data'
    };

    Plotly.newPlot('graph', graphInfo, layout);
    $("#loadingBar").css("visibility", "hidden");

}

function getVids(pid) {
    $.get(
        "https://www.googleapis.com/youtube/v3/playlistItems", {
            part: 'snippet',
            maxResults: Math.min(50, resultsNum - xpoints.length),
            playlistId: pid,
            key: API_KEY
        }, updatePoints
    );
}

function updatePoints(data) {
    pages++;
    nextPageToken = data.nextPageToken;

    var output;
    $.each(data.items, function(i, item) {
        videoDate = item.snippet.publishedAt;
        xpoints.push(videoDate);
        titles.push(item.snippet.title);
        setLoadingBar(xpoints.length * 100 / resultsNum);
        videoId = item.snippet.resourceId.videoId;
        $.getJSON('https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' + videoId + '&key=' + API_KEY, function(video) {
            let thisI = pages * 50 + i;
            ypoints[thisI] = video.items[0].statistics.viewCount;
        });
    });
    $.each(xpoints, function(i, item) {
        xpoints[i] = xpoints[i].replace('T', ' ');
    });

    if (xpoints.length < resultsNum && nextPageToken != undefined) {
        $.get(
            "https://www.googleapis.com/youtube/v3/playlistItems", {
                part: 'snippet',
                maxResults: Math.min(50, resultsNum - xpoints.length),
                playlistId: pid,
                key: API_KEY,
                pageToken: nextPageToken
            }, updatePoints
        );
    } else {
        resultsNum = xpoints.length;
    }

}

function removeData(index) {
    traces.splice(index, 1);

    setTimeout(function() {
        $.each($('.index'), function(i) {
            $(this).html(i + 1);
        });
    }, 500);


    var graphInfo = traces;

    var layout = {
        title: 'YouTube Data'
    };

    Plotly.newPlot('graph', graphInfo, layout);
}

function setLoadingBar(w) {
    var elem = $("#loadedIn");

    elem.css('width', w + '%');
}