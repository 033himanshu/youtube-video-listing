const container = document.querySelector('.container')
const searchInput = document.querySelector('.search-input')
const searchBtn = document.querySelector('.search-btn')

const options = {method: 'GET', headers: {accept: 'application/json'}};
const availableVideos = []
let nextId=0
let page = 1
let pageEnd=false

//fetch video from api
const fetchVideos = async (limit, query) => {
    if(query)
        query = encodeURIComponent(query)
    const url = `https://api.freeapi.app/api/v1/public/youtube/videos?page=${page}&limit=${limit || 12}&query=${query || "javascript"}&sortBy="keep%2520one%253A%2520mostLiked%2520%257C%2520mostViewed%2520%257C%2520latest%2520%257C%2520oldest"`
    try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data.data.data
    } catch (error) {
        console.error(error);
    }
}
// add fetched Videos in our Available videos
const addVideos = async ()=>{
    const videos = !pageEnd? await fetchVideos(20) : null
    if(videos && videos.length!==0){
        availableVideos.push(...videos)
        page +=1 
    }else
        pageEnd=true
}
//add videos to the container
const showVideos = (videos, id, limit, cleanFirst) =>{
    if(cleanFirst)
        container.innerHTML = ""
    let i = id
    if(videos.length===0){
        container.innerHTML = '<span class="no-videos">No Video found</span>'
    }
    // console.log(id)
    while(i<videos.length && i-id<limit){
        let video = videos[i]
        let data = video.items
        const videoCard = document.createElement('div')
        videoCard.classList.add('video-card')
        videoCard.innerHTML = `
                <div class="thumbnail">
                    <img src="${data.snippet.thumbnails.standard.url}"/>
                </div>
                <div class="card-body">
                    <div class="channel-logo">
                        <img src="images/channel-logo.jpg" alt="">
                    </div>
                    <div class="video-info">
                        <div class="video-title">${data.snippet.title}</div>
                        <div class="channel-name">${data.snippet.channelTitle}</div>
                        <div class="video-stats">
                            <div class="video-views">${data.statistics.viewCount}views</div>.
                            <div class="video-views">${data.statistics.likeCount}likes</div> 
                        </div>
                    </div>
                </div>
        `
        videoCard.querySelector('.channel-name').addEventListener('click', ()=>{
            window.open(`https://www.youtube.com/@HiteshCodeLab`,'_blank');
        })
        videoCard.querySelector('.channel-logo').addEventListener('click', ()=>{
            window.open(`https://www.youtube.com/@HiteshCodeLab`,'_blank');
        })
        videoCard.addEventListener('click',()=>{
            window.open(`https://www.youtube.com/watch?v=${data.id}`,'_blank');
        })
        container.appendChild(videoCard)
        ++i
    }
    return i;
}

// this fetch All  Videos
// all videos because it will help us in searching for videos
const fetchAllVideos = async()=>{
    while(!pageEnd){
        await addVideos()
        if(page==2){
            showVideos(availableVideos, nextId, 10)
        }
    }
}
fetchAllVideos()

// loading more videos
let showingAllVideos = true
const loadMore = ()=>{
    if (window.innerHeight + document.documentElement.scrollTop === document.scrollingElement.scrollHeight && showingAllVideos) {
        nextId = showVideos(availableVideos, nextId, 10, false)
    }
}
window.addEventListener('scroll', loadMore)


// search implementation
// we search based on the tags in video
searchBtn.addEventListener('click',()=>{
    let tag = searchInput.value
    tag = tag.trim()
    if(!tag){
        showingAllVideos =true
        nextId = showVideos(availableVideos, 0, 10, true)
        return
    }
    showingAllVideos=false
    const searchedVideos = availableVideos.filter(video=>{
        const tags = video.items.snippet.tags || []
        for(let i=0;i<tags.length;++i){
            if((tags[i].toLowerCase())===tag) return true
        }
        return false
    })
    showVideos(searchedVideos, 0, searchedVideos.length, true)
})



// implementing logo click which reload the page
const logos = document.querySelectorAll('.logo')
logos.forEach(item=>{
    item.addEventListener('click',()=>{
        window.location.reload()
    })
})