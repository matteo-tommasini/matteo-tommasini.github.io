/* Copyright 2017 Matteo Tommasini */

$(document).ready(function(){
  /* Initialization of the AOS animations */
  AOS.init({
    duration: 1000,
    disable: 'mobile',
  });

  /* Behaviour of the dropdown menu for very small screens */
  $(".dropbtn").click(function(){
    if( $("#myDropdown").hasClass("dropbtn-open")) {
      $("#myDropdown").css("display","none");
      $("#myDropdown").addClass("dropbtn-close");
      $("#myDropdown").removeClass("dropbtn-open");
  	}
    else {
 	  $("#myDropdown").css("display","block");
      $("#myDropdown").removeClass("dropbtn-close");
      $("#myDropdown").addClass("dropbtn-open");
    }
  });
  $("#myDropdown a").click(function(){
 	  $("#myDropdown").css("display","none");
      $("#myDropdown").addClass("dropbtn-close");
      $("#myDropdown").removeClass("dropbtn-open");
  });

  /* Change from big navigation bar to small navigation bar */
  var scrollTop = 0;
  $(window).scroll(function(){
    scrollTop = $(window).scrollTop();
     $('.counter').html(scrollTop);
    
    /* 1) Reduce the dimension of the navigation bar when scrolling down */
    if (scrollTop >= 100) {
      
      $("#navigation-bar").addClass('scrolled-nav');
      $("#navigation-bar").removeClass('navigation');
    } else if (scrollTop < 100) {
      $('#navigation-bar').addClass('navigation');
      $('#navigation-bar').removeClass('scrolled-nav');
    }
  });

  /* Add the name "Abstract" to each abstract (when displayed)*/
  $(".abstract").prepend('<span id = "abstract-name">Abstract: </span>');

  /* Hide and show the details of each scientific paper */
  $(".pub-title").click(function() {
    /* The next 2 instructions are useful only the first time that we call
    the big-container anywhere from the "teaching" section
     or the "publication" section */
    $("#big-container").css("display","block");
    $("#button-box").css("display","block");
    
    $("#big-container-title").html($(this).html());
    var det = $(this).parent().children(".details");
    $("#big-container-details").html(det.html());

    $("#big-container").addClass("boxclose-open");
    $("#big-container").removeClass("boxclose-closed");

    $("#button-box").addClass("boxclose-open");
    $("#button-box").removeClass("boxclose-closed");

    setTimeout(function(){
      $("body").css("overflow", "hidden");
      $("html").css("overflow", "hidden");
    },1000);
  });

  /* Hide and show the details of each teaching */

  $(".teaching-title").click(function() {
    /* The next 2 instructions are useful only the first time that we call
    the big-container anywhere from the "teaching" section
     or the "publication" section */
    $("#big-container").css("display","block");
    $("#button-box").css("display","block");

    $("#big-container-title").html($(this).html());
    var det = $(this).parent().children(".details");
    $("#big-container-details").html(det.html());

    $("#big-container").addClass("boxclose-open");
    $("#big-container").removeClass("boxclose-closed");

    $("#button-box").addClass("boxclose-open");
    $("#button-box").removeClass("boxclose-closed");
    
    setTimeout(function(){
      $("body").css("overflow", "hidden");
      $("html").css("overflow", "hidden");
    },1000);
  });

  /* Hide the details when clicking on the close button */
  $("#button-box").click(function(){
    $("#big-container").css("display","block");
    $("#button-box").css("display","block");

    $("#big-container").removeClass("boxclose-open");
    $("#big-container").addClass("boxclose-closed");

    $("#button-box").removeClass("boxclose-open");
    $("#button-box").addClass("boxclose-closed");

    $("body").css("overflow", "auto");
    $("html").css("overflow", "auto");

    /* These 2 lines cancel all the content from the box. This prevents the box to "remember"
    the scroll position in case it was scrolled during this iteration (otherwise, new content
    would be displayed as already scrolled) */
    $("#big-container-title").html("");
    $("#big-container-details").html("");
  });

});

/* Copyright 2017 Matteo Tommasini */
