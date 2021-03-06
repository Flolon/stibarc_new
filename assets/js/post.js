var id = getAllUrlParams().id;

function commentBlock(comment) {
    var html = `<div id="comment">
		<div>
			<a class="comment-username" href="user.html?id=${encodeURIComponent(comment.poster)}">`
    html += `<img src="${comment.pfp}" class="pfp" style="vertical-align:middle;margin-right:5px;" title="Commenter profile picture" alt="Commenter profile picture"></img>`
    html += `${sanetize(comment.poster)}</a>${comment.verified ? verifiedUser() : ""}
		</div>
		<div>
			${emojify(greenify(sanetize(comment.content)))}
		</div>
		<a class="replyto" href="javascript:replyto('${comment.poster.replace(/'/g, "\\'")}')">
			<i>Reply</i>
		</a>
	</div><br/>`
    return html
}

function replyto(user) {
    $("comtent").value += `@${user} `;
    $("comtent").focus();
}

function upvote() {
    if (loggedIn) {
        fetch("https://api.stibarc.com/upvote.sjs",
            {
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: "id=" + id + "&sess=" + sess
            }
        ).then(response => response.json()).then((json) => {
            $("upvotes").innerText = json.upvotes
            $("downvotes").innerText = json.downvotes
        }).catch((err) => { console.log(err) })
    }
}

function downvote() {
    if (loggedIn) {
        fetch("https://api.stibarc.com/downvote.sjs",
            {
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: "id=" + id + "&sess=" + sess
            }
        ).then(response => response.json()).then((json) => {
            $("upvotes").innerText = json.upvotes
            $("downvotes").innerText = json.downvotes
        }).catch((err) => { console.log(err) })
    }
}

function loadPost(id) {
    fetch(`${rootAPI}/v2/getpost.sjs?id=${id}`).then(response => response.json()).then((json) => {
        document.title = `${json.title} - STiBaRC`
        $("title").innerHTML = emojify(sanetize(json.title))
        $("author").href = `./user.html?id=${encodeURIComponent(json.poster)}`
        $("username").innerHTML = sanetize(json.poster)
        $("verified").innerHTML = `${json.verified ? verifiedUser() : ""}`
        $("pfp").src = json.pfp
        var content = ""
        if (htmlers.indexOf(json.poster) != -1) {
            content = emojify(json.content)
        } else {
            content = emojify(sanetize(json.content))
        }
        content = greenify(content)
        $("content").innerHTML = content
        $("date").innerText = json.postdate
        if (json.edited) {
            $("edited").style.display = ""
        }
        $("upvotes").innerText = json.upvotes
        $("downvotes").innerText = json.downvotes
        if (json.attachment != undefined && json.attachment != "none") {
            $("attachment").style.display = ""
            $("attachment-btn").onclick = function (e) {
                $("attachment-btn").style.display = "none"
                if (json['real_attachment'] != undefined && json['real_attachment'] != "" && json['real_attachment'] != "none") {
                    var ext = json['real_attachment'].split(".")[1]
                    if (images.indexOf(ext) != -1) {
                        var img = document.createElement("IMG")
                        img.setAttribute("id", "image")
                        img.setAttribute("src", `${rootCDN}/images/` + json['real_attachment'])
                        $("attachment").appendChild(img)
                    } else if (videos.indexOf(ext) != -1) {
                        var video = document.createElement("VIDEO")
                        video.setAttribute("controls", null)
                        video.setAttribute("autoplay", null)
                        video.setAttribute("id", "image")
                        var source = document.createElement("SOURCE")
                        source.setAttribute("src", `${rootCDN}/images/` + json['real_attachment'])
                        video.appendChild(source)
                        $("attachment").appendChild(video)
                    } else if (audios.indexOf(ext) != -1) {
                        var audio = document.createElement("AUDIO")
                        audio.setAttribute("controls", null)
                        audio.setAttribute("autoplay", null)
                        audio.setAttribute("id", "image")
                        var source = document.createElement("SOURCE")
                        source.setAttribute("src", `${rootCDN}/images/` + json['real_attachment'])
                        audio.appendChild(source)
                        $("attachment").appendChild(audio)
                    } else {
                        $("attachment-btn").style.display = ""
                        window.open(`${rootCDN}/images/` + json['real_attachment'])
                        $("attachment-btn").style.display = ""
                    }
                } else {
                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open("GET", `${rootAPI}/getimage.sjs?id=` + json.attachment, false)
                    xmlHttp.send()
                    if (xmlHttp.responseText.substring(5, 10) == "image") {
                        var img = document.createElement("IMG")
                        img.setAttribute("id", "image")
                        img.setAttribute("src", xmlHttp.responseText)
                        $("attachment").appendChild(img)
                    } else if (xmlHttp.responseText.substring(5, 10) == "video" || xmlHttp.responseText.substring(5, 20) == "application/mp4") {
                        var video = document.createElement("VIDEO")
                        video.setAttribute("controls", null)
                        video.setAttribute("autoplay", null)
                        video.setAttribute("id", "image")
                        var source = document.createElement("SOURCE")
                        source.setAttribute("src", xmlHttp.responseText)
                        video.appendChild(source)
                        $("attachment").appendChild(video)
                    } else if (xmlHttp.responseText.substring(5, 10) == "audio" || xmlHttp.responseText.substring(5, 20) == "application/mp3" || xmlHttp.responseText.substring(5, 20) == "application/wav") {
                        var audio = document.createElement("AUDIO")
                        audio.setAttribute("controls", null)
                        audio.setAttribute("autoplay", null)
                        audio.setAttribute("id", "image")
                        var source = document.createElement("SOURCE")
                        source.setAttribute("src", xmlHttp.responseText)
                        audio.appendChild(source)
                        $("attachment").appendChild(audio)
                    } else {
                        $("attachment-btn").style.display = ""
                        window.open(xmlHttp.responseText)
                        $("attachment-btn").style.display = ""
                    }
                }
            }
        }
        if (json.client) {
            $("client").innerHTML = `<span class="badge">Posted using ${json.client}</span>`;
            $("client").style.display = "";
        }
        if (json.comments != undefined) {
			var html = "";
			for (var i in json.comments) {
				html += commentBlock(json.comments[i]);
			}
			$("comments").innerHTML = html;
		} else {
			$("comments").innerHTML = '<div id="comment">No comments</div>';
		}
        // post loaded //
        $("loader").style.display = "none"
        $("post").style.display = ""
    }).catch((err) => { console.log(err) })
}

loadPost(id)