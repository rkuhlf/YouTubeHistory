const API_KEY = "AIzaSyDWfNbRt-OJ3Iau2a8bQlGLAVFGndsNTmY";
let xpoints = [];
let ypoints = [];
let titles = [];
let nextPageToken;
let resultsNum;
var traces = [];

$(document).ready(function() {

    $('#addData').on('click', function() {
        c = $("#youtuber").val();
        c = c.replace(' ', '');
        n = $("#max").val();
        addData(c, n);
    });

    addData('pewdiepie', 143);
});

function addData(channelName, num) {
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
    nextPageToken = data.nextPageToken;
    console.log(data);

    var output;
    $.each(data.items, function(i, item) {
        videoDate = item.snippet.publishedAt;
        xpoints.push(videoDate);
        videoId = item.snippet.resourceId.videoId;
        $.getJSON('https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' + videoId + '&key=' + API_KEY, function(video) {
            ypoints.push(video.items[0].statistics.viewCount);
        });
        $.getJSON('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + videoId + '&key=' + API_KEY, function(video) {
            titles.push(video.items[0].snippet.localized.title)
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