{
    // calling onload function
    let previousSelected = "all";
    onLoad();


    async function onLoad() {
        let search = $("#search-query").text();
        if (search) {
            fetchItemsQuery(search);
            $(".item-search").val(search);
            return;
        }
        let category = $("#category-selected").text();
        fetchItemsQuery(category, true);
        previousSelected = category;
        setStyle(category);

        // for items animation
        $('.main-container').on('mouseenter', '.item-container', function () {
            const targetItem = $(this);
            $('.item-container').not(targetItem).css('transform', 'scale(0.95)');
        });

        $('.main-container').on('mouseleave', '.item-container', function () {
            $('.item-container').css('transform', 'scale(1)');
        });


    }

    // to fetch the items form the server
    async function fetchItems() {
        $(".items-container").html(`<div class="loading-spinner" id="loading-spinner"></div>`);
        showLoadingSpinner();
        let response = await fetch(`/api/listings/fetch/?all=True`);
        let data = await response.json();

        renderItems(data.data)
    }

    // to convert the price into currency format
    function formatPrice(price) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR"
        }).format(price).replace(".00", "");
    }

    // to render the items on DOM
    function renderItems(data) {
        hideLoadingSpinner();
        //if no items found
        if(!data.length){
            $(".items-container").append($("<p>").addClass("no-items-message").text("No items found! 😞"));
            return;
        }

        for (let i = data.length - 1; i >= 0; i--) {
            const item = data[i];
            let div = $("<div>").addClass("item-container on-listing-hover").attr("id", item.id);
            let img = $("<img>").attr("id", item.id).addClass("image-hover");
            if (item.images[0]) img.attr("src", item.images[0].image);
            else img.attr("src", "static/images/icons/image.png");
            let title = $("<p>").addClass("title").text(item.title).attr("id", item.id);
            let price = $("<p>").addClass("price").text(formatPrice(item.price)).attr("id", item.id);
            let descriptionDiv = $("<div>").addClass("description").attr("id", item.id);
            let description = $("<p>").text(item.description).attr("id", item.id);


            descriptionDiv.append(description)
            div.append(img, title, price, descriptionDiv);

            setTimeout(() => {
                div.appendTo(".items-container");
                div[0].offsetHeight;
                div.addClass("fade-in");
            }, (data.length - 1 - i) * 250);
        }
    }

    //to the the item according to query and filter
    async function fetchItemsQuery(query, filter) {
        $(".items-container").html(`<div class="loading-spinner" id="loading-spinner"></div>`);
        showLoadingSpinner();
        let data;
        if (filter) {
            if (query == "all") {
                fetchItems(); return;
            }
            let response = await fetch(`/api/listings/filter/?query=${query}`);
            data = await response.json();
        } else {
            let response = await fetch(`/api/listings/search/?query=${query}`);
            data = await response.json();
        }
            renderItems(data.data);

    }

    // to set the category style
    function setStyle(category) {
        let docWidth = $(document).width();
        if (docWidth < 768) {
            $(`#${previousSelected}`).css({ border: "1px solid var(--primaryColor)", backgroundColor: "rgba(0,0,0,0)", boxShadow: "0 0 5px 1px", color: "var(--primaryColor)", "fontWeight": "400" });
            $(`#${category}`).css({ border: "1px solid var(--hoverColor)", color: "var(--hoverColor)", "fontWeight": "800" });
        } else {
            $(`#${previousSelected}`).css({ border: "none", backgroundColor: "rgba(0,0,0,0)", boxShadow: "none", color: "var(--primaryColor)", "fontWeight": "400" });
            $(`#${previousSelected}`).removeClass('selected');
            $(`#${category}`).css({ color: "var(--hoverColor)", borderBottom: "2px solid var(--hoverColor)", "fontWeight": "800" });
            $(`#${category}`).addClass('selected');
        }
        previousSelected = category;
    }

    // to show the loading spinner
    function showLoadingSpinner() {
        $("#loading-spinner").show();
    }
//    to hide the loading spinner 
    function hideLoadingSpinner() {
        $("#loading-spinner").hide();
    }

    // --------------EVENT HANDLERS----------------

    // on click on the items
    function itemClickHandler(event) {
        let id = event.target.id;
        if (id) window.location.href = `/listings/fetch/${id}`;
    }

    function categoriesClickHandler(event) {
        let query = $(event.target).attr("value");
        setStyle(event.target.id);
        fetchItemsQuery(query, true);
    }

    function onSearchInputFocusHandler() {
        $(".inner-div").css({ "border": "2px solid var(--buttonColor)", "background-color": "var(--primaryColor)" });
    }

    function onSearchInputBlurHandler() {
        $(".inner-div").css({ "border": "2px solid var(--borderColor)", "background-color": "var(--borderColor)" });
    }

    function searchInputEnterPressHandler(event) {
        let val = event.target.value;
        if (!val) fetchItems()
        else fetchItemsQuery(val);
    }

    function searchBtnClickHandler() {
        let val = $(".item-search").val();
        if (!val) return;
        fetchItemsQuery(val);
    }

    function categoriesMouseOverHandler() {
        if (this.id == previousSelected) return;
        $(this).css({ "color": "var(--hoverColor)", "fontWeight": 800 })

    }
    function categoriesMouseoutHandler() {
        if (this.id == previousSelected) return;
        $(this).css({ "color": "var(--primaryColor)", "fontWeight": 400 })

    }

    function searchInputFocusHandler() {
        $(".search-container>div").css("border", "2px solid var(--hoverColor)")
        $(".search-text").css("backgroundColor", "var(--hoverColor)")
    }
    function searchInputBlurHandler() {
        $(".search-container>div").css("border", "2px solid var(--primaryColor)")
        $(".search-text").css("backgroundColor", "var(--primaryColor)")
    }


    // --------------EVENT LISTENERS----------------
    $(".categories>li").each((index, item) => {
        $(item).click(categoriesClickHandler);
        $(item).on("mouseover", categoriesMouseOverHandler);
        $(item).on("mouseout", categoriesMouseoutHandler);
    });

    $(".items-container").on("click", ".item-container", itemClickHandler);
    $(".item-search").on("focus", searchInputFocusHandler);
    $(".item-search").on("blur", searchInputBlurHandler);
    $(".item-search").on("keyup", searchInputEnterPressHandler);
    $(".search-text").click(searchBtnClickHandler);
}