{
    // calling function on loading of the script
    onLoad();
    // declaring global variables
    let data;
    let imageIndex = 0;

    // onload function
    async function onLoad() {
        // getting the id of the item from the template
        let id = $(".get-id").attr("id");
        // fetching images relating to item
        let response = await fetch(`/listings/fetch/${id}`, {
            method: "get",
            headers: { "x-requested-with": "XMLHttpRequest" }
        });
        data = await response.json();
        renderImage(data);
        // to Make the image visible with opacity transition
        $(".carousel-image, #large-image, .add-image").on("load", function () {
            $(this).css("opacity", "1");
        });

        var x = $("#target").zoom(4);
        x.setZoom(4)
    }
    // function to render the image on DOM
    function renderImage(data) {
        $(".carousel-image").css("opacity", "0");
        $("#large-image").css("opacity", "0");
        if (imageIndex > 0) $(".prev-btn").css("display", "block");
        if (imageIndex <= 0) $(".prev-btn").css("display", "none");
        if (imageIndex >= data.images.length - 1) $(".next-btn").css("display", "none");
        if (imageIndex < data.images.length - 1) $(".next-btn").css("display", "block");

        setTimeout(function () {
            if (data && data.images.length) {
                $(".carousel-image").attr("src", data.images[imageIndex].image);
                $("#large-image").attr("src", data.images[imageIndex].image);
                $(".viewer img").attr("src", data.images[imageIndex].image);



            } else {
                $(".carousel-image").attr({
                    "src": "/static/images/icons/add_image_white.png",
                    "class": "add-image"
                }).css({
                    "height": "40vh",
                    "margin": "20vh auto"
                });
                $(".next-btn").css("display", "none");
                $(".prev-btn").css("display", "none");
            }
        }, 500);
    }

    // ------------------EVENT HANDLERS--------------------

    // next button click handler
    function nextBtnClickHandler() {
        imageIndex++;
        if (imageIndex >= data.images.length) { imageIndex--; return; };
        renderImage(data);
    }
    // previous button click handler
    function prevBtnClickHandler() {
        imageIndex--;
        if (imageIndex < 0) { imageIndex++; return; };
        renderImage(data);
    }

    function closeBtnClickHandler() {
        $(".large-image-container").css("opacity", "0")
        setTimeout(() => {
            $(".large-image-container").css("display", "none")


        }, 300);
    }

    // for enlarge image
    function onImageClickHandler() {
        $(".large-image-container").css("display", "flex")
        $(".large-image-container").get(0).offsetHeight;
        $(".large-image-container").css("opacity", "1");
    }

    // to mail the user if someone is interested in their product
    async function onNotifyUserClickHandler(event) {
        let response = await fetch(`/listings/${event.target.id}/notify-user/mail/`);
        let data = await response.json();
        if (response.ok) toastr.success(data.message);
        else toastr.error(data.message);
    }

    function arrowBtnClickHandler(e){
        if (e.which === 37) prevBtnClickHandler();
        else if (e.which === 39) nextBtnClickHandler();
        else if (e.which === 70) {
            if($(".large-image-container").css("display") === "none") onImageClickHandler();
            else if($(".large-image-container").css("display") === "flex") closeBtnClickHandler();
        }
        else if (e.which === 8 && $(".large-image-container").css("display") === "flex") closeBtnClickHandler();

    }
    // ------------------EVENT LISTENERS--------------------

    $(".next-btn").click(nextBtnClickHandler);
    $(".img-close-btn").click(closeBtnClickHandler);
    $(".original").click(onImageClickHandler);
    $(".prev-btn").click(prevBtnClickHandler);
    $(".notify-user").click(onNotifyUserClickHandler);
    $(document).on("keydown" ,arrowBtnClickHandler );

}
