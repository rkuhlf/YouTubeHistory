let channelName = 'pewdiepie';
const API_KEY = "AIzaSyDWfNbRt-OJ3Iau2a8bQlGLAVFGndsNTmY";
const resultsNum = 50;

let xpoints = [];
let ypoints = [];

$(document).ready(function() {
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
            graph();
            clearInterval(intervalId);
        }
    }, 1000);


});

function graph() {
    var trace1 = {
        x: xpoints,
        y: ypoints,
        mode: 'markers'
    };

    var graphInfo = [trace1];

    var layout = {
        title: 'Line and Scatter Plot'
    };

    Plotly.newPlot('graph', graphInfo, layout);
}

function getVids(pid) {
    $.get(
        "https://www.googleapis.com/youtube/v3/playlistItems", {
            part: 'snippet',
            maxResults: resultsNum,
            playlistId: pid,
            key: API_KEY
        },
        function(data) {
            console.log(data);
            var output;
            $.each(data.items, function(i, item) {
                videoDate = item.snippet.publishedAt;
                xpoints.push(videoDate);
                videoId = item.snippet.resourceId.videoId;
                $.getJSON('https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' + videoId + '&key=' + API_KEY, function(video) {
                    ypoints.push(video.items[0].statistics.viewCount);
                });
            });
            $.each(xpoints, function(i, item) {
                xpoints[i] = xpoints[i].replace('T', ' ');
                xpoints[i] = xpoints[i].slice(0, -5);
            });

        }
    );
}