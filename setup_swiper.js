$(document).ready(function () {
    //initialize swiper when document ready
    var mySwiper = new Swiper ('.swiper-container', {
        direction: 'horizontal',
        slidesPerView: 3,
        spaceBetween: 30,

        observer: true, 
        observeParents: true, 

        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
});    