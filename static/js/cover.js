{

    // -------------------EVENT HANDLERS--------------
    function onCategoriesHoverHandler(){
        let docWidth=$(document).width();
        
        if(docWidth<768) $(".categories").css("height","550px")  
        else if(docWidth<1024)$(".categories").css("height","400px")       
        else $(".categories").css("height","200px")
 
        $("header").css("backgroundColor","rgba(231, 231, 231, 0.5)")
        $(".categories-btn").css("backgroundColor","white")
        
        
    }
    
    function onCategoriesMouseOutHandler(){
        $(".categories").css("height","0px")
        $("header").css("backgroundColor","rgb(255, 214, 127)")
        $(".categories-btn").css("backgroundColor","rgba(231, 231, 231, 0)")
    }

    function onCategoriesItemsClickHandler(event){
        window.location.href=`/home/?category=${event.target.id}`
    }
    
    function onSearchBtnClickHandler(){
        let val=$(".item-search").val();
        if(val) window.location.href=`/home/?search=${val}`
    }
    
    function onEnterPressHandler(event){
        if(event.key=="Enter"){
            let val=event.target.value;
            if(val) window.location.href=`/home/?search=${val}`
        }
    }
    
    
    // -------------------EVENT LISTENERS--------------

    $(".categories-btn").on("mouseover",onCategoriesHoverHandler);
    $(".categories-btn").on("mouseout",onCategoriesMouseOutHandler);

    $(".categories-ul").on("click" ,"li",onCategoriesItemsClickHandler);

    $(".search-text").on("click", onSearchBtnClickHandler);
    $(".item-search").on("keypress", onEnterPressHandler);




}