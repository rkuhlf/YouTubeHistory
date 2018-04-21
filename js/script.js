let channelName = 'wesbos';
const API_KEY = "AIzaSyDWfNbRt-OJ3Iau2a8bQlGLAVFGndsNTmY";

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
});

function getVids(pid) {
    $.get(
        "https://www.googleapis.com/youtube/v3/playlistItems", {
            part: 'snippet',
            maxResults: 10,
            playlistId: pid,
            key: API_KEY
        },
        function(data) {
            var output;
            $.each(data.items, function(i, item) {
                videoTitle = item.snippet.title;
                videoId = item.snippet.resourceId.videoId;

                output = '<li><iframe src=\"//www.youtube.com/embed/' + videoId + '\"></iframe></li>';

                // Add to results list
                $('#results').append(output);
            });
        }
    );
}