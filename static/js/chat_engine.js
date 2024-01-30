{
    // Declaring global variables
    var chat = false;
    const sockets = {};
    let currentChatCount = 0;

    onLoad()

    // function to be called on loading
    function onLoad() {
        fetchRooms();
        let id = $("#user-id").text();
        // if there in no id, means user is not authenticated
        if (!id) return;
        sockets[id] = new WebSocket(`ws://${window.location.host}/ws/chat/${id}/`);
        sockets[id].onopen = () => {
        };
        sockets[id].onmessage = (event) => {
            const data = JSON.parse(event.data);
            message = data.message;
            //on getting the message
            onMessageReceive(data.message);

            sockets[id].onclose = function (event) {
            };
        }


    }

    // function to handle when a new message comes
    function onMessageReceive(message) {
        // checking for existing socket and currentChat
        if (!(message.senderId in sockets) && currentChatCount > 0) {
            sockets[message.senderId] = new WebSocket(`ws://${window.location.host}/ws/chat/${message.senderId}/`);
            sockets[message.senderId].onopen = () => {
            }
            let newChatBox = $('.chatbox').first().clone();

            //to add new room to chat rooms
            if (!message.roomExists) renderChatRoom();
            newChatBox.find('.content').empty();

            newChatBox.css("right", (100 + (currentChatCount * 300) + 20) + "px")
            newChatBox.css("display", "flex").attr("id", `chatbox-${message.senderId}`);
            newChatBox.find('.content').attr("id", `content-${message.senderId}`);
            newChatBox.find(".send-btn").attr("id", `send_${message.senderId}`);
            newChatBox.find(".send-btn>p").attr("id", `send_${message.senderId}`);
            newChatBox.find(".message-input").attr("id", `input_${message.senderId}`);
            newChatBox.find(".chatbox-header").attr("id", message.senderId);
            newChatBox.find(".chatbox-header>p").text(message.username);
            setTimeout(() => {

                document.getElementById(`content-${message.senderId}`).append($("<p>").addClass("message-other").text(message.message).get(0));
            }, 0)
            $('body').append(newChatBox);
            currentChatCount++;
        } else {

            // for chat room
            if (!message.roomExists) renderChatRoom();



            //----------FOR CHAT BOX--------------

            // if there isn't already a open chat box with the id
            if (!(message.senderId in sockets)) {
                sockets[message.senderId] = new WebSocket(`ws://${window.location.host}/ws/chat/${message.senderId}/`);
                sockets[message.senderId].onopen = () => {
                }
                // increasing chat count to keep track
                currentChatCount++;
            }

            if ($(".chatbox").css("display") == "none") {
                $(".chatbox").css("display", "flex").attr("id", `chatbox-${message.senderId}`);
                $(".content").attr("id", `content-${message.senderId}`);
                $(".send-btn").attr("id", `send_${message.senderId}`);
                $(".send-btn>p").attr("id", `send_${message.senderId}`);
                $(".message-input").attr("id", `input_${message.senderId}`);
                $(".chatbox-header").attr("id", message.senderId);
                $(".chatbox-header>p").text(message.username);
            }
            document.getElementById(`content-${message.senderId}`).append($("<p>").addClass("message-other").text(message.message).get(0));
        }

        setTimeout(() => {
            $(".chatbox").css("height", "400px");
        }, 0);
    }

    // to render new chat room into chat rooms
    function renderChatRoom() {
        const chatroom = $("<div>").addClass("chatroom").attr("id", message.senderId);
        const profileImg = $("<img>").attr("id", message.senderId);
        if (message.profilePic) profileImg.attr("src", message.profilePic);
        else profileImg.attr("src", "/static/images/icons/profile-user.png");
        const name = $("<p>").text(message.username);
        chatroom.append(profileImg, name);
        $(".chatrooms-box").append(chatroom);
    }


    // to send the message
    function sendMessage(message, receiver) {
        sockets[receiver].send(JSON.stringify({ message }));
    }

    // to fetch the rooms from server
    async function fetchRooms() {
        const response = await fetch("/chat/fetch/");
        const data = await response.json();
        renderRooms(data.rooms);
    }
    // to render the rooms on dom
    function renderRooms(data) {
        $(".chatrooms-box").html(`<p class="chats-heading" >CHATS</p>`)
        data.forEach(e => {
            const chatroom = $("<div>").addClass("chatroom").attr({ "id": e.userId, "data-name": e.username });
            const profileImg = $("<img>").attr("id", e.userId);
            if (e.profilePic) profileImg.attr("src", e.profilePic);
            else profileImg.attr("src", "/static/images/icons/profile-user.png");
            const name = $("<p>").text(e.username).attr({ "id": e.userId, "data-name": e.username }).addClass("username");
            chatroom.append(profileImg, name);
            $(".chatrooms-box").append(chatroom);
        });

    }


    // -----------------------EVENT HANDLERS---------------------

    // to open the chat box
    function onChatBubbleClickHandler() {
        $(".chatroom-container").css({ display: "block" });
        setTimeout(function () {
            $(".chatroom-container").css({ opacity: 1 });
            $(".chatrooms-box").css({ width: "300px" });
        }, 0);
    }

    // to close the chat box
    function onChatContainerClickHandler(event) {
        event.stopPropagation();
        $(".chatroom-container").css({ opacity: 0 });
        $(".chatrooms-box").css({ width: "0" });
        setTimeout(function () {
            $(".chatroom-container").css({ display: "none" });
        }, 300);
    }

    function onImgClickHandler(e) {
        e.stopPropagation()
        window.location.href = `/users/${e.target.id}/profile/`;
    }

    // to minimize the chatbox
    function onChatBoxHeaderClickHandler(e) {
        let id = `chatbox-${e.target.id}`;
        let chatBoxHeight = document.getElementById(id).offsetHeight;
        if (chatBoxHeight < 45) { document.getElementById(id).style.height = "400px"; chat = true; }
        else { document.getElementById(id).style.height = "42px"; chat = false; }
    }


    function onChatRoomClickHandler(e) {
        onChatContainerClickHandler(e);
        setTimeout(() => onChatBtnClickHandler(e, true), 300);
    }



    // ----------------------FOR CHAT BOX----------------------
    function onCloseBtnClickHandler(e) {
        e.stopPropagation();
        let chatBoxHeight = $(".chatbox").height();
        chat = false;
        if (chatBoxHeight > 45) {
            $(".chatbox").css("height", "42px");
            setTimeout(() => {
                $(".chatbox").css("display", "none");
            }, 300);
        } else $(".chatbox").css("display", "none");
        currentChatCount--;
    }

    // to handle the send btn click
    function onSendBtnClickHandler(e) {
        let receiver = e.target.id.split("_")[1];
        let message = document.getElementById(`input_${receiver}`).value;
        if (!message) return;
        sendMessage(message, receiver);
        document.getElementById(`content-${receiver}`).append($("<p>").addClass("message-self").text(message).get(0));
        $(`#content-${receiver}`).append($("<p>").addClass("message-self").text(message));
        document.getElementById(`input_${receiver}`).value = "";
    }

    function onChatBtnClickHandler(e, fromChatRoom) {
        if (!$("#user-id").text()) {
            toastr.error("Please Login to chat!");
            setTimeout(() => window.location.href = "/users/login/"
                , 500);
            return;
        }
        currentChatCount++;
        chat = true;
        let receiver = e.target.id;
        sockets[receiver] = new WebSocket(`ws://${window.location.host}/ws/chat/${receiver}/`);
        sockets[receiver].onopen = () => { }

        $(".chatbox").css("display", "flex").attr("id", `chatbox-${receiver}`);
        $(".content").attr("id", `content-${receiver}`);
        $(".send-btn").attr("id", `send_${receiver}`)
        $(".send-btn>p").attr("id", `send_${receiver}`);
        $(".message-input").attr("id", `input_${receiver}`)
        $(".chatbox-header").attr("id", receiver);
        if (fromChatRoom) $(".chatbox-header>p").text(e.target.dataset.name);
        else $(".chatbox-header>p").text($("#listed-by a").text());


        setTimeout(() => {
            $(".chatbox").css("height", "400px");

        }, 0);


    }
    function onEnterPressHandler(e) {
        if (e.which == 13) onSendBtnClickHandler(e);

    }
    // -----------------------EVENT LISTENERS---------------------

    //FOR CHAT ROOMS
    $(".chat-bubble").click(onChatBubbleClickHandler);
    $(".chatroom-container").click(onChatContainerClickHandler);
    $(".chatrooms-box").click(e => e.stopPropagation());
    $(".chatrooms-box").on("click", ".chatroom>img", onImgClickHandler);
    $(".chatrooms-box").on("click", ".chatroom", onChatRoomClickHandler);

    //FOR CHAT BOX
    $("body").on("click", ".chatbox-header", onChatBoxHeaderClickHandler);
    $(".chatbox-header>p").click(e => e.stopPropagation());
    $("body").on("click", ".close-btn", onCloseBtnClickHandler);
    $("body").on("keyup", ".message-input", onEnterPressHandler);
    $("body").on("click", ".send-btn", onSendBtnClickHandler);

    $(".chat-user").click(onChatBtnClickHandler);



}